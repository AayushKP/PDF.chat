"use client";

import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          Your chat history with documents will appear here.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No conversations yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by uploading a document and asking questions.
          </p>
        </div>
      </div>
    </div>
  );
}
