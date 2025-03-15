"use client"

import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"
import Image from "next/image"

interface MarkdownViewerProps {
  content: string
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-sm max-w-none p-8 md:prose-base lg:prose-lg dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md" {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          img({ src, alt, ...props }) {
            // For security, we're using next/image for images with proper dimensions
            // In a real app, you'd want to handle this more robustly
            if (src && !src.startsWith("http")) {
              // For local images
              return (
                <span className="block my-4">
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={alt || ""}
                    width={800}
                    height={400}
                    className="rounded-md"
                  />
                </span>
              )
            }

            // For external images
            return (
              <span className="block my-4">
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt || ""}
                  className="rounded-md max-w-full h-auto"
                  {...props}
                />
              </span>
            )
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-8">
                <table className="border-collapse border border-gray-300 dark:border-gray-700">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{children}</td>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownViewer

