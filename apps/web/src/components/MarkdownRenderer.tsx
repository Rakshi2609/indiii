"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
}

export function MarkdownRenderer({ content, className = "", isUserMessage = false }: MarkdownRendererProps) {
  if (isUserMessage) {
    return (
      <div className={`prose prose-sm max-w-none text-on-primary leading-relaxed ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={`prose prose-sm max-w-none text-on-surface leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-extrabold text-primary mt-3 mb-2 pb-1 border-b border-outline-variant" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-primary mt-2.5 mb-1.5 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-bold text-primary mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-1.5 text-on-surface leading-relaxed text-xs sm:text-sm font-medium" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-on-surface bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-on-surface-variant italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-5 my-2 space-y-1 text-on-surface text-xs sm:text-sm" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-5 my-2 space-y-1 text-on-surface text-xs sm:text-sm" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed text-on-surface font-medium" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary bg-primary/5 pl-3 py-1.5 my-2 rounded-r text-xs text-on-surface italic font-medium"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <table className="min-w-full divide-y divide-outline-variant text-xs text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-surface-container text-on-surface font-bold uppercase tracking-wider text-[10px] sm:text-[11px]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-outline-variant/60" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-surface-container/60 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-bold text-on-surface border-b border-outline-variant text-[11px]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 text-on-surface font-medium text-xs border-b border-outline-variant/40" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return isInline ? (
              <code
                className="bg-surface-container text-primary font-mono text-[11px] px-1.5 py-0.5 rounded border border-outline-variant font-bold"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-xl bg-surface-container-low p-3 my-2 border border-outline-variant text-xs font-mono text-on-surface">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ node, href, ...props }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary hover:underline underline-offset-2 transition-colors font-bold"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-outline-variant my-3" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
