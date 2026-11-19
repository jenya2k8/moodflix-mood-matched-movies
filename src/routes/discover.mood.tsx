import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/moodflix/AppShell";
import { OptionCard } from "@/components/moodflix/OptionCard";
import { FieldError, WizardFrame, WizardNav } from "@/components/moodflix/Wizard";
import { useMoodflix } from "@/hooks/use-moodflix";
import { MOODS } from "@/lib/constants";
import { savePreferences } from "@/lib/db";

export const Route = createFileRoute("/discover/mood")({
  head: () => ({
    meta: [
      { title: "Pick your mood — MoodFlix" },
      { name: "description", content: "Happy, sad, thrilled or nostalgic? Choose how you feel to start your recommendations." },
      { property: "og:title", content: "Pick your mood — MoodFlix" },
      { property: "og:description", content: "Choose how you feel to start your recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <MoodStep />}</AppShell>,
});

function MoodStep() {
  const { preferences } = useMoodflix();
  const [error, setError] = useState<string | null>(null);
  return (
    <WizardFrame
      step="mood"
      heading="How are you feeling?"
      sub="Pick the mood you want to match tonight."
      footer={<WizardNav step="mood" onError={setError} validate={() => (preferences.mood ? null : "Pick a mood to continue.")} />}
    >
      <FieldError message={error} />
      <div role="radiogroup" aria-label="Mood" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {MOODS.map((m, i) => (
          <OptionCard
            key={m.id}
            index={i}
            selected={preferences.mood === m.id}
            onSelect={() => { savePreferences({ mood: m.id }); setError(null); }}
            emoji={m.emoji}
            label={m.label}
            blurb={m.blurb}
          />
        ))}
      </div>
    </WizardFrame>
  );
}
