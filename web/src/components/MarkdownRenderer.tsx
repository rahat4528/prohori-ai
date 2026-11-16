import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lightweight, safe Markdown AST renderer tailored for Prohori AI.
 * Handles headings, bold/italic, inline code, fenced code blocks, and lists
 * without external third-party bundle bloat or unescaped HTML injection.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  style = {}
}) => {
  if (!content) return null;

  // Split into blocks: fenced code blocks and text sections
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let paragraphBuffer: string[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const pText = paragraphBuffer.join(" ").trim();
      if (pText) {
        blocks.push(
          <p
            key={`p-${blocks.length}`}
            style={{
              fontSize: "15px",
              lineHeight: 1.65,
              color: "var(--navy)",
              margin: "0 0 12px 0"
            }}
          >
            {renderInlineMarkdown(pText)}
          </p>
        );
      }
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer && listBuffer.items.length > 0) {
      const isOrdered = listBuffer.type === "ol";
      const ListTag = isOrdered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`list-${blocks.length}`}
          style={{
            margin: "0 0 14px 20px",
            paddingLeft: "6px",
            color: "var(--navy)",
            fontSize: "15px",
            lineHeight: 1.6
          }}
        >
          {listBuffer.items.map((item, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ListTag>
      );
      listBuffer = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Fenced Code Block Toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join("\n");
        blocks.push(
          <pre
            key={`code-${blocks.length}`}
            className="font-mono"
            data-language={codeLang || undefined}
            style={{
              background: "var(--navy)",
              color: "var(--cream)",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "13.5px",
              lineHeight: 1.5,
              overflowX: "auto",
              margin: "0 0 14px 0",
              border: "1px solid var(--cream-alpha-20)"
            }}
          >
            <code>{codeText}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        // Start of code block
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeLang = line.replace(/^```/, "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Empty Line -> Flush active paragraph or list
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // 3. Headings
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h4
          key={`h4-${blocks.length}`}
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "var(--navy)",
            margin: "14px 0 8px 0",
            letterSpacing: "0.02em"
          }}
        >
          {renderInlineMarkdown(line.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "var(--navy)",
            margin: "16px 0 10px 0",
            letterSpacing: "0.02em"
          }}
        >
          {renderInlineMarkdown(line.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--navy)",
            margin: "18px 0 12px 0",
            letterSpacing: "0.02em"
          }}
        >
          {renderInlineMarkdown(line.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // 4. Bullet list item (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(bulletMatch[1]);
      continue;
    }

    // 5. Numbered list item (1. 2. etc.)
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(numberMatch[1]);
      continue;
    }

    // 6. Regular text line -> append to paragraph
    paragraphBuffer.push(line);
  }

  // Final flushes
  flushParagraph();
  flushList();
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <pre
        key={`code-end`}
        className="font-mono"
        style={{
          background: "var(--navy)",
          color: "var(--cream)",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "13.5px",
          overflowX: "auto",
          margin: "0 0 14px 0"
        }}
      >
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return <div className={`prohori-markdown-body ${className}`} style={style}>{blocks}</div>;
};

/**
 * Parses inline spans for bold (**text**), italic (*text*), and inline code (`text`).
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // 2. Bold: **bold**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // 3. Italic: *italic* or _italic_
    const italicMatch = remaining.match(/(?:^|[^*_])(\*([^*]+)\*|_([^_]+)_)/);

    // Find whichever comes first
    let earliestType: "code" | "bold" | "italic" | null = null;
    let earliestIndex = remaining.length;

    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
      earliestType = "code";
      earliestIndex = codeMatch.index;
    }
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
      earliestType = "bold";
      earliestIndex = boldMatch.index;
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < earliestIndex) {
      earliestType = "italic";
      earliestIndex = italicMatch.index;
    }

    if (!earliestType) {
      // No more markdown spans
      parts.push(remaining);
      break;
    }

    // Push preceding plain text
    if (earliestIndex > 0) {
      parts.push(remaining.substring(0, earliestIndex));
    }

    if (earliestType === "code" && codeMatch) {
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="font-mono"
          style={{
            background: "var(--navy-alpha-08)",
            color: "var(--navy)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "13.5px",
            fontWeight: 700,
            border: "1px solid var(--navy-alpha-15)"
          }}
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(earliestIndex + codeMatch[0].length);
    } else if (earliestType === "bold" && boldMatch) {
      parts.push(
        <strong key={`b-${keyIndex++}`} style={{ fontWeight: 800, color: "var(--navy)" }}>
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(earliestIndex + boldMatch[0].length);
    } else if (earliestType === "italic" && italicMatch) {
      const matchText = italicMatch[2] || italicMatch[3];
      parts.push(
        <em key={`em-${keyIndex++}`} style={{ fontStyle: "italic", color: "var(--navy)" }}>
          {matchText}
        </em>
      );
      remaining = remaining.substring(earliestIndex + italicMatch[0].length);
    }
  }

  return parts;
}
