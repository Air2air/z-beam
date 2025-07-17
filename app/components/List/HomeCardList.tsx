"use client";


import homeCardsData from "../../data/HomeCards.json";
import { CardLarge } from "../Card/CardLarge";

interface HomeCardData {
  id: number; 
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface HomeCardListProps {
  cards?: HomeCardData[];
}

export function HomeCardList({ cards }: HomeCardListProps) {
  // Use the imported cards as default if no cards are passed as props
  const cardsToRender = cards || homeCardsData.homeCards;

  return (
    <section className="my-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cardsToRender.map((card) => (
          <CardLarge
            key={card.slug}
            href={`/${card.slug}`}
            imageUrl={card.imageUrl}
            imageAlt={card.title || "Image"}
            title={card.title || ""}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}