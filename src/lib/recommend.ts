/**
 * MoodFlix recommendation engine.
 *
 * Pure functions only: no storage, no React. Given the catalogue, the user's wizard
 * preferences and their past ratings, every title gets a numeric score plus
 * human-readable reasons ("Matches your Happy mood and 90–120 min preference").
 *
 * Two kinds of rules:
 *  1. HARD FILTERS remove a title entirely (wrong type, too mature, too low on IMDb,
 *     wrong language/platform/era). If everything is filtered out the UI shows
 *     "No matches, try relaxing filters".
 *  2. SOFT SCORES rank what's left (mood, duration, genres, subtitles, IMDb and the
 *     taste profile learned from the user's own ratings).
 */
import { AGE_ORDER, MOOD_LABEL, MOVIE_DURATIONS, EPISODE_LENGTHS } from "./constants";
import type { Era, LengthBucket, Preferences, RatingEntry, Title } from "./types";

// ─── Tunable weights ─────────────────────────────────────────────────────────
export const WEIGHTS = {
  mood: 30, // title carries the selected mood
  duration: 15, // runtime / episode length fits the chosen bucket
  durationMiss: -8, // runtime clearly outside the bucket
  seasons: 10, // season count fits the chosen bucket
  genre: 8, // per overlapping genre
  genreMiss: -10, // user picked genres and none overlap
  subtitles: 6, // requested subtitle language is available
  subtitlesMiss: -6,
  imdbPerPoint: 5, // per IMDb point above 5.0
  tasteMax: 25, // cap on how much past ratings can move a title
  watched: -40, // already watched → push down, don't hide
} as const;

// ─── Default preferences ────────────────────────────────────────────────────
export const DEFAULT_PREFERENCES: Preferences = {
  mood: null,
  contentType: null,
  movieDuration: null,
  episodeLength: null,
  seasonLength: null,
  maxAgeRating: "UA16",
  languages: [],
  audio: "original",
  subtitles: true,
  subtitleLanguage: "English",
  minImdb: 7,
  genres: [],
  eras: [],
  platform: "any",
};

// ─── Small helpers ───────────────────────────────────────────────────────────
export const isEpisodic = (t: Title) => (t.episodes ?? 1) > 1;

/** Movie runtime bucket: short < 90, medium 90–120, long > 120. */
export function movieBucket(minutes: number): Exclude<LengthBucket, "any"> {
  if (minutes < 90) return "short";
  if (minutes <= 120) return "medium";
  return "long";
}

/** Episode length bucket: short < 30, medium 30–45, long > 45. */
export function episodeBucket(minutes: number): Exclude<LengthBucket, "any"> {
  if (minutes < 30) return "short";
  if (minutes <= 45) return "medium";
  return "long";
}

/** Season bucket: short = 1, medium = 2–4, long = 5+. */
export function seasonBucket(seasons: number): Exclude<LengthBucket, "any"> {
  if (seasons <= 1) return "short";
  if (seasons <= 4) return "medium";
  return "long";
}

export function eraOf(year: number): Era {
  if (year < 2000) return "classic";
  if (year < 2015) return "2000s";
  return "recent";
}

/** Languages a viewer can actually hear the title in, given the audio choice. */
export function audibleLanguages(t: Title, audio: Preferences["audio"]): string[] {
  return audio === "dubbed" ? [t.language, ...t.dubbedLanguages] : [t.language];
}

// ─── Taste profile (learned from ratings) ───────────────────────────────────
export interface TasteProfile {
  genres: Record<string, number>;
  languages: Record<string, number>;
  moods: Record<string, number>;
}

/**
 * Turns ratings into weights. Each rating contributes
 *   (stars − 3) + (+1 if liked, −1 if disliked)   → range −3 … +3
 * to every genre, language and mood of the rated title. 4–5★ boosts those
 * traits, 1–2★ lowers them, 3★ with no like/dislike is neutral.
 */
