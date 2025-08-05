"use client";

import React, { useMemo } from "react";
import { sectionCards } from "./SectionCards";
import { Card } from "../Card/Card";

interface SectionCardData {
  id: number;
  title?: string;
  slug: string;
  description: string;
  imageUrl: string;
  featured?: boolean; // Add featured property
}

interface SectionCardListProps {
  cards?: SectionCardData[];
  heading?: string;
  className?: string;
  featured?: boolean; // Add a featured prop
}

export function SectionCardList({
  cards,
  heading,
  className = "",
  featured = false,
}: SectionCardListProps) {
  // Fix: Use the correct imported variable name and filter based on featured prop
  const cardsToRender = useMemo(() => {
    const allCards = cards || sectionCards;
    if (featured) {
      // Only show cards marked as featured when featured prop is true
      return allCards.filter((card) => card.featured);
    }
    return allCards;
  }, [cards, featured]);

  if (featured && cardsToRender.length === 0) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {cardsToRender.map((card) => (
          <Card
            key={card.slug || card.id}
            href={`/${card.slug}`}
            imageUrl={card.imageUrl}
            imageAlt={card.title || card.slug || "Image"}
            title={card.title || ""}
            description={card.description || ""}
            className="featured-item"
            badge={{ show: false }}
          />
        ))}
      </div>
    </section>
  );
}
