"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface RichTextChild {
  type: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  url?: string
  children?: Array<{ text?: string }>
}

interface RichTextBlock {
  type: string
  level?: number
  format?: string
  children?: RichTextChild[]
}

interface RichTextRendererProps {
  content: RichTextBlock[]
  className?: string
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content || content.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {content.map((block, index) => (
        <RichTextBlock key={index} block={block} index={index} />
      ))}
    </div>
  )
}

function RichTextBlock({ block, index }: { block: RichTextBlock; index: number }) {
  const delay = Math.min(index * 50, 300) // Cap delay at 300ms

  // Heading
  if (block.type === "heading") {
    const text = getBlockText(block)
    const level = block.level || 2

    const headingClasses = {
      1: "text-3xl md:text-4xl font-bold mt-12 mb-6",
      2: "text-2xl md:text-3xl font-bold mt-10 mb-5",
      3: "text-xl md:text-2xl font-semibold mt-8 mb-4",
      4: "text-lg md:text-xl font-semibold mt-6 mb-3",
      5: "text-base font-semibold mt-4 mb-2",
      6: "text-sm font-semibold mt-4 mb-2 uppercase tracking-wide text-neutral-500",
    }

    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements

    return (
      <ScrollReveal variant="fade-up" delay={delay}>
        <Tag className={cn(headingClasses[level as keyof typeof headingClasses] || headingClasses[2], "text-[#1A1A1A]")}>
          {/* Decorative element for h2 */}
          {level === 2 && (
            <span className="inline-block w-8 h-1 bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] rounded-full mr-3 align-middle" />
          )}
          {text}
        </Tag>
      </ScrollReveal>
    )
  }

  // Paragraph
  if (block.type === "paragraph") {
    const children = block.children || []

    // Check if empty paragraph
    if (children.length === 0 || (children.length === 1 && !children[0].text)) {
      return <div className="h-4" /> // Spacer
    }

    return (
      <ScrollReveal variant="fade-up" delay={delay}>
        <p className="text-neutral-700 leading-relaxed">
          {children.map((child, childIndex) => (
            <RichTextSpan key={childIndex} node={child} />
          ))}
        </p>
      </ScrollReveal>
    )
  }

  // List
  if (block.type === "list") {
    const isOrdered = block.format === "ordered"
    const ListTag = isOrdered ? "ol" : "ul"

    return (
      <ScrollReveal variant="fade-up" delay={delay}>
        <ListTag className={cn(
          "my-4 ml-6 space-y-2",
          isOrdered ? "list-decimal" : "list-none"
        )}>
          {block.children?.map((item, itemIndex) => (
            <li key={itemIndex} className="relative text-neutral-700 leading-relaxed">
              {!isOrdered && (
                <span className="absolute -left-5 top-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]" />
              )}
              {item.children?.map((child, childIndex) => (
                <React.Fragment key={childIndex}>{child.text}</React.Fragment>
              ))}
            </li>
          ))}
        </ListTag>
      </ScrollReveal>
    )
  }

  // Quote
  if (block.type === "quote") {
    const text = getBlockText(block)

    return (
      <ScrollReveal variant="fade-up" delay={delay}>
        <blockquote className="relative my-8 pl-6 py-4 border-l-4 border-gradient-to-b from-[#2A9D8F] to-[#48CAE4] bg-gradient-to-r from-[#2A9D8F]/5 to-transparent rounded-r-xl">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2A9D8F] to-[#48CAE4] rounded-full" />
          <p className="text-neutral-700 italic text-lg leading-relaxed">{text}</p>
        </blockquote>
      </ScrollReveal>
    )
  }

  // Code block
  if (block.type === "code") {
    const text = getBlockText(block)

    return (
      <ScrollReveal variant="fade-up" delay={delay}>
        <pre className="my-6 p-4 bg-[#1A1A1A] rounded-xl overflow-x-auto">
          <code className="text-sm font-mono text-neutral-300">{text}</code>
        </pre>
      </ScrollReveal>
    )
  }

  return null
}

function RichTextSpan({ node }: { node: RichTextChild }) {
  if (node.type === "link") {
    return (
      <a
        href={node.url}
        className="text-[#2A9D8F] hover:text-[#48CAE4] underline underline-offset-2 transition-colors"
        target={node.url?.startsWith("http") ? "_blank" : undefined}
        rel={node.url?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {node.children?.map((child, index) => (
          <React.Fragment key={index}>{child.text}</React.Fragment>
        ))}
      </a>
    )
  }

  let text = node.text || ""
  let element: React.ReactNode = text

  if (node.bold) {
    element = <strong className="font-semibold text-[#1A1A1A]">{element}</strong>
  }

  if (node.italic) {
    element = <em>{element}</em>
  }

  if (node.underline) {
    element = <u className="underline underline-offset-2">{element}</u>
  }

  if (node.strikethrough) {
    element = <s className="line-through text-neutral-400">{element}</s>
  }

  if (node.code) {
    element = (
      <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm font-mono text-[#2A9D8F]">
        {element}
      </code>
    )
  }

  return <>{element}</>
}

function getBlockText(block: RichTextBlock): string {
  return block.children?.map(child => child.text || "").join("") || ""
}

export default RichTextRenderer
