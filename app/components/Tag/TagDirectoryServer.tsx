// app/components/TagDirectoryServer.tsx
import { TagDirectory } from "./TagDirectory";

interface TagDirectoryServerProps {
  className?: string;
}

export function TagDirectoryServer({ 
  className = ""
}: TagDirectoryServerProps) {
  return (
    <TagDirectory
      className={className}
    />
  );
}
