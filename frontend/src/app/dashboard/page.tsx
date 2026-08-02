"use client";

import { useState, useEffect } from "react";
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
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationIdParam);

  // Sync state with URL params
  useEffect(() => {
    if (isNewChat) {
      setSelectedDocument(null);
      setActiveConversationId(null);
    } else if (conversationIdParam) {
      setActiveConversationId(conversationIdParam);
    } else if (documentIdParam && documents.length > 0) {
      const doc = documents.find((d) => d.id === documentIdParam);
      if (doc) {
        setSelectedDocument(doc);
      }
    }
  }, [conversationIdParam, documentIdParam, isNewChat, documents]);

  // When activeConversation loads from URL param, match its document_id to selectedDocument
  useEffect(() => {
    if (activeConversation && activeConversation.document_id && documents.length > 0) {
      const matchedDoc = documents.find((d) => d.id === activeConversation.document_id);
      if (matchedDoc) {
        setSelectedDocument(matchedDoc);
      }
    }
  }, [activeConversation, documents]);

  const handleNewChat = () => {
    setSelectedDocument(null);
    setActiveConversationId(null);
    router.push("/dashboard?new=true");
  };

  const handleConversationCreated = (newId: string) => {
    setActiveConversationId(newId);
    router.push(`/dashboard?conversationId=${newId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
      <ChatInterface
        activeDocument={selectedDocument}
        conversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectDocument={setSelectedDocument}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
