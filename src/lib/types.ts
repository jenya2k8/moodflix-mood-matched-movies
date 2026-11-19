/** Core domain types for MoodFlix. Shapes mirror future database tables. */

export type ContentType = "movie" | "series" | "anime" | "documentary";
export type Mood =
  | "happy"
  | "sad"
  | "excited"
  | "relaxed"
  | "romantic"
  | "thrilled"
  | "curious"
  | "nostalgic";
export type AgeRating = "U" | "UA13" | "UA16" | "A";
export type Platform = "netflix" | "prime" | "hotstar";
export type Era = "classic" | "2000s" | "recent";
export type LengthBucket = "short" | "medium" | "long" | "any";

export interface Title {
  id: string;
  title: string;
  type: ContentType;
  genres: string[];
  moods: Mood[];
  /** Minutes. For series/anime with episodes this is the per-episode length. */
  runtime: number;
  /** Total episodes; 1 (or undefined) for films. */
  episodes?: number;
  seasons?: number;
  ageRating: AgeRating;
  /** Original spoken language. */
  language: string;
  dubbedLanguages: string[];
  subtitles: string[];
  imdbRating: number;
  year: number;
  platform: Platform;
  /** Generated poster art: two hues (0-360) for the gradient. Swap for an image URL later. */
  poster: { hues: [number, number]; url?: string };
  description: string;
  cast: string[];
}

export interface Preferences {
  mood: Mood | null;
  contentType: ContentType | null;
  movieDuration: LengthBucket | null;
  episodeLength: LengthBucket | null;
  seasonLength: LengthBucket | null;
  maxAgeRating: AgeRating;
  languages: string[];
  audio: "original" | "dubbed";
  subtitles: boolean;
  subtitleLanguage: string | null;
  minImdb: number;
  genres: string[];
  eras: Era[];
  platform: Platform | "any";
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
  createdAt: string;
  lastLoginAt: string;
  previousLoginAt: string | null;
}

export interface StoredUser extends User {
  passwordHash: string | null;
}

export interface WatchEntry {
  userId: string;
  titleId: string;
  watchedAt: string;
}

export interface RatingEntry {
  userId: string;
  titleId: string;
  stars: number;
  liked: boolean | null;
  note: string;
  ratedAt: string;
}

export interface WatchlistEntry {
  userId: string;
  titleId: string;
  addedAt: string;
}
