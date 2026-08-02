"use client";

import ReactMarkdown from "react-markdown";

interface FormattedMarkdownProps {
  content: string;
}

export function FormattedMarkdown({ content }: FormattedMarkdownProps) {
  return (
    <div className="markdown-content text-sm sm:text-base leading-relaxed text-foreground space-y-4">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-3 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-foreground mt-5 mb-2.5 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2 tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2 leading-relaxed text-foreground/95">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-3 space-y-1.5 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-3 space-y-2 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          hr: () => <hr className="my-6 border-t border-border/60" />,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium">
                {children}
              </code>
            ) : (
              <pre className="my-4 overflow-x-auto rounded-2xl bg-zinc-900/90 p-4 font-mono text-xs sm:text-sm text-zinc-100 border border-zinc-800 shadow-sm">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/60 pl-4 italic my-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
