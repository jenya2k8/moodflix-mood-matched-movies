import { PLATFORM_LABEL } from "./constants";
import type { Title } from "./types";

/** Button text: "Watch Movie" for films, "Watch Series" etc. for the rest. */
export function watchLabel(t: Title): string {
  if (t.type === "movie") return "Watch Movie";
  if (t.type === "series") return "Watch Series";
  if (t.type === "anime") return "Watch Anime";
  return "Watch Documentary";
}

/** True when the full title can legally play inside MoodFlix. */
export const isPlayable = (t: Title) => !!t.stream;

/**
 * The legitimate place to watch a title MoodFlix can't play itself:
 * a search on the streaming service it's listed under.
 */
export function officialSource(t: Title): { label: string; url: string } | null {
  const q = encodeURIComponent(t.title);
  switch (t.platform) {
    case "netflix":
      return { label: `Watch on ${PLATFORM_LABEL.netflix}`, url: `https://www.netflix.com/search?q=${q}` };
    case "prime":
      return { label: `Watch on ${PLATFORM_LABEL.prime}`, url: `https://www.primevideo.com/search?phrase=${q}` };
    case "hotstar":
      return { label: `Watch on ${PLATFORM_LABEL.hotstar}`, url: `https://www.hotstar.com/in/explore?search_query=${q}` };
    default:
      return null;
  }
}

/** JustWatch lists every legal source in India for a title. */
export const justWatchUrl = (t: Title) => `https://www.justwatch.com/in/search?q=${encodeURIComponent(t.title)}`;

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
