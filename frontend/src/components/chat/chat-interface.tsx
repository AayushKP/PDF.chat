"use client";

import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  FileText,
  Loader2,
  Sparkles,
  BookOpen,
  Plus,
  X,
  ArrowUp,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSendChat, useUploadDocument, useConversation } from "@/hooks/use-chat-data";
import { formatFilename } from "@/lib/utils";
import { FormattedMarkdown } from "@/components/chat/formatted-markdown";
import type { Document, ChatMessage, Citation } from "@/types";

interface ChatInterfaceProps {
  activeDocument: Document | null;
  conversationId: string | null;
  onNewChat: () => void;
  onSelectDocument: (document: Document | null) => void;
  onConversationCreated?: (conversationId: string) => void;
}

const promptSuggestions = [
  "Summarize key insights",
  "Extract main conclusions",
  "List important dates & metrics",
  "Explain main methodology",
];

export function ChatInterface({
  activeDocument,
  conversationId,
  onNewChat,
  onSelectDocument,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [inputQuestion, setInputQuestion] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query hooks
  const sendChatMutation = useSendChat();
  const uploadDocumentMutation = useUploadDocument();
  const { data: conversationData, isLoading: isLoadingConv } = useConversation(conversationId);

  const [prevConversationId, setPrevConversationId] = useState<string | null>(conversationId);

  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    if (!conversationId && !activeDocument) {
      setLocalMessages([]);
    }
  }

  const displayedMessages: ChatMessage[] =
    conversationId && conversationData?.messages && conversationData.messages.length > 0
      ? conversationData.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          citations: m.citations,
          created_at: m.created_at,
        }))
      : localMessages;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages, sendChatMutation.isPending]);

  const handleSend = (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question || sendChatMutation.isPending) return;

    if (!activeDocument && !conversationId) {
      alert("Please attach or select a PDF document first before sending a message.");
      return;
    }

    setInputQuestion("");

    // Optimistically add user message
    const userMsg: ChatMessage = {
      role: "user",
      content: question,
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    const payload = {
      question,
      ...(conversationId ? { conversation_id: conversationId } : {}),
      ...(activeDocument ? { document_id: activeDocument.id } : {}),
    };

    sendChatMutation.mutate(payload, {
      onSuccess: (data) => {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.answer,
          citations: data.sources,
        };
        setLocalMessages((prev) => [...prev, assistantMsg]);

        if (data.conversation_id && onConversationCreated) {
          onConversationCreated(data.conversation_id);
        }
      },
      onError: (error) => {
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: `Sorry, an error occurred: ${error.message || "Failed to generate answer."}`,
        };
        setLocalMessages((prev) => [...prev, errorMsg]);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Attachment upload trigger directly from chat bar
  const handleAttachmentUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert("File size exceeds 30MB limit.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    uploadDocumentMutation.mutate(formData, {
      onSuccess: (newDoc) => {
        onSelectDocument(newDoc);
      },
      onError: (err) => {
        alert(`Upload error: ${err.message}`);
      },
    });
  };

  const topTitle = conversationData?.title || (activeDocument ? formatFilename(activeDocument.filename) : "");

  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background overflow-hidden relative">
      {/* Hidden file input for paperclip upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleAttachmentUpload(e.target.files[0]);
          }
        }}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 shrink-0 border-b border-border/20">
        <div className="flex items-center gap-2 truncate max-w-[70%]">
          {topTitle && (
            <span className="text-xs font-semibold tracking-tight text-foreground truncate">
              {topTitle}
            </span>
          )}
          {activeDocument && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full shrink-0">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {formatFilename(activeDocument.filename)}
              </span>
              <button
                onClick={() => onSelectDocument(null)}
                className="ml-1 hover:text-red-700"
                title="Detach document"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="gap-1 text-xs border-border/60 hover:bg-muted shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Main Chat Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        {isLoadingConv ? (
          <div className="flex h-full items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayedMessages.length === 0 ? (
          /* Centered ChatGPT Initial / Empty State */
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-6 text-center w-full lg:w-[70%] max-w-5xl mx-auto space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border shadow-sm text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                What can I help you analyze today?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Attach a PDF document or select one from your drive to get instant, citation-backed answers.
              </p>
            </div>

            {/* Active Document Indicator or Attach CTA */}
            {activeDocument ? (
              <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-1.5 rounded-xl text-xs font-medium">
                <FileText className="h-4 w-4 text-red-500 shrink-0" />
                <span>Attached: <strong>{formatFilename(activeDocument.filename)}</strong></span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onSelectDocument(null)}
                  className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadDocumentMutation.isPending}
                className="gap-2 text-xs rounded-xl border-border bg-card hover:bg-muted"
              >
                {uploadDocumentMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading PDF...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-3.5 w-3.5 text-primary" />
                    <span>Attach a PDF Document</span>
                  </>
                )}
              </Button>
            )}

            {/* Prompt Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl pt-2">
              {promptSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-left text-xs sm:text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground transition-all group shadow-sm"
                >
                  <span>{suggestion}</span>
                  <ArrowUp className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Conversation Stream - Responsive 70% Layout without Avatars */
          <div className="w-full lg:w-[70%] max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-10 sm:space-y-12">
            {displayedMessages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`space-y-3 ${isUser ? "max-w-[90%] sm:max-w-[80%]" : "w-full"}`}>
                    {isUser ? (
                      <div className="rounded-2xl px-5 py-3 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-zinc-800/90 text-zinc-100 border border-zinc-700/50 shadow-sm ml-auto w-fit">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full py-1 text-foreground space-y-3">
                        <FormattedMarkdown content={msg.content} />

                        {/* Sources & Citations - Clean Comma Separated Format */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground pt-3 border-t border-border/30">
                            <span className="font-semibold text-foreground/80 flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-primary" />
                              Sources:
                            </span>
                            <span className="font-medium text-foreground/90">
                              {Array.from(
                                new Set(
                                  msg.citations.map(
                                    (c: Citation) =>
                                      `Page ${c.page_number ?? c.page ?? "N/A"}`
                                  )
                                )
                              ).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sendChatMutation.isPending && (
              <div className="flex gap-3 items-center text-xs sm:text-sm text-muted-foreground py-2">
                <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Thinking & extracting answers...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Centered Input Bar */}
      <div className="w-full shrink-0 bg-background/90 backdrop-blur-md px-4 py-3 border-t-0">
        <div className="w-full lg:w-[70%] max-w-5xl mx-auto space-y-2">
          {uploadDocumentMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3.5 py-1.5 rounded-xl font-medium w-fit">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Indexing PDF...</span>
            </div>
          )}

          {activeDocument && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-xl w-fit font-medium border border-red-500/20 shadow-sm">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                {formatFilename(activeDocument.filename)}
              </span>
              <button
                type="button"
                onClick={() => onSelectDocument(null)}
                className="hover:text-red-700 ml-1 p-0.5 rounded"
                title="Remove attached PDF"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="relative flex items-center rounded-3xl border border-border/80 bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all px-3 py-1.5">
            {/* Paperclip attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF file"
              disabled={uploadDocumentMutation.isPending}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground rounded-full"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Input Text Area */}
            <textarea
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeDocument
                  ? `Ask anything about ${formatFilename(activeDocument.filename)}...`
                  : "Attach a PDF or type your question..."
              }
              rows={1}
              className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none max-h-32 min-h-[32px] text-foreground"
            />

            {/* Send Button */}
            <Button
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || sendChatMutation.isPending}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full shadow-sm"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/50">
            PDF.chat provides grounded answers based on uploaded documents.
          </p>
        </div>
      </div>
    </div>
  );
}
