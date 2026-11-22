import type { AgeRating, ContentType, Era, Mood, Platform } from "./types";

export const MOODS: { id: Mood; label: string; emoji: string; blurb: string }[] = [
  { id: "happy", label: "Happy", emoji: "😄", blurb: "Feel-good laughs" },
  { id: "sad", label: "Sad", emoji: "😢", blurb: "A good cry" },
  { id: "excited", label: "Excited", emoji: "🤩", blurb: "Big energy" },
  { id: "relaxed", label: "Relaxed", emoji: "😌", blurb: "Easy, cosy watch" },
  { id: "romantic", label: "Romantic", emoji: "😍", blurb: "Love stories" },
  { id: "thrilled", label: "Thrilled", emoji: "😱", blurb: "Edge of your seat" },
  { id: "curious", label: "Curious", emoji: "🧐", blurb: "Make me think" },
  { id: "nostalgic", label: "Nostalgic", emoji: "🥹", blurb: "Throwback feels" },
];

export const CONTENT_TYPES: { id: ContentType; label: string; emoji: string; blurb: string }[] = [
  { id: "movie", label: "Movie", emoji: "🎬", blurb: "One sitting, one story" },
  { id: "series", label: "Series", emoji: "📺", blurb: "Binge across episodes" },
  { id: "anime", label: "Anime", emoji: "🌸", blurb: "Japanese animation" },
  { id: "documentary", label: "Documentary", emoji: "🌍", blurb: "Real stories" },
];

export const MOVIE_DURATIONS = [
  { id: "short", label: "Under 90 min", blurb: "Quick watch" },
  { id: "medium", label: "90–120 min", blurb: "Classic length" },
  { id: "long", label: "120+ min", blurb: "Epic night in" },
  { id: "any", label: "Any length", blurb: "Surprise me" },
] as const;

export const EPISODE_LENGTHS = [
  { id: "short", label: "Under 30 min", blurb: "Snackable" },
  { id: "medium", label: "30–45 min", blurb: "Just right" },
  { id: "long", label: "45+ min", blurb: "Cinematic episodes" },
  { id: "any", label: "Any", blurb: "No preference" },
] as const;

export const SEASON_LENGTHS = [
  { id: "short", label: "Short", blurb: "1 season" },
  { id: "medium", label: "Medium", blurb: "2–4 seasons" },
  { id: "long", label: "Long", blurb: "5+ seasons" },
  { id: "any", label: "Any", blurb: "No preference" },
] as const;

export const AGE_RATINGS: { id: AgeRating; label: string; blurb: string }[] = [
  { id: "U", label: "U", blurb: "All ages" },
  { id: "UA13", label: "UA 13+", blurb: "Teens & up" },
  { id: "UA16", label: "UA 16+", blurb: "Older teens" },
  { id: "A", label: "A (18+)", blurb: "Adults only" },
];

export const AGE_ORDER: Record<AgeRating, number> = { U: 0, UA13: 1, UA16: 2, A: 3 };

export const LANGUAGES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Korean",
  "Japanese",
];

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Nature",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
];

export const ERAS: { id: Era; label: string; blurb: string }[] = [
  { id: "classic", label: "Old classics", blurb: "Before 2000" },
  { id: "2000s", label: "2000s", blurb: "2000–2014" },
  { id: "recent", label: "Recent", blurb: "2015 onwards" },
];

export const PLATFORMS: { id: Platform | "any"; label: string }[] = [
  { id: "any", label: "Any platform" },
  { id: "netflix", label: "Netflix" },
  { id: "prime", label: "Prime Video" },
  { id: "hotstar", label: "Hotstar" },
  { id: "free", label: "Free on MoodFlix" },
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  netflix: "Netflix",
  prime: "Prime Video",
  hotstar: "Hotstar",
  free: "Free on MoodFlix",
};

export const AGE_LABEL: Record<AgeRating, string> = {
  U: "U",
  UA13: "UA 13+",
  UA16: "UA 16+",
  A: "A",
};

export const TYPE_LABEL: Record<ContentType, string> = {
  movie: "Movie",
  series: "Series",
  anime: "Anime",
  documentary: "Documentary",
};

export const MOOD_LABEL: Record<Mood, string> = Object.fromEntries(
  MOODS.map((m) => [m.id, m.label]),
) as Record<Mood, string>;
