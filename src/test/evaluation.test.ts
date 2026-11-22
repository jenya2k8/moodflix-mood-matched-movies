import { describe, expect, it } from "vitest";
import { GOLD_MOODS } from "@/data/evaluation-labels";
import { TITLES } from "@/data/titles";
import { evaluate, metricsFrom } from "@/lib/evaluate";
import { MOODS } from "@/lib/constants";

describe("metric formulas", () => {
  it("computes accuracy, precision, recall and F1 from a confusion matrix", () => {
    const m = metricsFrom({ tp: 8, fp: 2, fn: 4, tn: 86 });
    expect(m.accuracy).toBeCloseTo(0.94);
    expect(m.precision).toBeCloseTo(0.8);
    expect(m.recall).toBeCloseTo(8 / 12);
    expect(m.f1).toBeCloseTo((2 * 0.8 * (8 / 12)) / (0.8 + 8 / 12));
  });
  it("returns 0 instead of NaN when nothing is predicted", () => {
    expect(metricsFrom({ tp: 0, fp: 0, fn: 5, tn: 5 }).precision).toBe(0);
  });
});

describe("validation set", () => {
  it("labels every title in the catalogue, and only real titles", () => {
    const ids = new Set(TITLES.map((t) => t.id));
    expect(Object.keys(GOLD_MOODS).filter((id) => !ids.has(id))).toEqual([]);
    expect(TITLES.filter((t) => !GOLD_MOODS[t.id]).map((t) => t.id)).toEqual([]);
  });
});

describe("top-K evaluation", () => {
  it("turns every (mood, title) pair into exactly one test case", () => {
    const e = evaluate(TITLES, 10);
    const { tp, tn, fp, fn } = e.overall;
    expect(tp + tn + fp + fn).toBe(TITLES.length * MOODS.length);
  });
  it("predicts exactly K titles per mood", () => {
    const e = evaluate(TITLES, 10);
    for (const m of e.perMood) expect(m.tp + m.fp).toBe(10);
  });
});
