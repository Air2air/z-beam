// app/components/AuthorDirectoryServer.tsx
import { getAllAuthors } from "app/utils/authors";
import { getMaterialList } from "app/utils/server";
import { AuthorDirectory } from "./AuthorArticles";

interface AuthorDirectoryServerProps {
  className?: string;
}

export function AuthorDirectoryServer({ 
  className = ""
}: AuthorDirectoryServerProps) {
  const authors = getAllAuthors();
  const allMaterials = getMaterialList();

  return (
    <AuthorDirectory
      className={className}
      authors={authors}
      allMaterials={allMaterials}
    />
  );
}
