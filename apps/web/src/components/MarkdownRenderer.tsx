"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-800" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base font-bold text-white mt-3 mb-2 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm font-semibold text-indigo-300 mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-1.5 text-slate-200 leading-relaxed text-sm" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white bg-slate-800/40 px-1 py-0.5 rounded" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-indigo-200 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-5 my-2 space-y-1 text-slate-300 text-sm" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-5 my-2 space-y-1 text-slate-300 text-sm" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed text-slate-200" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-indigo-500/70 bg-indigo-950/20 pl-3 py-1.5 my-2 rounded-r text-xs italic text-indigo-200"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-800 bg-slate-950/80">
              <table className="min-w-full divide-y divide-slate-800 text-xs text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-900 text-slate-300 font-semibold uppercase tracking-wider text-[11px]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-800/60" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-900/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-semibold text-slate-300 border-b border-slate-800" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2 text-slate-300 border-b border-slate-800/40" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return isInline ? (
              <code
                className="bg-slate-800/80 text-emerald-400 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-700/50"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 my-2 border border-slate-800 text-xs font-mono text-slate-300">
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
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 decoration-indigo-500/50 transition-colors font-medium"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-slate-800 my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
