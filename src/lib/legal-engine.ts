/**
 * Client for the RAG legal engine (FastAPI on Hugging Face Spaces).
 *
 * Protocol — the client sends `{ question }`, the server replies with:
 *   { type: "connection", model_loaded, rag_loaded }   once, after connecting
 *   { type: "processing", message }                    question accepted
 *   { type: "stream", token, partial, from_cache? }    `partial` is the full text so far
 *   { type: "response", answer, sources, from_cache? } final answer
 *   { type: "error", message }
 *
 * Only one question can be in flight per socket and messages carry no request
 * id, so cancelling closes the socket — that stops generation server-side and
 * guarantees stale tokens never leak into the next answer.
 */

export type EngineStatus = "connecting" | "online" | "reconnecting" | "offline";

export type Source = {
  law?: string;
  section?: string | number;
  section_title?: string;
};

export type EngineEvent =
  | { type: "waiting" }
  | { type: "processing"; cached: boolean }
  | { type: "token"; text: string; cached: boolean }
  | { type: "done"; text: string; sources: Source[]; cached: boolean }
  | { type: "error"; message: string };

type ServerMessage = {
  type?: string;
  message?: string;
  partial?: string;
  answer?: string;
  sources?: unknown;
  from_cache?: boolean;
};

type PendingRequest = {
  question: string;
  onEvent: (event: EngineEvent) => void;
  sent: boolean;
  idleTimer?: ReturnType<typeof setTimeout>;
};

export const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? "wss://yamraj047-gguf-with-rag.hf.space/ws";

/** Answers run on a CPU Space: first tokens can take a while, so only give up after a long silence. */
const IDLE_TIMEOUT_MS = 4 * 60_000;
const MAX_BACKOFF_MS = 15_000;

/** Fire-and-forget request that wakes a sleeping Space before the user asks anything. */
export function wakeEngine() {
  const url = ENGINE_URL.replace(/^ws/, "http").replace(/\/ws\/?$/, "/");
  fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => {});
}

export class LegalEngine {
  private socket: WebSocket | null = null;
  private status: EngineStatus = "connecting";
  private readonly listeners = new Set<() => void>();
  private attempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private request: PendingRequest | null = null;
  private running = false;

  getStatus = () => this.status;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  start() {
    if (this.running) return;
    this.running = true;
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.connect();
  }

  stop() {
    this.running = false;
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.clearReconnect();
    if (this.request) this.finish(this.request);
    this.dropSocket();
  }

  /** Ask a question. Returns a function that cancels it. */
  ask(question: string, onEvent: (event: EngineEvent) => void): () => void {
    if (this.request) {
      onEvent({ type: "error", message: "Another answer is still being written." });
      return () => {};
    }
    const request: PendingRequest = { question, onEvent, sent: false };
    this.request = request;
    this.armIdleTimer(request);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.send(request);
    } else {
      onEvent({ type: "waiting" });
      this.attempts = 0;
      this.clearReconnect();
      this.connect();
    }
    return () => this.cancel(request);
  }

  private cancel(request: PendingRequest) {
    if (this.request !== request) return;
    this.finish(request);
    if (request.sent) this.restart();
  }

  private connect() {
    if (!this.running || this.socket) return;
    if (!navigator.onLine) {
      this.setStatus("offline");
      return;
    }
    this.setStatus(this.attempts === 0 ? "connecting" : "reconnecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(ENGINE_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.attempts = 0;
      this.setStatus("online");
      if (this.request && !this.request.sent) this.send(this.request);
    };

    socket.onmessage = (event) => {
      if (this.socket === socket) this.handleMessage(event.data);
    };

    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      const request = this.request;
      if (request?.sent) {
        this.finish(request);
        request.onEvent({
          type: "error",
          message: "The connection to the legal engine dropped before the answer finished.",
        });
      }
      this.scheduleReconnect();
    };
  }

  private handleMessage(raw: unknown) {
    let data: ServerMessage;
    try {
      data = JSON.parse(String(raw));
    } catch {
      return;
    }

    const request = this.request;
    if (!request?.sent) return;
    this.armIdleTimer(request);
    const cached = Boolean(data.from_cache);

    switch (data.type) {
      case "processing":
        request.onEvent({ type: "processing", cached: cached || /cache/i.test(data.message ?? "") });
        break;
      case "stream":
        request.onEvent({ type: "token", text: (data.partial ?? "").trimStart(), cached });
        break;
      case "response":
        this.finish(request);
        request.onEvent({
          type: "done",
          text: (data.answer ?? "").trim(),
          sources: Array.isArray(data.sources) ? (data.sources as Source[]) : [],
          cached,
        });
        break;
      case "error":
        this.finish(request);
        request.onEvent({ type: "error", message: data.message || "The legal engine couldn't answer that." });
        break;
    }
  }

  private send(request: PendingRequest) {
    request.sent = true;
    this.socket?.send(JSON.stringify({ question: request.question }));
  }

  private armIdleTimer(request: PendingRequest) {
    clearTimeout(request.idleTimer);
    request.idleTimer = setTimeout(() => {
      if (this.request !== request) return;
      this.finish(request);
      request.onEvent({ type: "error", message: "The legal engine stopped responding. Please try again." });
      this.restart();
    }, IDLE_TIMEOUT_MS);
  }

  private finish(request: PendingRequest) {
    clearTimeout(request.idleTimer);
    if (this.request === request) this.request = null;
  }

  /** Throw away the current socket (ignoring its close event) and connect again. */
  private restart() {
    this.dropSocket();
    this.attempts = 0;
    this.clearReconnect();
    this.connect();
  }

  private dropSocket() {
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
  }

  private scheduleReconnect() {
    if (!this.running || this.reconnectTimer) return;
    this.attempts += 1;
    this.setStatus(navigator.onLine ? "reconnecting" : "offline");
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** Math.min(this.attempts - 1, 4)) + Math.random() * 500;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private handleOnline = () => {
    this.attempts = 0;
    this.clearReconnect();
    this.connect();
  };

  private handleOffline = () => this.setStatus("offline");

  private handleVisibility = () => {
    if (document.visibilityState === "visible" && !this.socket) {
      this.clearReconnect();
      this.connect();
    }
  };

  private setStatus(next: EngineStatus) {
    if (this.status === next) return;
    this.status = next;
    this.listeners.forEach((listener) => listener());
  }
}
