"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Settings className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">Settings coming soon</h3>
          <p className="text-sm text-muted-foreground">
            Account settings and preferences will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
