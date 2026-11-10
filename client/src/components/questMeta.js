import {
  ChefHat,
  Compass,
  GraduationCap,
  HandHeart,
  Hammer,
  Leaf,
  ListChecks,
  Mountain,
  Music,
  Users
} from 'lucide-react';

/**
 * SideQuest categories, keyed by the activity `type` the API returns.
 * `accent` picks one of three subtle category colours (see .cat-* in index.css).
 */
export const CATEGORIES = [
  { type: 'recreational', label: 'Adventure', blurb: 'Get out and play', icon: Mountain, accent: 'purple' },
  { type: 'social', label: 'Social', blurb: 'Do it with people', icon: Users, accent: 'orange' },
  { type: 'education', label: 'Learning', blurb: 'Pick up something new', icon: GraduationCap, accent: 'blue' },
  { type: 'cooking', label: 'Food', blurb: 'Make something tasty', icon: ChefHat, accent: 'orange' },
  { type: 'relaxation', label: 'Relax', blurb: 'Slow down a little', icon: Leaf, accent: 'blue' },
  { type: 'charity', label: 'Give back', blurb: 'Help someone out', icon: HandHeart, accent: 'purple' },
  { type: 'busywork', label: 'Get it done', blurb: 'Tick off a chore', icon: ListChecks, accent: 'blue' }
];

// Types the API can return that don't get their own filter tile. They still deserve a proper label and icon.
const DISPLAY_ONLY = [
  { type: 'music', label: 'Music', blurb: 'Make some noise', icon: Music, accent: 'purple' },
  { type: 'diy', label: 'Make it', blurb: 'Build something', icon: Hammer, accent: 'orange' }
];

const FALLBACK = { type: '', label: 'Quest', blurb: '', icon: Compass, accent: 'purple' };

const titleCase = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Quest');

export const getCategory = (type) =>
  CATEGORIES.find((c) => c.type === type) ||
  DISPLAY_ONLY.find((c) => c.type === type) || { ...FALLBACK, label: titleCase(type) };

/** The API describes effort as free text ("Few to no challenges"). Map it to three levels. */
export const difficultyLabel = (accessibility) => {
  const text = String(accessibility || '').toLowerCase();
  if (text.includes('major')) return 'Hard';
  if (text.includes('minor')) return 'Medium';
  return 'Easy';
};

export const durationLabel = (duration) =>
  ({
    minutes: 'Under an hour',
    hours: 'A few hours',
    days: 'A day or more',
    weeks: 'A week or more'
  })[String(duration || '').toLowerCase()] || null;

export const groupLabel = (participants) => (participants === 1 ? 'Solo' : `${participants} people`);
