// app/utils/sectionCardConverter.ts
import { sectionCards } from '../components/SectionCard/SectionCards';

// Convert SectionCards to a format compatible with the List component
export function convertSectionCardsToListItems() {
  return sectionCards.map(card => ({
    slug: card.slug,
    title: card.title,
    description: card.description,
    image: card.imageUrl,
    // Set other properties as needed
    featured: card.featured
  }));
}

// Get featured cards only
export function getSectionCards() {
  return convertSectionCardsToListItems().filter(item => item.featured);
}
