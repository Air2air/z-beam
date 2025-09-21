'use client';
// app/debug/tags/page.tsx

import { DebugLayout } from '../../components/Layout/DebugLayout';
import { TagDebug } from '../../components/Debug/TagDebug';

export default function TagDebugPage() {
  return (
    <DebugLayout activeSection="tags">
      <TagDebug />
    </DebugLayout>
  );
}
