'use client';

// app/components/AuthorSearchResults.tsx
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CardItem } from '@/app/components/Card/CardItem';
import { FadeInOnScroll } from '@/app/components/Layout/FadeInOnScroll';
import { SmartTagList } from '@/app/components/Tag/SmartTagList';
import { Container } from '@/app/components/Layout/Container';
import { formatDate } from 'app/utils/utils';
import type { AuthorMetadata, MaterialPost } from 'app/types';

interface AuthorSearchResultsProps {
  authors: AuthorMetadata[];
  materials: MaterialPost[];
}

export function AuthorSearchResults({ authors, materials }: AuthorSearchResultsProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get author by ID from props
  const getAuthorById = (id: number) => {
    return authors.find(author => author.id === id) || null;
  };

  // Filter materials by selected author and search term
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // Filter by author if selected
    if (selectedAuthorId !== null) {
      filtered = filtered.filter(material => material.metadata.authorId === selectedAuthorId);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(material =>
        material.metadata.title.toLowerCase().includes(term) ||
        material.metadata.nameShort?.toLowerCase().includes(term) ||
        material.metadata.description?.toLowerCase().includes(term) ||
        material.metadata.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => {
      const nameA = (a.metadata.nameShort || a.metadata.title || '').toLowerCase();
      const nameB = (b.metadata.nameShort || b.metadata.title || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [materials, selectedAuthorId, searchTerm]);

  // Get statistics for each author
  const authorStats = useMemo(() => {
    return authors.map(author => ({
      ...author,
      articleCount: materials.filter(material => material.metadata.authorId === author.id).length
    }));
  }, [authors, materials]);

  const selectedAuthor = selectedAuthorId ? getAuthorById(selectedAuthorId) : null;

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Container>
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Materials
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, material name, or tags..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Author Filter Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Author
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAuthorId(null)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedAuthorId === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Authors ({materials.length})
              </button>
              {authorStats.map((author) => (
                <button
                  key={author.id}
                  onClick={() => setSelectedAuthorId(author.id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedAuthorId === author.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {author.name} ({author.articleCount})
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Selected Author Info */}
      {selectedAuthor && (
        <FadeInOnScroll>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              {selectedAuthor.image && (
                <img
                  src={selectedAuthor.image}
                  alt={selectedAuthor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{selectedAuthor.name}</h3>
                <p className="text-blue-600 font-medium">{selectedAuthor.title}</p>
                <p className="text-gray-600 mt-2">{selectedAuthor.bio}</p>
                {selectedAuthor.specialties && selectedAuthor.specialties.length > 0 && (
                  <SmartTagList 
                    tags={selectedAuthor.specialties}
                    title="Specialties"
                    linkable={false}
                    className="mt-3"
                    maxTags={5}
                    showByCategory={false}
                  />
                )}
                {selectedAuthor.linkedin && (
                  <div className="mt-3">
                    <Link
                      href={selectedAuthor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View LinkedIn Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedAuthor 
            ? `Articles by ${selectedAuthor.name}`
            : 'All Materials'
          }
        </h2>
        <p className="text-gray-600">
          {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} found
        </p>
      </div>

      {/* Results Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material, index) => {
            const author = getAuthorById(material.metadata.authorId || 0);
            return (
              <FadeInOnScroll
                key={material.slug}
                delay={0.1 * (index % 9)}
                yOffset={20}
                amount={0.1}
              >
                <CardItem
                  href={`/${material.slug}`}
                  imageUrl={material.metadata.thumbnail || '/images/default-material.jpg'}
                  imageAlt={material.metadata.title}
                  title={material.metadata.title}
                  description={material.metadata.summary || material.metadata.description || ''}
                  date={material.metadata.publishedAt ? formatDate(material.metadata.publishedAt) : 'Date not available'}
                  nameShort={material.metadata.nameShort}
                  atomicNumber={material.metadata.atomicNumber}
                  chemicalSymbol={material.metadata.chemicalSymbol}
                  materialType={material.metadata.materialType}
                  metalClass={material.metadata.metalClass}
                  crystalStructure={material.metadata.crystalStructure}
                  primaryApplication={material.metadata.primaryApplication}
                />
                {author && (
                  <div className="mt-2 text-sm text-gray-600">
                    By <span className="font-medium text-blue-600">{author.name}</span>
                  </div>
                )}
              </FadeInOnScroll>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or selecting a different author.
          </p>
        </div>
      )}
    </div>
  );
}
