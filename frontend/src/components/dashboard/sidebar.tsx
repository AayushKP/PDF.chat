"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useConversations } from "@/hooks/use-chat-data";
import {
  FileText,
  MessageSquare,
  PanelLeft,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { useDeleteConversation } from "@/hooks/use-chat-data";

const navItems = [
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Conversations",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
];

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentConversationId = searchParams.get("conversationId");

  const { closeMobileSidebar } = useUIStore();
  const { data: conversations = [] } = useConversations();
  const deleteConversationMutation = useDeleteConversation();

  const handleNewChat = () => {
    closeMobileSidebar();
    router.push("/dashboard?new=true");
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversationMutation.mutate(id, {
      onSuccess: () => {
        if (currentConversationId === id) {
          router.push("/dashboard");
        }
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">
              PDF.chat
            </span>
            <span className="text-[11px] leading-none text-muted-foreground">
              AI Document Assistant
            </span>
          </div>
        </Link>
      </div>

      <div className="px-3 pb-3">
        {/* + New Chat Action Button */}
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="w-full justify-start gap-2 border-border/80 bg-muted/40 hover:bg-muted text-foreground font-medium shadow-none transition-colors"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span>New Chat</span>
        </Button>
      </div>

      <Separator className="mx-3 w-auto" />

      {/* Main Navigation */}
      <nav className="space-y-1 p-3 pt-3">
        <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" && !currentConversationId
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-muted font-semibold text-foreground border border-border/50"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Recent Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between px-3 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Chats
          </p>
          <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-medium">
            {conversations.length}
          </span>
        </div>

        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground/70 italic">
            No chats yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.slice(0, 15).map((conv) => {
              const isActive = currentConversationId === conv.id;
              return (
                <Link
                  key={conv.id}
                  href={`/dashboard?conversationId=${conv.id}`}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-all",
                    isActive
                      ? "bg-muted font-semibold text-foreground border border-border/40"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{conv.title || "Untitled Chat"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <Separator className="mb-3" />
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="text-xs font-medium text-muted-foreground">
            PDF.chat v1.0
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            Powered by Gemini 2.5 & Qdrant
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const { mobileSidebarOpen, toggleMobileSidebar } = useUIStore();

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={toggleMobileSidebar}>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}

export function SidebarToggle() {
  const { toggleSidebar, toggleMobileSidebar } = useUIStore();

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4.5 w-4.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={toggleMobileSidebar}
        aria-label="Toggle mobile menu"
      >
        <PanelLeft className="h-4.5 w-4.5" />
      </Button>
    </>
  );
}
