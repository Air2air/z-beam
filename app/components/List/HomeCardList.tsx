"use client";

import React, { useMemo } from 'react';
import homeCardsData from "../../data/HomeCards.json";
import { CardLarge } from "../Card/CardLarge";

interface HomeCardData {
  id: number; 
  title?: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface HomeCardListProps {
  cards?: HomeCardData[];
  heading?: string;
  className?: string;
}

export function HomeCardList({ cards, heading, className = "" }: HomeCardListProps) {
  // Memoize the cards to prevent unnecessary re-renders
  const cardsToRender = useMemo(() => cards || homeCardsData.homeCards, [cards]);

  return (
    <section className={`my-8 ${className}`}>
      {heading && (
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          {heading}
        </h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cardsToRender.map((card) => (
          <CardLarge
            key={card.slug || card.id}
            href={`/${card.slug}`}
            imageUrl={card.imageUrl}
            imageAlt={card.title || card.slug || "Image"}
            title={card.title || ""}
            description={card.description || ""}
          />
        ))}
      </div>
    </section>
  );
}