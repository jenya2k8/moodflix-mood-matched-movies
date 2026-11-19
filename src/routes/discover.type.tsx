import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/moodflix/AppShell";
import { OptionCard } from "@/components/moodflix/OptionCard";
import { FieldError, WizardFrame, WizardNav } from "@/components/moodflix/Wizard";
import { useMoodflix } from "@/hooks/use-moodflix";
import { CONTENT_TYPES } from "@/lib/constants";
import { savePreferences } from "@/lib/db";

export const Route = createFileRoute("/discover/type")({
  head: () => ({
    meta: [
      { title: "Movie, series, anime or documentary? — MoodFlix" },
      { name: "description", content: "Choose what kind of title you want to watch." },
      { property: "og:title", content: "Choose what to watch — MoodFlix" },
      { property: "og:description", content: "Movie, series, anime or documentary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <TypeStep />}</AppShell>,
});

function TypeStep() {
  const { preferences } = useMoodflix();
  const [error, setError] = useState<string | null>(null);
  return (
    <WizardFrame
      step="type"
      heading="What kind of watch?"
      sub="We'll tailor the next questions to your pick."
      footer={<WizardNav step="type" onError={setError} validate={() => (preferences.contentType ? null : "Choose a content type to continue.")} />}
    >
      <FieldError message={error} />
      <div role="radiogroup" aria-label="Content type" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {CONTENT_TYPES.map((c, i) => (
          <OptionCard
            key={c.id}
            index={i}
            selected={preferences.contentType === c.id}
            onSelect={() => { savePreferences({ contentType: c.id }); setError(null); }}
            emoji={c.emoji}
            label={c.label}
            blurb={c.blurb}
          />
        ))}
      </div>
    </WizardFrame>
  );
}
