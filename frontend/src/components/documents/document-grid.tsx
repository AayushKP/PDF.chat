"use client";

import { useState } from "react";
import { FileText, MessageSquare, Layers, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { formatFilename } from "@/lib/utils";
import type { Document, Conversation } from "@/types";

interface DocumentGridProps {
  documents: Document[];
  conversations?: Conversation[];
  selectedDocumentId?: string | null;
  onSelectDocument: (document: Document) => void;
}

export function DocumentGrid({
  documents,
  conversations = [],
  selectedDocumentId,
  onSelectDocument,
}: DocumentGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    formatFilename(doc.filename)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header and Search filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Your Documents</h2>
          <p className="text-xs text-muted-foreground">
            Click any document to start or continue a conversation
          </p>
        </div>

        {documents.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Google Drive-Style Square Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              {searchTerm ? "No documents match your search query." : "No documents uploaded yet. Upload a PDF above to get started!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredDocuments.map((doc) => {
            const isSelected = selectedDocumentId === doc.id;
            const linkedConversations = conversations.filter(
              (c) => c.document_id === doc.id
            );
            const cleanName = formatFilename(doc.filename);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer aspect-square ${
                  isSelected
                    ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-md"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    PDF
                  </span>
                  {doc.status === "READY" ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Ready
                    </span>
                  ) : doc.status === "PROCESSING" ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
                      Processing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Failed
                    </span>
                  )}
                </div>

                {/* Big PDF File Icon Center */}
                <div className="flex flex-col items-center justify-center my-auto py-2">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
                  }`}>
                    <FileText className="h-8 w-8" />
                  </div>
                </div>

                {/* File Name Below & Details */}
                <div className="w-full text-center space-y-1">
                  <p
                    className="text-xs font-semibold tracking-tight truncate w-full text-foreground group-hover:text-primary transition-colors"
                    title={cleanName}
                  >
                    {cleanName}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    {doc.page_count !== undefined && doc.page_count > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Layers className="h-2.5 w-2.5" />
                        {doc.page_count} {doc.page_count === 1 ? "page" : "pages"}
                      </span>
                    )}
                    {linkedConversations.length > 0 && (
                      <span className="flex items-center gap-0.5 font-medium text-primary">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {linkedConversations.length} {linkedConversations.length === 1 ? "chat" : "chats"}
                      </span>
                    )}
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
