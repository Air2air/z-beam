// app/components/Bullets/Bullets.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css';


interface BulletsProps {
  content: string;
  config?: {
    className?: string;
  };
}

export function Bullets({ content, config }: BulletsProps) {
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  // Parse bullet points - handle three patterns:
  // 1. "- **[CATEGORY]**" (with double asterisks)
  // 2. "- [CATEGORY]" (without double asterisks)
  // 3. "1. **Technical Focus:**" (numbered lists)
  const bulletPattern = /^(- (\*\*)?\[|\d+\. \*\*)/gm;
  const bulletIndices: number[] = [];
  let match;
  
  // Find all bullet point start positions
  while ((match = bulletPattern.exec(content)) !== null) {
    bulletIndices.push(match.index);
  }
  
  if (bulletIndices.length === 0) {
    // Fallback to original rendering if no bullet pattern found
    return (
      <div className={`bullets-section ${className}`}>
        <MarkdownRenderer 
          content={content}
          convertMarkdown={true}
        />
      </div>
    );
  }
  
  // Extract individual bullet points
  const bulletPoints: string[] = [];
  for (let i = 0; i < bulletIndices.length; i++) {
    const start = bulletIndices[i];
    const end = i < bulletIndices.length - 1 ? bulletIndices[i + 1] : content.length;
    const bulletText = content.slice(start, end).trim();
    if (bulletText) {
      bulletPoints.push(bulletText);
    }
  }
  
  return (
    <div className={`bullets-section ${className}`}>
      {bulletPoints.map((point, index) => {
        if (!point.trim()) return null;
        
        return (
          <div key={index} className="bullet-point-container">
            <MarkdownRenderer 
              content={point}
              convertMarkdown={true}
            />
          </div>
        );
      })}
    </div>
  );
}

