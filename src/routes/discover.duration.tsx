import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/moodflix/AppShell";
import { OptionCard } from "@/components/moodflix/OptionCard";
import { FieldError, WizardFrame, WizardNav } from "@/components/moodflix/Wizard";
import { useMoodflix } from "@/hooks/use-moodflix";
import { EPISODE_LENGTHS, MOVIE_DURATIONS, SEASON_LENGTHS } from "@/lib/constants";
import { savePreferences } from "@/lib/db";
import type { LengthBucket, Preferences } from "@/lib/types";

export const Route = createFileRoute("/discover/duration")({
  head: () => ({
    meta: [
      { title: "How long do you want to watch? — MoodFlix" },
      { name: "description", content: "Set a runtime for movies, or episode length and seasons for series." },
      { property: "og:title", content: "Pick a length — MoodFlix" },
      { property: "og:description", content: "Runtime, episode length and number of seasons." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <DurationStep />}</AppShell>,
});

function Group({ label, options, field, value }: { label: string; options: readonly { id: string; label: string; blurb: string }[]; field: keyof Preferences; value: LengthBucket | null }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold uppercase">{label}</h2>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {options.map((o, i) => (
          <OptionCard key={o.id} size="md" index={i} selected={value === o.id} onSelect={() => savePreferences({ [field]: o.id as LengthBucket })} label={o.label} blurb={o.blurb} />
        ))}
      </div>
    </section>
  );
}

function DurationStep() {
  const { preferences: p } = useMoodflix();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const isMovie = p.contentType === "movie";
  const isSeries = p.contentType === "series";

  // This step only applies to movies and series.
  useEffect(() => {
    if (!isMovie && !isSeries) navigate({ to: p.contentType ? "/discover/preferences" : "/discover/type", replace: true });
  }, [isMovie, isSeries, p.contentType, navigate]);

  const validate = () => {
    if (isMovie && !p.movieDuration) return "Choose a runtime (or “Any length”).";
    if (isSeries && !p.episodeLength) return "Choose an episode length.";
    if (isSeries && !p.seasonLength) return "Choose how many seasons you're up for.";
    return null;
  };

  return (
    <WizardFrame
      step="duration"
      heading={isSeries ? "How much time have you got?" : "How long a movie?"}
      sub={isSeries ? "Episode length and how deep you want to go." : "Pick a runtime that fits your evening."}
      footer={<WizardNav step="duration" onError={setError} validate={validate} />}
    >
      <FieldError message={error} />
      {isMovie && <Group label="Runtime" options={MOVIE_DURATIONS} field="movieDuration" value={p.movieDuration} />}
      {isSeries && (
        <div className="space-y-10">
          <Group label="Episode length" options={EPISODE_LENGTHS} field="episodeLength" value={p.episodeLength} />
          <Group label="Seasons" options={SEASON_LENGTHS} field="seasonLength" value={p.seasonLength} />
        </div>
      )}
    </WizardFrame>
  );
}