export function buildTasteProfile(ratings: RatingEntry[], titles: Title[]): TasteProfile {
  const profile: TasteProfile = { genres: {}, languages: {}, moods: {} };
  const byId = new Map(titles.map((t) => [t.id, t]));
  for (const r of ratings) {
    const t = byId.get(r.titleId);
    if (!t) continue;
    const w = ratingWeight(r);
    if (w === 0) continue;
    for (const g of t.genres) profile.genres[g] = (profile.genres[g] ?? 0) + w;
    profile.languages[t.language] = (profile.languages[t.language] ?? 0) + w;
    for (const m of t.moods) profile.moods[m] = (profile.moods[m] ?? 0) + w;
  }
  return profile;
}

export function ratingWeight(r: Pick<RatingEntry, "stars" | "liked">): number {
  return r.stars - 3 + (r.liked === true ? 1 : r.liked === false ? -1 : 0);
}

/** How much the taste profile likes a title (clamped to ±WEIGHTS.tasteMax). */
export function tasteScore(t: Title, profile: TasteProfile): number {
  let s = 0;
  for (const g of t.genres) s += (profile.genres[g] ?? 0) * 3;
  s += (profile.languages[t.language] ?? 0) * 4;
  for (const m of t.moods) s += (profile.moods[m] ?? 0) * 2;
  return Math.max(-WEIGHTS.tasteMax, Math.min(WEIGHTS.tasteMax, s));
}

// ─── Hard filters ───────────────────────────────────────────────────────────
export function passesHardFilters(t: Title, p: Preferences): boolean {
  if (p.contentType && t.type !== p.contentType) return false;
  if (AGE_ORDER[t.ageRating] > AGE_ORDER[p.maxAgeRating]) return false;
  if (t.imdbRating < p.minImdb) return false;
  if (p.platform !== "any" && t.platform !== p.platform) return false;
  if (p.eras.length > 0 && !p.eras.includes(eraOf(t.year))) return false;
  if (p.languages.length > 0) {
    const heard = audibleLanguages(t, p.audio);
    if (!heard.some((l) => p.languages.includes(l))) return false;
  }
  return true;
}

// ─── Scoring ────────────────────────────────────────────────────────────────
export interface ScoreContext {
  profile: TasteProfile;
  watchedIds: Set<string>;
}

export interface ScoredTitle {
  title: Title;
  score: number;
  /** 0–99 display value ("92% match"). */
  match: number;
  reasons: string[];
  /** One-line summary shown on cards. */
  why: string;
}

const durationLabel = (list: readonly { id: string; label: string }[], id: string) =>
  list.find((d) => d.id === id)?.label ?? "";

