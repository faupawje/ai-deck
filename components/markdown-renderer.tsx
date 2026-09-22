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
    <div className={`text-xs md:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-zinc-100 my-2.5 pb-1 border-b border-zinc-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-zinc-100 my-2 pb-0.5 border-b border-zinc-800/80">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-zinc-200 my-1.5">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-medium text-zinc-300 my-1">{children}</h4>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 my-2 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 my-2 text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <div className="my-2 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-200">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code className="rounded bg-zinc-800/80 px-1 py-0.5 font-mono text-[11px] text-indigo-300">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/50 pl-3 my-2 text-zinc-400 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-zinc-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
