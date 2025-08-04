"use client";

import React, { useMemo } from 'react';
import { homeCards } from "../../data/HomeCards";
import { Card } from "../Card/Card";

interface HomeCardData {
  id: number; 
  title?: string;
  slug: string;
  description: string;
  imageUrl: string;
  featured?: boolean; // Add featured property
}

interface HomeCardListProps {
  cards?: HomeCardData[];
  heading?: string;
  className?: string;
  featured?: boolean; // Add a featured prop
}

export function HomeCardList({ cards, heading, className = "", featured = false }: HomeCardListProps) {
  // Fix: Use the correct imported variable name and filter based on featured prop
  const cardsToRender = useMemo(() => {
    const allCards = cards || homeCards;
    if (featured) {
      // Only show cards marked as featured when featured prop is true
      return allCards.filter(card => card.featured);
    }
    return allCards;
  }, [cards, featured]);

  // If we're in featured mode but no cards are marked as featured, return nothing
  if (featured && cardsToRender.length === 0) {
    return null;
  }

  return (
    <section className={`my-8 ${className}`}>
      {heading && (
        <h2 className={`text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 ${featured ? 'featured-section-heading' : ''}`}>
          {heading} {featured && <span className="text-blue-500 ml-1">★</span>}
        </h2>
      )}
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${featured ? 'featured-cards' : ''}`}>
        {cardsToRender.map((card) => (
          <Card
            key={card.slug || card.id}
            href={`/${card.slug}`}
            imageUrl={card.imageUrl}
            imageAlt={card.title || card.slug || "Image"}
            title={card.title || ""}
            description={card.description || ""}
            className={featured ? 'featured-card' : ''}
            badge={{ show: !featured }} // Hide badge for featured cards
          />
        ))}
      </div>
    </section>
  );
}