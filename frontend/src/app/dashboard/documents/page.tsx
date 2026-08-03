"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useConversations,
} from "@/hooks/use-chat-data";
import {
  FileText,
  Upload,
  Search,
  MoreVertical,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFilename, formatDate } from "@/lib/utils";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading: isLoadingDocs } = useDocuments();
  const { data: conversations = [] } = useConversations();
  const uploadMutation = useUploadDocument();
  const deleteDocumentMutation = useDeleteDocument();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleFileUpload = (file: File) => {
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

    uploadMutation.mutate(formData, {
      onSuccess: (newDoc) => {
        router.push(`/dashboard?documentId=${newDoc.id}`);
      },
    });
  };

  const handleDocumentClick = (doc: Document) => {
    router.push(`/dashboard?documentId=${doc.id}`);
  };

  const handleDeleteDocument = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document? It will be removed from your database and vector search.")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    formatFilename(doc.filename)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 w-full overflow-y-auto px-6 py-6 space-y-6 pb-12">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recent Documents
          </h1>
          <p className="text-xs text-muted-foreground">
            Your uploaded PDF documents & AI knowledge base
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in Drive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            variant="outline"
            className="gap-2 text-xs rounded-xl border-border/80 bg-muted/40 hover:bg-muted text-foreground shadow-none"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Upload PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-sm">
            <span>Type</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-sm">
            <span>People</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-sm">
            <span>Modified</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-sm">
            <span>Source</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded ${
              viewMode === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded ${
              viewMode === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Documents Content */}
      {isLoadingDocs ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-sm">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              No documents uploaded
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              You haven&apos;t uploaded any PDF files yet. Upload your first PDF document to start chatting and extracting answers.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              variant="outline"
              className="mt-2 gap-2 text-xs rounded-xl border-border/80 bg-muted/40 hover:bg-muted text-foreground shadow-none"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Your First PDF</span>
            </Button>
          </div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <p className="text-xs text-muted-foreground">
            No documents match your search &quot;{searchTerm}&quot;.
          </p>
        </div>
      ) : (
        /* Google Drive Cards Grid Layout */
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              All Files ({filteredDocs.length})
            </h3>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredDocs.map((doc) => {
                  const cleanName = formatFilename(doc.filename);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer space-y-3"
                    >
                      {/* Top Card Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shrink-0 font-bold text-[10px]">
                            PDF
                          </div>
                          <span
                            className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors"
                            title={cleanName}
                          >
                            {cleanName}
                          </span>
                        </div>

                        {/* 3-dots Menu with Delete Option */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
                              title="More options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteDocument(e, doc.id)}
                              className="text-destructive focus:text-destructive cursor-pointer gap-2 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete File</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Card Middle: Preview Box */}
                      <div className="relative flex h-32 w-full items-center justify-center rounded-xl bg-muted/40 border border-border/40 p-4 transition-colors group-hover:bg-muted/60">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <FileText className="h-10 w-10 text-red-500/80 group-hover:scale-110 transition-transform" />
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-foreground">
                              {doc.page_count ? `${doc.page_count} Pages` : "PDF Document"}
                            </p>
                            {doc.chunk_count && (
                              <p className="text-[10px] text-muted-foreground">
                                {doc.chunk_count} vector chunks
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Row */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <span>{formatDate(doc.created_at)}</span>
                        <span className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
                          <Sparkles className="h-3 w-3" />
                          Chat
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View Mode */
              <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                {filteredDocs.map((doc) => {
                  const cleanName = formatFilename(doc.filename);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white font-bold text-xs">
                          PDF
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-xs text-foreground truncate">
                            {cleanName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {doc.page_count ? `${doc.page_count} pages` : "Document"} • Uploaded {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentClick(doc);
                          }}
                          className="gap-1.5 text-xs text-primary"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Chat</span>
                        </Button>

                        <button
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="text-muted-foreground hover:text-destructive p-1.5 rounded-md transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
