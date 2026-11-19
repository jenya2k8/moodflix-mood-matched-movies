import type { Title } from "./types";
import { isEpisodic } from "./recommend";

export function formatRuntime(t: Title): string {
  if (isEpisodic(t)) {
    const s = t.seasons ?? 1;
    return `${t.runtime}m/ep · ${s} season${s > 1 ? "s" : ""}`;
  }
  const h = Math.floor(t.runtime / 60);
  const m = t.runtime % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
