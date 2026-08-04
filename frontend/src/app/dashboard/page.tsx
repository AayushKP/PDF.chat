"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDocuments, useConversation } from "@/hooks/use-chat-data";
import { ChatInterface } from "@/components/chat/chat-interface";
import type { Document } from "@/types";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const conversationIdParam = searchParams.get("conversationId");
  const documentIdParam = searchParams.get("documentId");
  const isNewChat = searchParams.get("new") === "true";

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null);

  const { data: activeConversation } = useConversation(conversationIdParam);

  const { data: documents = [] } = useDocuments({
    refetchInterval: (query: any) => {
      const docs = (query.state.data ?? []) as Document[];
      
      // Determine the active document ID dynamically from state or URL parameters
      const activeDocId =
        selectedDocument?.id ||
        activeConversation?.document_id ||
        documentIdParam;

      if (!activeDocId) return false;

      // Find the active document in the current query's fetched list
      const activeDocInQuery =
        docs.find((d: Document) => d.id === activeDocId) ||
        (selectedDocument?.id === activeDocId ? selectedDocument : null);

      if (activeDocInQuery?.status !== "PROCESSING") return false;

      const elapsedMs = activeDocInQuery.created_at
        ? Date.now() - new Date(activeDocInQuery.created_at).getTime()
        : 0;

      // Fast polling (500ms) for the first 5 seconds after upload, otherwise back off to 3000ms
      return elapsedMs < 5000 ? 500 : 3000;
    },
  });

  // Sync active document with the list to capture background status updates
  const resolvedSelectedDoc = selectedDocument
    ? (documents as Document[]).find((d: Document) => d.id === selectedDocument.id) || selectedDocument
    : null;

  const activeDoc = isNewChat
    ? resolvedSelectedDoc
    : (resolvedSelectedDoc ||
        (activeConversation?.document_id
          ? (documents as Document[]).find((d: Document) => d.id === activeConversation.document_id) || null
          : null) ||
        (documentIdParam
          ? (documents as Document[]).find((d: Document) => d.id === documentIdParam) || null
          : null));

  // Derived state without useEffect
  const activeConversationId = isNewChat
    ? null
    : (createdConversationId || conversationIdParam);

  const handleNewChat = () => {
    setSelectedDocument(null);
    setCreatedConversationId(null);
    router.push("/dashboard?new=true");
  };

  const handleConversationCreated = (newId: string) => {
    setCreatedConversationId(newId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/dashboard?conversationId=${newId}`);
    }
    router.replace(`/dashboard?conversationId=${newId}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
      <ChatInterface
        activeDocument={activeDoc}
        conversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectDocument={setSelectedDocument}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
