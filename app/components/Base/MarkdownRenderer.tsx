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
    let html = markdown;

    // Process markdown tables first
    html = convertMarkdownTables(html);

    // Process bullet lists
    html = html
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

// Convert markdown tables to HTML tables
function convertMarkdownTables(markdown: string): string {
  if (!markdown) return "";

  try {
    const lines = markdown.split('\n');
    let html = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if this line starts a table (contains |)
      if (line.trim().includes('|') && line.trim() !== '') {
        // Look ahead to see if the next line is a separator (contains --- or |--)
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const isSeparator = /^[\|\-\:\s]+$/.test(nextLine.trim());

        if (isSeparator) {
          // This is a markdown table
          const tableData = parseMarkdownTable(lines, i);
          html += tableData.html;
          i = tableData.nextIndex;
        } else {
          // Regular line
          html += line + '\n';
          i++;
        }
      } else {
        // Regular line
        html += line + '\n';
        i++;
      }
    }

    return html;
  } catch (error) {
    console.error("Error converting markdown tables:", error);
    return markdown;
  }
}

// Parse a markdown table starting at the given line index
function parseMarkdownTable(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1];
  
  // Parse header
  const headers = headerLine.split('|')
    .map(cell => cell.trim())
    .filter(cell => cell !== '');

  let tableHtml = '<table>\n';
  
  // Add header row
  if (headers.length > 0) {
    tableHtml += '  <thead>\n    <tr>\n';
    headers.forEach(header => {
      tableHtml += `      <th>${header}</th>\n`;
    });
    tableHtml += '    </tr>\n  </thead>\n';
  }

  // Add body rows
  tableHtml += '  <tbody>\n';
  
  let currentIndex = startIndex + 2; // Skip header and separator
  
  while (currentIndex < lines.length) {
    const line = lines[currentIndex];
    
    // Stop if we hit an empty line or non-table line
    if (!line.trim() || !line.includes('|')) {
      break;
    }

    const cells = line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '');

    if (cells.length > 0) {
      tableHtml += '    <tr>\n';
      cells.forEach(cell => {
        tableHtml += `      <td>${cell}</td>\n`;
      });
      tableHtml += '    </tr>\n';
    }

    currentIndex++;
  }

  tableHtml += '  </tbody>\n</table>\n';

  return {
    html: tableHtml,
    nextIndex: currentIndex
  };
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
