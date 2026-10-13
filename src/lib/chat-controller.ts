import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { track } from "./analytics";
import * as db from "./conversations";
import { LegalEngine, type EngineEvent, type Source } from "./legal-engine";
import { takeQuestion } from "./pending-question";
import { getSupabase } from "./supabase";

export const MAX_QUESTION_LENGTH = 2000;

export type MessageStatus = "waiting" | "processing" | "streaming" | "done" | "stopped" | "error";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: MessageStatus;
  sources?: Source[];
  cached?: boolean;
  error?: string;
  /** When the question was sent — drives the elapsed timer. */
  startedAt?: number;
  /** The question an assistant message answers, for retries. */
  question?: string;
  /** Written in this tab (as opposed to loaded from history): animate it. */
  live?: boolean;
};

export type Session = {
  messages: ChatMessage[];
  status: "loading" | "ready" | "missing" | "error";
};

export type ChatState = {
  user: User | null;
  conversations: db.Conversation[];
  conversationsStatus: "loading" | "ready" | "error";
  /** Keyed by conversation id, or by a draft key for a chat not saved yet. */
  sessions: Record<string, Session>;
  activeKey: string;
  generating: { key: string; messageId: string } | null;
  /** Read out by screen readers when an answer finishes. */
  announcement: string;
};

type Navigator = { push(href: string): void; replace(href: string): void };

type Inflight = {
  messageId: string;
  conversationId: Promise<string | null>;
  userSaved: Promise<unknown>;
  cancel: () => void;
};

const DRAFT_PREFIX = "draft:";
let draftCount = 0;

export const isDraftKey = (key: string) => key.startsWith(DRAFT_PREFIX);
const newDraftKey = () => `${DRAFT_PREFIX}${++draftCount}`;
const localId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : "Unknown error";

/**
 * Owns everything stateful in the chat app — auth, the conversation list, every
 * open conversation and the engine connection — outside React, so streaming
 * keeps going while the user moves between conversations.
 */
export class ChatController {
  readonly engine = new LegalEngine();
  private state: ChatState;
  private readonly listeners = new Set<() => void>();
  private navigator: Navigator | null = null;
  private inflight: Inflight | null = null;
  private creating = new Map<string, Promise<string | null>>();
  private cleanups: (() => void)[] = [];
  private running = false;

  constructor() {
    const key = newDraftKey();
    this.state = {
      user: null,
      conversations: [],
      conversationsStatus: "loading",
      sessions: { [key]: { messages: [], status: "ready" } },
      activeKey: key,
      generating: null,
      announcement: "",
    };
  }

  getState = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private set(update: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) {
    const patch = typeof update === "function" ? update(this.state) : update;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  start(navigator: Navigator) {
    if (this.running) return;
    this.running = true;
    this.navigator = navigator;
    this.engine.start();

    const supabase = getSupabase();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase holds its auth lock during this callback; calling back into the
      // client synchronously can deadlock, so defer the work (as its docs advise).
      setTimeout(() => {
        if (!this.running) return;
        if (event === "SIGNED_OUT") this.navigator?.replace("/");
        else if (session?.user) this.setUser(session.user);
      }, 0);
    });
    this.cleanups.push(() => data.subscription.unsubscribe());

