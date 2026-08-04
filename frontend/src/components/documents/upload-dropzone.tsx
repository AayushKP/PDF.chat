"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadDocument } from "@/hooks/use-chat-data";
import { formatFilename } from "@/lib/utils";
import type { Document } from "@/types";

interface UploadDropzoneProps {
  onUploadSuccess?: (document: Document) => void;
  compact?: boolean;
}

export function UploadDropzone({ onUploadSuccess, compact = false }: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError("File size exceeds 30MB limit.");
      return;
    }

    setError(null);
    setUploadingFile(file.name);

    const formData = new FormData();
    formData.append("file", file);

    uploadMutation.mutate(formData, {
      onSuccess: (newDoc) => {
        setUploadingFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(newDoc);
        }
      },
      onError: (err) => {
        setUploadingFile(null);
        setError(err.message || "Failed to upload document.");
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 text-xs"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              <span>Upload PDF</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${uploadMutation.isPending ? "pointer-events-none opacity-80" : ""}`}
      >
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">Processing & Ingesting PDF...</p>
              <p className="text-xs text-muted-foreground">
                {uploadingFile ? formatFilename(uploadingFile) : "Extracting text & generating vector embeddings"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Click to upload or drag & drop PDF here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF files up to 30MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
