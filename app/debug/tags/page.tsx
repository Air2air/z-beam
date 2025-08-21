'use client';
// app/debug/tags/page.tsx

import { DebugLayout } from '@/app/components/Debug/DebugLayout';
import { TagDebug } from '@/app/components/Debug/TagDebug';

export default function TagDebugPage() {
  return (
    <DebugLayout activeSection="tags">
      <TagDebug />
    </DebugLayout>
  );
}