export function scoreTitle(t: Title, p: Preferences, ctx: ScoreContext): ScoredTitle {
  let score = 0;
  const reasons: string[] = [];

  // 1. Mood — the heart of MoodFlix.
  if (p.mood && t.moods.includes(p.mood)) {
    score += WEIGHTS.mood;
    reasons.push(`your ${MOOD_LABEL[p.mood]} mood`);
  }

  // 2. Duration — films by runtime, episodic shows by episode length + seasons.
  if (!isEpisodic(t) && p.movieDuration && p.movieDuration !== "any") {
    if (movieBucket(t.runtime) === p.movieDuration) {
      score += WEIGHTS.duration;
      reasons.push(`${durationLabel(MOVIE_DURATIONS, p.movieDuration)} preference`);
    } else score += WEIGHTS.durationMiss;
  }
  if (isEpisodic(t)) {
    if (p.episodeLength && p.episodeLength !== "any") {
      if (episodeBucket(t.runtime) === p.episodeLength) {
        score += WEIGHTS.duration;
        reasons.push(`${durationLabel(EPISODE_LENGTHS, p.episodeLength).toLowerCase()} episodes`);
      } else score += WEIGHTS.durationMiss;
    }
    if (p.seasonLength && p.seasonLength !== "any" && t.seasons) {
      if (seasonBucket(t.seasons) === p.seasonLength) {
        score += WEIGHTS.seasons;
        reasons.push(`${t.seasons} season${t.seasons > 1 ? "s" : ""}`);
      }
    }
  }

  // 3. Genres.
  if (p.genres.length > 0) {
    const overlap = t.genres.filter((g) => p.genres.includes(g));
    if (overlap.length > 0) {
      score += overlap.length * WEIGHTS.genre;
      reasons.push(overlap.join(" & "));
    } else score += WEIGHTS.genreMiss;
  }

  // 4. Language (already filtered; reward the original-language match a bit more).
  if (p.languages.includes(t.language)) {
    score += 4;
    reasons.push(t.language);
  } else if (p.languages.length > 0) {
    reasons.push(`dubbed in ${t.dubbedLanguages.find((l) => p.languages.includes(l))}`);
  }

  // 5. Subtitles.
  if (p.subtitles && p.subtitleLanguage) {
    score += t.subtitles.includes(p.subtitleLanguage) ? WEIGHTS.subtitles : WEIGHTS.subtitlesMiss;
  }

  // 6. Quality.
  score += Math.max(0, t.imdbRating - 5) * WEIGHTS.imdbPerPoint;

  // 7. Personal taste from past ratings.
  const taste = tasteScore(t, ctx.profile);
  score += taste;
  if (taste >= 8) reasons.push("titles you rated highly");

  // 8. Already watched.
  if (ctx.watchedIds.has(t.id)) score += WEIGHTS.watched;

  const max = WEIGHTS.mood + WEIGHTS.duration + WEIGHTS.seasons + 2 * WEIGHTS.genre + 4 + WEIGHTS.subtitles + 4 * WEIGHTS.imdbPerPoint + 10;
  const match = Math.round(Math.max(40, Math.min(99, (score / max) * 100)));

  return { title: t, score, match, reasons, why: summarise(reasons) };
}

function summarise(reasons: string[]): string {
  if (reasons.length === 0) return "Highly rated pick for tonight";
  const top = reasons.slice(0, 2);
  return `Matches ${top.join(" and ")}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────
export function recommend(titles: Title[], p: Preferences, ctx: ScoreContext): ScoredTitle[] {
  return titles
    .filter((t) => passesHardFilters(t, p))
    .map((t) => scoreTitle(t, p, ctx))
    .sort((a, b) => b.score - a.score || b.title.imdbRating - a.title.imdbRating);
}

export type SortKey = "relevance" | "imdb" | "newest";

export function sortResults(list: ScoredTitle[], key: SortKey): ScoredTitle[] {
  const copy = [...list];
  if (key === "imdb") copy.sort((a, b) => b.title.imdbRating - a.title.imdbRating);
  else if (key === "newest") copy.sort((a, b) => b.title.year - a.title.year);
  else copy.sort((a, b) => b.score - a.score);
  return copy;
}

/** Loosens the hard filters that most often empty the list. */
export function relaxPreferences(p: Preferences): Preferences {
  return { ...p, languages: [], platform: "any", eras: [], minImdb: Math.min(p.minImdb, 6), audio: "dubbed" };
}

/**
 * "Because you liked X": titles sharing genres/moods with the seed, nudged by the
 * overall taste profile. Excludes the seed and anything already watched.
 */
export function similarTo(
  seed: Title,
  titles: Title[],
  profile: TasteProfile,
  exclude: Set<string>,
  limit = 10,
): Title[] {
  return titles
    .filter((t) => t.id !== seed.id && !exclude.has(t.id))
    .map((t) => {
      const genre = t.genres.filter((g) => seed.genres.includes(g)).length * 10;
      const mood = t.moods.filter((m) => seed.moods.includes(m)).length * 6;
      const sameType = t.type === seed.type ? 6 : 0;
      const lang = t.language === seed.language ? 4 : 0;
      return { t, s: genre + mood + sameType + lang + tasteScore(t, profile) + t.imdbRating };
    })
    .filter((x) => x.s > 20)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.t);
}
