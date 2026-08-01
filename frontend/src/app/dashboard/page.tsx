"use client";

import { useSession } from "@/lib/auth-client";
import { FileText, MessageSquare, Upload, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
          <span className="ml-2 inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your PDF.chat workspace. Upload documents and start conversations.
        </p>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Upload Documents Card */}
        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Upload Documents</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload PDF files to start asking questions about your documents.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Get started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Conversations Card */}
        <Link
          href="/dashboard/conversations"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Conversations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View and continue your past conversations with AI.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Documents Card */}
        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Your Documents</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse and manage all your uploaded PDF documents.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Browse files
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Empty state hint */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No recent activity</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first PDF document to get started with AI-powered document conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
