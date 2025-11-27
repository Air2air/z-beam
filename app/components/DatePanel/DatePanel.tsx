// app/components/DatePanel/DatePanel.tsx
import { Calendar } from "lucide-react";
import { formatDate } from "../../utils/dateFormatting";

interface DatePanelProps {
  datePublished?: string;
  className?: string;
}

export function DatePanel({ datePublished, className = "" }: DatePanelProps) {
  if (!datePublished) return null;

  return (
    <div className={`date-panel text-tertiary text-xs bg-primary rounded px-3 py-2 flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5" />
        <div>
          <div className="text-secondary text-[10px] uppercase tracking-wide">Published</div>
          <div className="text-primary font-medium">{formatDate(datePublished)}</div>
        </div>
      </div>
    </div>
  );
}
