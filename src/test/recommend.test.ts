import { describe, expect, it } from "vitest";
import { TITLES } from "@/data/titles";
import {
  DEFAULT_PREFERENCES,
  buildTasteProfile,
  episodeBucket,
  movieBucket,
  passesHardFilters,
  recommend,
  seasonBucket,
  tasteScore,
} from "@/lib/recommend";
import type { Preferences, Title } from "@/lib/types";

const prefs = (p: Partial<Preferences> = {}): Preferences => ({ ...DEFAULT_PREFERENCES, minImdb: 5, ...p });
const byTitle = (name: string) => TITLES.find((t) => t.title === name) as Title;
const ctx = { profile: buildTasteProfile([], TITLES), watchedIds: new Set<string>() };

describe("catalogue", () => {
  it("has at least 40 titles", () => {
    expect(TITLES.length).toBeGreaterThanOrEqual(40);
  });
});

describe("duration buckets", () => {
  it("splits movies at 90 and 120 minutes", () => {
    expect(movieBucket(89)).toBe("short");
    expect(movieBucket(90)).toBe("medium");
    expect(movieBucket(120)).toBe("medium");
    expect(movieBucket(121)).toBe("long");
  });
  it("splits episodes at 30 and 45 minutes", () => {
    expect(episodeBucket(29)).toBe("short");
    expect(episodeBucket(30)).toBe("medium");
    expect(episodeBucket(46)).toBe("long");
  });
  it("treats 1 season as short, 2-4 as medium, 5+ as long", () => {
    expect(seasonBucket(1)).toBe("short");
    expect(seasonBucket(4)).toBe("medium");
    expect(seasonBucket(5)).toBe("long");
  });
});

describe("hard filters", () => {
  it("excludes titles rated above the chosen age rating", () => {
    expect(passesHardFilters(byTitle("Parasite"), prefs({ maxAgeRating: "UA16" }))).toBe(false);
    expect(passesHardFilters(byTitle("Parasite"), prefs({ maxAgeRating: "A" }))).toBe(true);
  });
  it("excludes titles below the minimum IMDb rating", () => {
    expect(passesHardFilters(byTitle("Train to Busan"), prefs({ maxAgeRating: "A", minImdb: 8 }))).toBe(false);
  });
  it("only counts dubbed languages when dubbed audio is allowed", () => {
    const rrr = byTitle("RRR");
    expect(passesHardFilters(rrr, prefs({ languages: ["Hindi"], audio: "original" }))).toBe(false);
    expect(passesHardFilters(rrr, prefs({ languages: ["Hindi"], audio: "dubbed" }))).toBe(true);
  });
});

describe("scoring", () => {
  it("ranks a title matching the mood above one that doesn't", () => {
    const list = recommend(TITLES, prefs({ mood: "happy", contentType: "movie", maxAgeRating: "A" }), ctx);
    const happy = list.findIndex((r) => r.title.title === "Paddington 2");
    const dark = list.findIndex((r) => r.title.title === "Get Out");
    expect(happy).toBeLessThan(dark);
  });
  it("explains the mood and duration match", () => {
    const list = recommend(TITLES, prefs({ mood: "happy", contentType: "movie", movieDuration: "medium" }), ctx);
    const pad = list.find((r) => r.title.title === "Paddington 2");
    expect(pad?.why).toBe("Matches your Happy mood and 90–120 min preference");
  });
  it("boosts traits of 5★ liked titles and lowers traits of 1★ disliked ones", () => {
    const rating = (titleId: string, stars: number, liked: boolean) => ({ userId: "u", titleId, stars, liked, note: "", ratedAt: "" });
    const profile = buildTasteProfile(
      [rating(byTitle("Friends").id, 5, true), rating(byTitle("Breaking Bad").id, 1, false)],
      TITLES,
    );
    expect(profile.genres.Comedy).toBe(3);
    expect(profile.genres.Crime).toBe(-3);
    expect(tasteScore(byTitle("The Office"), profile)).toBeGreaterThan(0);
    expect(tasteScore(byTitle("Mirzapur"), profile)).toBeLessThan(0);
  });
});
