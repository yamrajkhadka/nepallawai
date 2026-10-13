import type { Source } from "./legal-engine";
import { getSupabase } from "./supabase";

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[] | null;
  created_at: string;
};

const CONVERSATION_COLUMNS = "id, title, created_at";

export async function listConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(userId: string, title: string): Promise<Conversation> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .insert({ user_id: userId, title })
    .select(CONVERSATION_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function renameConversation(id: string, title: string) {
  const { data, error } = await getSupabase()
    .from("conversations")
    .update({ title })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  // Row-level security turns a forbidden update into a silent no-op.
  if (!data?.length) throw new Error("The database didn't allow this rename.");
}

export async function deleteConversation(id: string) {
  const supabase = getSupabase();
  const attempt = () => supabase.from("conversations").delete().eq("id", id).select("id");

  let { data, error } = await attempt();
  // 23503 = foreign key violation: messages exist and the FK has no ON DELETE CASCADE.
  if (error?.code === "23503") {
    const { error: messagesError } = await supabase.from("messages").delete().eq("conversation_id", id);
    if (messagesError) throw messagesError;
    ({ data, error } = await attempt());
  }
  if (error) throw error;
  if (!data?.length) throw new Error("The database didn't allow this delete.");
}

export async function conversationExists(id: string): Promise<boolean> {
  const { data, error } = await getSupabase().from("conversations").select("id").eq("id", id).maybeSingle();
  if (error) return false;
  return data !== null;
}

export async function loadMessages(conversationId: string): Promise<StoredMessage[]> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StoredMessage[];
}

export async function saveMessage(
  conversationId: string,
  message: { role: "user" | "assistant"; content: string; sources?: Source[] },
) {
  const { error } = await getSupabase()
    .from("messages")
    .insert({ conversation_id: conversationId, ...message });
  if (error) throw error;
}

/** A short, readable title from the first question of a conversation. */
export function titleFromQuestion(question: string, max = 52): string {
  const clean = question.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export type ConversationGroup = { label: string; items: Conversation[] };

/** Bucket conversations the way people remember them: Today, Yesterday, … */
export function groupConversations(items: Conversation[], now = new Date()): ConversationGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  const buckets = new Map<string, Conversation[]>();

  for (const item of items) {
    const time = new Date(item.created_at).getTime();
    let label: string;
    if (time >= startOfToday) label = "Today";
    else if (time >= startOfToday - day) label = "Yesterday";
    else if (time >= startOfToday - 7 * day) label = "Previous 7 days";
    else if (time >= startOfToday - 30 * day) label = "Previous 30 days";
    else label = new Date(time).toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const bucket = buckets.get(label);
    if (bucket) bucket.push(item);
    else buckets.set(label, [item]);
  }

  return Array.from(buckets, ([label, groupItems]) => ({ label, items: groupItems }));
}