    // getSession() waits for the OAuth code exchange when returning from Google.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!this.running) return;
      if (session) this.setUser(session.user);
      else this.redirectToLogin(error?.message);
    });
  }

  dispose() {
    this.running = false;
    this.inflight?.cancel();
    this.inflight = null;
    this.engine.stop();
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
    this.navigator = null;
    // A remount (e.g. React Strict Mode) must re-run auth setup.
    this.set({ user: null, generating: null });
  }

  private redirectToLogin(reason?: string) {
    const oauthError = new URLSearchParams(window.location.search).get("error_description");
    const message = oauthError ?? reason;
    this.navigator?.replace(message ? `/login?error=${encodeURIComponent(message)}` : "/login");
  }

  private setUser(user: User) {
    const isNewUser = this.state.user?.id !== user.id;
    this.set({ user });
    if (!isNewUser) return;
    void this.loadConversations(user.id);
    this.watchConversations(user.id);
    this.sendStashedQuestion();
  }

  // ─── Conversation list ────────────────────────────────────────────────────

  private async loadConversations(userId: string) {
    this.set({ conversationsStatus: "loading" });
    try {
      const list = await db.listConversations(userId);
      // Keep anything created while the list was loading.
      this.set((state) => ({
        conversations: [
          ...state.conversations.filter((c) => !list.some((loaded) => loaded.id === c.id)),
          ...list,
        ],
        conversationsStatus: "ready",
      }));
    } catch (error) {
      this.set({ conversationsStatus: "error" });
      toast.error("Couldn't load your conversations", { description: errorMessage(error) });
    }
  }

  retryConversations() {
    if (this.state.user) void this.loadConversations(this.state.user.id);
  }

  /** Keeps the list in sync with other tabs and devices (if Realtime is enabled for the table). */
  private watchConversations(userId: string) {
    const supabase = getSupabase();
    const filter = `user_id=eq.${userId}`;
    const channel = supabase
      .channel(`conversations:${userId}:${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations", filter }, (payload) =>
        this.upsertConversation(payload.new as db.Conversation),
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations", filter }, (payload) =>
        this.upsertConversation(payload.new as db.Conversation),
      )
      .subscribe();
    this.cleanups.push(() => void supabase.removeChannel(channel));
  }

  private upsertConversation(conversation: db.Conversation) {
    this.set((state) => {
      const exists = state.conversations.some((c) => c.id === conversation.id);
      const conversations = exists
        ? state.conversations.map((c) => (c.id === conversation.id ? { ...c, ...conversation } : c))
        : [conversation, ...state.conversations];
      return { conversations };
    });
  }

  async rename(id: string, title: string) {
    const clean = title.replace(/\s+/g, " ").trim().slice(0, 120);
    const previous = this.state.conversations;
    const current = previous.find((c) => c.id === id);
    if (!clean || !current || current.title === clean) return;

    this.set({ conversations: previous.map((c) => (c.id === id ? { ...c, title: clean } : c)) });
    try {
      await db.renameConversation(id, clean);
    } catch (error) {
      this.set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, title: current.title } : c)),
      }));
      toast.error("Couldn't rename conversation", { description: errorMessage(error) });
    }
  }

  async remove(id: string) {
    const removed = this.state.conversations.find((c) => c.id === id);
    if (!removed) return;
    if (this.state.generating?.key === id) this.stop();
    if (this.state.activeKey === id) this.newChat();
    this.set((state) => ({ conversations: state.conversations.filter((c) => c.id !== id) }));

    try {
      await db.deleteConversation(id);
      this.set((state) => ({ sessions: omit(state.sessions, id) }));
      toast.success("Conversation deleted");
    } catch (error) {
      this.set((state) => ({
        conversations: [...state.conversations, removed].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      }));
      toast.error("Couldn't delete conversation", { description: errorMessage(error) });
    }
  }

  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) toast.error("Couldn't sign out", { description: error.message });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  /** Sync with the URL: `routeId` is a conversation id or "new". */
  open(routeId: string) {
    const { activeKey, sessions } = this.state;

    if (routeId === "new") {
      if (!isDraftKey(activeKey) || (sessions[activeKey]?.messages.length ?? 0) > 0) {
        this.activate(newDraftKey(), { messages: [], status: "ready" });
      }
      this.sendStashedQuestion();
      return;
    }

    if (activeKey === routeId) return;
    const cached = sessions[routeId];
    if (cached?.status === "ready") {
      this.activate(routeId);
      return;
    }
    this.activate(routeId, { messages: [], status: "loading" });
    void this.loadSession(routeId);
  }

  newChat() {
    this.open("new");
    this.navigator?.push("/chat/new");
  }

  reloadActive() {
    const key = this.state.activeKey;
    if (isDraftKey(key)) return;
    this.setSession(key, { messages: [], status: "loading" });
    void this.loadSession(key);
  }

  private activate(key: string, session?: Session) {
    this.set((state) => {
      let sessions = state.sessions;
      // Forget an untouched draft we're leaving.
      const leaving = sessions[state.activeKey];
      if (isDraftKey(state.activeKey) && state.activeKey !== key && leaving?.messages.length === 0) {
        sessions = omit(sessions, state.activeKey);
      }
      if (session) sessions = { ...sessions, [key]: session };
      return { sessions, activeKey: key };
    });
  }

  private async loadSession(id: string) {
    try {
      const rows = await db.loadMessages(id);
      const missing = rows.length === 0 && !(await db.conversationExists(id));
      this.setSession(id, {
        status: missing ? "missing" : "ready",
        messages: rows.map((row) => ({
          id: String(row.id ?? localId()),
          role: row.role,
          content: row.content ?? "",
          sources: Array.isArray(row.sources) ? row.sources : undefined,
          status: "done",
        })),
      });
    } catch (error) {
      // 22P02: not a valid uuid, so it can't be a conversation.
      const code = (error as { code?: string }).code;
      this.setSession(id, { messages: [], status: code === "22P02" ? "missing" : "error" });
    }
  }

  // ─── Asking ───────────────────────────────────────────────────────────────

  async send(text: string) {
    const question = text.trim().slice(0, MAX_QUESTION_LENGTH);
    const { user, generating, activeKey, sessions } = this.state;
    if (!question || !user || generating || sessions[activeKey]?.status !== "ready") return;

    const reply: ChatMessage = {
      id: localId(),
      role: "assistant",
      content: "",
      status: "waiting",
      startedAt: Date.now(),
      question,
      live: true,
    };
    this.updateSession(activeKey, (session) => ({
      ...session,
      messages: [...session.messages, { id: localId(), role: "user", content: question, status: "done" }, reply],
    }));

    const conversationId = this.ensureConversation(activeKey, question);
    const userSaved = conversationId
      .then((id) => (id ? db.saveMessage(id, { role: "user", content: question }) : undefined))
      .catch((error) => this.reportSaveError(error));

    this.ask(reply.id, question, conversationId, userSaved);
    track("ask_question", { new_conversation: isDraftKey(activeKey), length: question.length });
  }

  stop() {
    const inflight = this.inflight;
    if (!inflight) return;
    this.inflight = null;
    inflight.cancel();

    const message = this.findMessage(inflight.messageId);
    this.patchMessage(inflight.messageId, { status: "stopped" });
    this.set({ generating: null });
    if (message?.content.trim()) this.persistAnswer(inflight, message.content, message.sources);
    track("stop_answer");
  }

  retry(messageId: string) {
    const key = this.findSessionKey(messageId);
    const message = key ? this.findMessage(messageId) : undefined;
    if (!key || !message?.question || this.state.generating) return;

    this.patchMessage(messageId, {
      status: "waiting",
      content: "",
      error: undefined,
      sources: undefined,
      cached: false,
      startedAt: Date.now(),
      live: true,
    });

    // A draft key here means saving the conversation failed earlier; try again.
    const question = message.question;
    const conversationId = this.ensureConversation(key, question);
    const userSaved = isDraftKey(key)
      ? conversationId
          .then((id) => (id ? db.saveMessage(id, { role: "user", content: question }) : undefined))
          .catch((error) => this.reportSaveError(error))
      : Promise.resolve();
    this.ask(messageId, question, conversationId, userSaved);
    track("retry_answer");
  }

  private ask(messageId: string, question: string, conversationId: Promise<string | null>, userSaved: Promise<unknown>) {
    const key = this.findSessionKey(messageId);
    if (!key) return;
    this.set({ generating: { key, messageId } });

    const inflight: Inflight = { messageId, conversationId, userSaved, cancel: () => {} };
    this.inflight = inflight;
    inflight.cancel = this.engine.ask(question, (event) => this.handleEngineEvent(inflight, event));
  }

  private handleEngineEvent(inflight: Inflight, event: EngineEvent) {
    if (this.inflight !== inflight) return;
    const id = inflight.messageId;

    switch (event.type) {
      case "waiting":
        this.patchMessage(id, { status: "waiting" });
        break;
      case "processing":
        this.patchMessage(id, { status: "processing", cached: event.cached });
        break;
      case "token":
        this.patchMessage(id, { status: "streaming", content: event.text, cached: event.cached });
        break;
      case "done":
        this.inflight = null;
        this.patchMessage(id, { status: "done", content: event.text, sources: event.sources, cached: event.cached });
        this.set({ generating: null, announcement: "Answer ready." });
        this.persistAnswer(inflight, event.text, event.sources);
        break;
      case "error":
        this.inflight = null;
        this.patchMessage(id, { status: "error", error: event.message });
        this.set({ generating: null, announcement: "The answer failed." });
        break;
    }
  }

  private persistAnswer(inflight: Inflight, content: string, sources?: Source[]) {
    if (!content.trim()) return;
    void Promise.all([inflight.conversationId, inflight.userSaved])
      .then(([id]) => (id ? db.saveMessage(id, { role: "assistant", content, sources }) : undefined))
      .catch((error) => this.reportSaveError(error));
  }

  /** Resolves to the conversation id, creating the conversation the first time a draft is used. */
  private ensureConversation(key: string, question: string): Promise<string | null> {
    if (!isDraftKey(key)) return Promise.resolve(key);
    const pending = this.creating.get(key);
    if (pending) return pending;
    const user = this.state.user;
    if (!user) return Promise.resolve(null);

    const created = db
      .createConversation(user.id, db.titleFromQuestion(question))
      .then(
        (conversation) => {
          this.upsertConversation(conversation);
          this.rekey(key, conversation.id);
          if (this.state.activeKey === conversation.id) this.navigator?.replace(`/chat/${conversation.id}`);
          return conversation.id;
        },
        (error) => {
          this.reportSaveError(error);
          return null;
        },
      )
      .finally(() => this.creating.delete(key));
    this.creating.set(key, created);
    return created;
  }

  private rekey(from: string, to: string) {
    this.set((state) => {
      const session = state.sessions[from];
      if (!session) return {};
      return {
        sessions: { ...omit(state.sessions, from), [to]: session },
        activeKey: state.activeKey === from ? to : state.activeKey,
        generating: state.generating?.key === from ? { ...state.generating, key: to } : state.generating,
      };
    });
  }

  private sendStashedQuestion() {
    const { user, activeKey, sessions } = this.state;
    if (!user || !isDraftKey(activeKey) || sessions[activeKey]?.messages.length) return;
    const question = takeQuestion();
    if (question) void this.send(question);
  }

  private reportSaveError(error: unknown) {
    toast.error("Couldn't save to your history", { description: errorMessage(error) });
  }

  // ─── Session helpers ──────────────────────────────────────────────────────

  private setSession(key: string, session: Session) {
    this.set((state) => ({ sessions: { ...state.sessions, [key]: session } }));
  }

  private updateSession(key: string, update: (session: Session) => Session) {
    this.set((state) => {
      const session = state.sessions[key];
      return session ? { sessions: { ...state.sessions, [key]: update(session) } } : {};
    });
  }

  private findSessionKey(messageId: string) {
    return Object.keys(this.state.sessions).find((key) =>
      this.state.sessions[key].messages.some((m) => m.id === messageId),
    );
  }

  private findMessage(messageId: string) {
    for (const session of Object.values(this.state.sessions)) {
      const message = session.messages.find((m) => m.id === messageId);
      if (message) return message;
    }
  }

  private patchMessage(messageId: string, patch: Partial<ChatMessage>) {
    const key = this.findSessionKey(messageId);
    if (!key) return;
    this.updateSession(key, (session) => ({
      ...session,
      messages: session.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
    }));
  }
}

function omit<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}
