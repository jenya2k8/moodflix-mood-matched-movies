import { describe, expect, it } from "vitest";
import { TITLES } from "@/data/titles";
import { STREAMS, TRAILERS } from "@/data/media";
import { officialSource, watchLabel } from "@/lib/watch";

describe("watch rules", () => {
  it("only plays full titles that are marked free (public domain / CC)", () => {
    for (const t of TITLES.filter((x) => x.stream)) expect(t.platform).toBe("free");
    for (const t of TITLES.filter((x) => x.platform === "free")) expect(t.stream).toBeDefined();
  });
  it("sends every non-playable title to an official source", () => {
    for (const t of TITLES.filter((x) => !x.stream)) expect(officialSource(t)).not.toBeNull();
  });
  it("attaches every trailer and stream to a real title", () => {
    const ids = new Set(TITLES.map((t) => t.id));
    expect([...Object.keys(TRAILERS), ...Object.keys(STREAMS)].filter((id) => !ids.has(id))).toEqual([]);
  });
  it("labels the button Watch Movie for films", () => {
    const film = TITLES.find((t) => t.type === "movie");
    expect(film && watchLabel(film)).toBe("Watch Movie");
  });
});
