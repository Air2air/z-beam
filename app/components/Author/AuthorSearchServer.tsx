// app/components/AuthorSearchServer.tsx
import { getAllAuthors } from "app/utils/authors";
import { getMaterialList } from "app/utils/server";
import { AuthorSearch } from "./AuthorSearch";

interface AuthorSearchServerProps {
  className?: string;
  showDirectory?: boolean;
}

export function AuthorSearchServer({ 
  className = "",
  showDirectory = true 
}: AuthorSearchServerProps) {
  const authors = getAllAuthors();
  const allMaterials = getMaterialList();

  return (
    <AuthorSearch
      className={className}
      showDirectory={showDirectory}
      authors={authors}
      allMaterials={allMaterials}
    />
  );
}
