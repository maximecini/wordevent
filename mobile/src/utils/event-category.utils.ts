import { ImageSourcePropType } from 'react-native';
import { EventCategory } from '../types/event.types';

export type CategoryConfig = {
  emoji: string;
  label: string;
  color: string;
  image: ImageSourcePropType;
};

export const CATEGORY_CONFIG: Record<EventCategory, CategoryConfig> = {
  SPORT: { emoji: '🏃', label: 'Sport',   color: '#10B981', image: require('../../assets/categories/sport.jpg') },
  MUSIC: { emoji: '🎵', label: 'Musique', color: '#F59E0B', image: require('../../assets/categories/music.jpg') },
  FOOD:  { emoji: '🍕', label: 'Food',    color: '#EF4444', image: require('../../assets/categories/food.jpg') },
  PARTY: { emoji: '🎉', label: 'Soirée',  color: '#8B5CF6', image: require('../../assets/categories/party.jpg') },
  ART:   { emoji: '🎨', label: 'Art',     color: '#EC4899', image: require('../../assets/categories/art.jpg') },
  OTHER: { emoji: '📍', label: 'Autre',   color: '#64748B', image: require('../../assets/categories/other.jpg') },
};

/** Retourne la config (emoji, label, couleur, image) d'une catégorie. */
export function getCategoryConfig(category: EventCategory): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.OTHER;
}
