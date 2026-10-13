"use client";

import {
  ChevronsUpDown,
  Ellipsis,
  House,
  LoaderCircle,
  LogOut,
  PanelLeftClose,
  Pencil,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { centerOf, themeOptions } from "@/components/theme/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type Conversation, groupConversations } from "@/lib/conversations";
import { type ThemePreference, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useModifierKey } from "@/hooks/use-modifier-key";
import { useChat, useChatController } from "./chat-provider";

export function Sidebar({ onCollapse, onNavigate }: { onCollapse?: () => void; onNavigate?: () => void }) {
  const controller = useChatController();
  const mod = useModifierKey();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 pr-2 pl-4">
        <Logo />
        {onCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onCollapse} aria-label="Close sidebar">
                <PanelLeftClose />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Close sidebar <Kbd className="ml-1 border-background/20 bg-transparent text-background/70">{mod}B</Kbd>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="px-3 pt-1 pb-2">
        <Button
          variant="outline"
          onClick={() => {
            controller.newChat();
            onNavigate?.();
          }}
          className="h-10 w-full justify-start gap-2.5 rounded-xl bg-background px-3 shadow-soft dark:bg-background/40"
        >
          <SquarePen className="text-brand" /> New chat
          <span className="ml-auto hidden items-center gap-0.5 md:flex">
            <Kbd>{mod}</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>O</Kbd>
          </span>
        </Button>
      </div>

      <ConversationList onNavigate={onNavigate} />
      <UserMenu />
    </div>
  );
}

function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const controller = useChatController();
  const conversations = useChat((s) => s.conversations);
  const status = useChat((s) => s.conversationsStatus);
  const activeKey = useChat((s) => s.activeKey);
  const generatingKey = useChat((s) => s.generating?.key ?? null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const groups = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const matches = needle
      ? conversations.filter((c) => (c.title ?? "").toLowerCase().includes(needle))
      : conversations;
    return groupConversations(matches);
  }, [conversations, deferredQuery]);

  return (
    <>
      {conversations.length > 0 && (
        <div className="relative px-3 pb-1">
          <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-9 rounded-xl border-transparent bg-sidebar-accent/70 pl-9 shadow-none focus-visible:border-ring dark:bg-sidebar-accent/70"
          />
        </div>
      )}

      <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {status === "loading" && conversations.length === 0 ? (
          <div className="space-y-2 px-2 pt-5" aria-label="Loading conversations">
            <Skeleton className="h-3 w-16" />
            {[72, 88, 64, 80, 56].map((width) => (
              <Skeleton key={width} className="h-8 rounded-lg" style={{ width: `${width}%` }} />
            ))}
          </div>
        ) : status === "error" && conversations.length === 0 ? (
          <div className="px-3 pt-6 text-center text-sm text-muted-foreground">
            <p>Couldn&apos;t load your conversations.</p>
            <Button variant="link" size="sm" onClick={() => controller.retryConversations()}>
              Try again
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="px-4 pt-6 text-center text-sm leading-relaxed text-balance text-muted-foreground">
            {query ? "No conversations match your search." : "Your research will appear here. Ask your first question to begin."}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="sticky top-0 z-10 bg-sidebar px-3 pt-4 pb-1.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    active={conversation.id === activeKey}
                    answering={conversation.id === generatingKey}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </nav>
    </>
  );
}

function ConversationItem({
  conversation,
  active,
  answering,
  onNavigate,
}: {
  conversation: Conversation;
  active: boolean;
  answering: boolean;
  onNavigate?: () => void;
}) {
  const controller = useChatController();
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = conversation.title?.trim() || "Untitled conversation";

  return (
    <li className="group/item relative">
      {renaming ? (
        <RenameField
          initial={title}
          onDone={(next) => {
            setRenaming(false);
            if (next !== null) void controller.rename(conversation.id, next);
          }}
        />
      ) : (
        <Link
          href={`/chat/${conversation.id}`}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative flex h-9 items-center gap-2 rounded-lg pr-9 pl-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
            active
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          )}
        >
          {active && <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-brand" />}
          {answering && <LoaderCircle className="size-3.5 shrink-0 animate-spin text-brand" aria-label="Answering" />}
          <span className="truncate">{title}</span>
        </Link>
      )}

      {!renaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${title}`}
              className="absolute top-1 right-1 text-muted-foreground opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 max-md:opacity-100 data-[state=open]:opacity-100"
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-40">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{title}&rdquo; and all of its messages will be permanently deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void controller.remove(conversation.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function RenameField({ initial, onDone }: { initial: string; onDone: (title: string | null) => void }) {
  const done = useRef(false);
  const finish = (value: string | null) => {
    if (done.current) return;
    done.current = true;
    onDone(value);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        finish(new FormData(event.currentTarget).get("title")?.toString() ?? null);
      }}
    >
      <Input
        name="title"
        defaultValue={initial}
        autoFocus
        maxLength={120}
        aria-label="Conversation title"
        onFocus={(event) => event.currentTarget.select()}
        onBlur={(event) => finish(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") finish(null);
        }}
        className="h-9 rounded-lg bg-background"
      />
    </form>
  );
}

function UserMenu() {
  const controller = useChatController();
  const user = useChat((s) => s.user);
  const { preference, setTheme } = useTheme();
  const trigger = useRef<HTMLButtonElement>(null);
  if (!user) return null;

  const meta = user.user_metadata as { full_name?: string; name?: string; avatar_url?: string; picture?: string };
  const name = meta.full_name ?? meta.name ?? user.email ?? "Your account";
  const avatar = meta.avatar_url ?? meta.picture;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="shrink-0 border-t border-sidebar-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={trigger}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-sidebar-accent"
          >
            <Avatar className="size-8">
              {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
              <AvatarFallback className="bg-brand-soft text-xs font-semibold text-brand">{initials}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              {user.email && <span className="block truncate text-xs text-muted-foreground">{user.email}</span>}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-(--radix-dropdown-menu-trigger-width) min-w-60">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={preference}
            onValueChange={(value) => setTheme(value as ThemePreference, centerOf(trigger.current))}
          >
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon /> {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">
              <House /> Home page
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void controller.signOut()}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
