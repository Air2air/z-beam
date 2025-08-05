// app/components/Base/MarkdownRenderer.tsx
import React from "react";
// import "./styles.css";

export interface MarkdownRendererProps {
  content: string;
  convertMarkdown?: boolean; // Add this flag
}

// Simple Markdown to HTML converter function
function simpleMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  try {
    // Process bullet lists
    let html = markdown
      // Process bullet points
      .replace(/^-\s+(.*?)$/gm, "<li>$1</li>")
      // Process nested bullet points (indented with 2 or more spaces)
      .replace(/^(\s{2,})-\s+(.*?)$/gm, "<li>$2</li>")
      // Convert consecutive <li> items to lists
      .replace(/(<li>.*?<\/li>\n?)+/gs, function (match) {
        return "<ul>\n" + match + "</ul>\n";
      })
      // Process bold text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Process italic text
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Process links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Process headings
      .replace(/^#{1}\s+(.*?)$/gm, "<h1>$1</h1>")
      .replace(/^#{2}\s+(.*?)$/gm, "<h2>$1</h2>")
      .replace(/^#{3}\s+(.*?)$/gm, "<h3>$1</h3>")
      .replace(/^#{4}\s+(.*?)$/gm, "<h4>$1</h4>")
      .replace(/^#{5}\s+(.*?)$/gm, "<h5>$1</h5>")
      .replace(/^#{6}\s+(.*?)$/gm, "<h6>$1</h6>");

    // Only wrap text in <p> tags if it's not already wrapped in HTML
    html = html.replace(/^([^<\n].*?)$/gm, "<p>$1</p>");

    // Fix nested lists (simple approach)
    html = html.replace(/<\/ul>\n<ul>/g, "");

    return html;
  } catch (error) {
    console.error("Error converting markdown:", error);
    return markdown; // Return original content if processing fails
  }
}

export function MarkdownRenderer({
  content,
  convertMarkdown = true, // Default to true
}: MarkdownRendererProps) {
  if (!content) return null;

  // Process content if needed based on options
  let processedContent = convertMarkdown
    ? simpleMarkdownToHtml(content)
    : content;

  // Process links if requested
  if (processedContent) {
    processedContent = processedContent.replace(
      /<a\s+href="(https?:\/\/.*?)"/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer"'
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
}
