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

  const { data: documents = [] } = useDocuments();
  const { data: activeConversation } = useConversation(conversationIdParam);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null);

  // Derived state without useEffect
  const activeConversationId = isNewChat
    ? null
    : (createdConversationId || conversationIdParam);

  const activeDoc = isNewChat
    ? selectedDocument
    : (selectedDocument ||
        (activeConversation?.document_id
          ? documents.find((d) => d.id === activeConversation.document_id) || null
          : null) ||
        (documentIdParam
          ? documents.find((d) => d.id === documentIdParam) || null
          : null));

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
