import { useMemo, useSyncExternalStore } from "react";
import { getSnapshot, subscribe, SERVER_SNAPSHOT } from "@/lib/db";
import { buildTasteProfile } from "@/lib/recommend";
import { TITLES } from "@/data/titles";

/** Signed-in user's data. `hydrated` is false during SSR and the first client render. */
export function useMoodflix() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const profile = useMemo(() => buildTasteProfile(snap.ratings, TITLES), [snap.ratings]);
  const watchedIds = useMemo(() => new Set(snap.history.map((h) => h.titleId)), [snap.history]);
  const watchlistIds = useMemo(() => new Set(snap.watchlist.map((w) => w.titleId)), [snap.watchlist]);
  return { ...snap, profile, watchedIds, watchlistIds };
}
