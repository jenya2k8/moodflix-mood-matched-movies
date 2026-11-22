/**
 * Offline evaluation of the recommender against the labelled validation set
 * (src/data/evaluation-labels.ts). Nothing here is hard-coded: the numbers on the
 * AI Performance page come from running the real `recommend()` function.
 *
 * Setup ("top-K" evaluation):
 *  - For each of the 8 moods, ask the recommender for picks with neutral filters
 *    (any type, any language, any age rating, no past ratings).
 *  - Predicted positive = the title is in the top K results for that mood.
 *  - Actual positive    = the validation labels say the title fits that mood.
 *  - Every (mood, title) pair is one test case, giving a confusion matrix.
 *
 * Changing K changes the numbers: a small K favours precision, a large K favours
 * recall. That trade-off is why these metrics only make sense next to their setup.
 */
import { GOLD_MOODS } from "@/data/evaluation-labels";
import { MOODS } from "./constants";
import { DEFAULT_PREFERENCES, buildTasteProfile, recommend } from "./recommend";
import type { Mood, Preferences, Title } from "./types";

export interface Confusion {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

const safe = (n: number, d: number) => (d === 0 ? 0 : n / d);

/** Accuracy, Precision, Recall and F1 from a confusion matrix (values 0–1). */
export function metricsFrom(c: Confusion): Metrics {
  const accuracy = safe(c.tp + c.tn, c.tp + c.tn + c.fp + c.fn);
  const precision = safe(c.tp, c.tp + c.fp);
  const recall = safe(c.tp, c.tp + c.fn);
  const f1 = safe(2 * precision * recall, precision + recall);
  return { accuracy, precision, recall, f1 };
}

/** Filters that let every title compete, so only the mood logic is being tested. */
export function neutralPreferences(mood: Mood): Preferences {
  return {
    ...DEFAULT_PREFERENCES,
    mood,
    maxAgeRating: "A",
    minImdb: 0,
    subtitles: false,
    subtitleLanguage: null,
  };
}

export interface MoodResult extends Confusion, Metrics {
  mood: Mood;
  label: string;
  relevant: number;
}

export interface Evaluation {
  k: number;
  cases: number;
  titles: number;
  overall: Confusion & Metrics;
  perMood: MoodResult[];
}

export function evaluate(titles: Title[], k: number, gold: Record<string, Mood[]> = GOLD_MOODS): Evaluation {
  const ctx = { profile: buildTasteProfile([], titles), watchedIds: new Set<string>() };
  const labelled = titles.filter((t) => gold[t.id]);
  const total: Confusion = { tp: 0, tn: 0, fp: 0, fn: 0 };

  const perMood = MOODS.map(({ id: mood, label }) => {
    const top = new Set(recommend(labelled, neutralPreferences(mood), ctx).slice(0, k).map((r) => r.title.id));
    const c: Confusion = { tp: 0, tn: 0, fp: 0, fn: 0 };
    for (const t of labelled) {
      const actual = gold[t.id]?.includes(mood) ?? false;
      const predicted = top.has(t.id);
      if (predicted && actual) c.tp++;
      else if (predicted) c.fp++;
      else if (actual) c.fn++;
      else c.tn++;
    }
    total.tp += c.tp;
    total.tn += c.tn;
    total.fp += c.fp;
    total.fn += c.fn;
    return { mood, label, relevant: c.tp + c.fn, ...c, ...metricsFrom(c) };
  });

  return {
    k,
    cases: labelled.length * MOODS.length,
    titles: labelled.length,
    overall: { ...total, ...metricsFrom(total) },
    perMood,
  };
}
