'use client';
// app/debug/tags/page.tsx

import { DebugLayout } from '../../components/Debug/DebugLayout';
import { TagDebug } from '../../components/Debug/TagDebug';

export default function TagDebugPage() {
  return (
    <DebugLayout activeSection="tags">
      <TagDebug />
    </DebugLayout>
  );
}
