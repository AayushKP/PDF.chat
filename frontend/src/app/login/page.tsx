"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Failed to initiate login. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-muted animate-spin border-t-primary" />
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-primary/[0.03] blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[60%] rounded-full bg-primary/[0.05] blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[20%] right-[10%] h-[40%] w-[30%] rounded-full bg-primary/[0.02] blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Login card */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to PDF.chat
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
              Chat with your PDF documents using AI. Upload, ask questions, and get instant answers.
            </p>
          </div>

          {/* Login button */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="relative w-full h-12 gap-3 text-sm font-medium transition-all duration-200 hover:shadow-md hover:border-primary/30"
            >
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-muted animate-spin border-t-foreground" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </span>
            </Button>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive text-center">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
              Secure Login
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-[11px] text-muted-foreground/50 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and secure.
          </p>
        </div>

        {/* Bottom branding */}
        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          Powered by Gemini 2.5 Flash &middot; Built with ❤️
        </p>
      </div>
    </div>
  );
}
