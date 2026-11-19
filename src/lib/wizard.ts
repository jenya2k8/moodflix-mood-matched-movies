import type { Preferences } from "./types";

export type WizardStep = "mood" | "type" | "duration" | "preferences";

export const STEP_LABEL: Record<WizardStep, string> = {
  mood: "Mood",
  type: "Type",
  duration: "Duration",
  preferences: "Preferences",
};

export const STEP_PATH = {
  mood: "/discover/mood",
  type: "/discover/type",
  duration: "/discover/duration",
  preferences: "/discover/preferences",
} as const;

/** The duration step only applies to movies and series. */
export function getSteps(p: Pick<Preferences, "contentType">): WizardStep[] {
  const steps: WizardStep[] = ["mood", "type"];
  if (p.contentType === "movie" || p.contentType === "series") steps.push("duration");
  steps.push("preferences");
  return steps;
}
