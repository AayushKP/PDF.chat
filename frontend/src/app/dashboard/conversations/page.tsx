"use client";

import { useRouter } from "next/navigation";
import { useConversations, useDocuments, useDeleteConversation } from "@/hooks/use-chat-data";
import { MessageSquare, FileText, Trash2, ArrowRight, Clock, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFilename, formatDate } from "@/lib/utils";

export default function ConversationsPage() {
  const router = useRouter();
  const { data: conversations = [], isLoading: isLoadingConvs } = useConversations();
  const { data: documents = [] } = useDocuments();
  const deleteConversationMutation = useDeleteConversation();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversationMutation.mutate(id);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-6 py-6 space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Conversations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and view all your document chat histories
          </p>
        </div>

        <Button
          onClick={() => router.push("/dashboard?new=true")}
          variant="outline"
          className="gap-2 text-xs rounded-xl border-border/80 bg-muted/40 hover:bg-muted text-foreground shadow-none"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Conversations List */}
      {isLoadingConvs ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-base">No conversations yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Upload a document or select one from your workspace to start your first AI conversation.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              size="sm"
              className="mt-2 text-xs"
            >
              Go to Workspace
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {conversations.map((conv) => {
            const matchedDoc = documents.find((d) => d.id === conv.document_id);
            const docName = matchedDoc ? formatFilename(matchedDoc.filename) : null;

            return (
              <div
                key={conv.id}
                onClick={() => router.push(`/dashboard?conversationId=${conv.id}`)}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-sm line-clamp-2 tracking-tight group-hover:text-primary transition-colors">
                    {conv.title || "Untitled Conversation"}
                  </h3>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
                  {docName && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="truncate font-medium">{docName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(conv.created_at)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open chat
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
