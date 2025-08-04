// app/utils/homeCardConverter.ts
import { homeCards } from '../data/HomeCards';

// Convert HomeCards to a format compatible with the List component
export function convertHomeCardsToListItems() {
  return homeCards.map(card => ({
    slug: card.slug,
    title: card.title,
    description: card.description,
    image: card.imageUrl,
    // Set other properties as needed
    featured: card.featured
  }));
}

// Get featured cards only
export function getFeaturedHomeCards() {
  return convertHomeCardsToListItems().filter(item => item.featured);
}
