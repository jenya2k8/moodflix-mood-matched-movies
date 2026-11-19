import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell } from "@/components/moodflix/AppShell";
import { Chip } from "@/components/moodflix/Chip";
import { FieldError, WizardFrame, WizardNav } from "@/components/moodflix/Wizard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useMoodflix } from "@/hooks/use-moodflix";
import { AGE_RATINGS, ERAS, GENRES, LANGUAGES, PLATFORMS } from "@/lib/constants";
import { savePreferences } from "@/lib/db";

export const Route = createFileRoute("/discover/preferences")({
  head: () => ({
    meta: [
      { title: "Fine-tune your picks — MoodFlix" },
      { name: "description", content: "Set age rating, languages, audio, subtitles, minimum IMDb rating, genres, era and platform." },
      { property: "og:title", content: "Fine-tune your picks — MoodFlix" },
      { property: "og:description", content: "Languages, subtitles, IMDb rating, genres and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <PreferencesStep />}</AppShell>,
});

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="animate-rise space-y-3 rounded-2xl border border-border bg-card/70 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold uppercase">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function PreferencesStep() {
  const { preferences: p } = useMoodflix();
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!p.mood) return "Go back and pick a mood first.";
    if (!p.contentType) return "Go back and choose a content type first.";
    if (p.languages.length === 0) return "Choose at least one language.";
    if (p.subtitles && !p.subtitleLanguage) return "Choose a subtitle language, or turn subtitles off.";
    return null;
  };

  return (
    <WizardFrame
      step="preferences"
      heading="Fine-tune it"
      sub="The more you tell us, the sharper the shortlist."
      footer={<WizardNav step="preferences" onError={setError} validate={validate} />}
    >
      <FieldError message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Age rating" hint="Highest rating allowed">
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {AGE_RATINGS.map((a) => (
              <Chip key={a.id} multi={false} selected={p.maxAgeRating === a.id} onClick={() => savePreferences({ maxAgeRating: a.id })}>
                {a.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Audio">
          <div role="radiogroup" className="flex flex-wrap gap-2">
            <Chip multi={false} selected={p.audio === "original"} onClick={() => savePreferences({ audio: "original" })}>Original audio</Chip>
            <Chip multi={false} selected={p.audio === "dubbed"} onClick={() => savePreferences({ audio: "dubbed" })}>Dubbed is fine</Chip>
          </div>
          <p className="text-xs text-muted-foreground">
            {p.audio === "dubbed" ? "Includes titles dubbed into your languages." : "Only titles originally in your languages."}
          </p>
        </Section>

        <Section title="Languages" hint="Pick one or more">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Chip key={l} selected={p.languages.includes(l)} onClick={() => { savePreferences({ languages: toggle(p.languages, l) }); setError(null); }}>
                {l}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Subtitles">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={p.subtitles} onCheckedChange={(v) => savePreferences({ subtitles: v })} aria-label="Subtitles" />
              {p.subtitles ? "On" : "Off"}
            </label>
            {p.subtitles && (
              <Select value={p.subtitleLanguage ?? undefined} onValueChange={(v) => savePreferences({ subtitleLanguage: v })}>
                <SelectTrigger className="w-44" aria-label="Subtitle language">
                  <SelectValue placeholder="Subtitle language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Section>

        <Section title="Minimum IMDb" hint="5.0 – 9.0">
          <div className="flex items-center gap-5">
            <Slider
              min={5}
              max={9}
              step={0.1}
              value={[p.minImdb]}
              onValueChange={([v]) => savePreferences({ minImdb: Math.round(v * 10) / 10 })}
              aria-label="Minimum IMDb rating"
            />
            <span className="inline-flex min-w-16 items-center gap-1 font-display text-3xl font-black text-gold">
              <Star className="h-5 w-5 fill-current" /> {p.minImdb.toFixed(1)}
            </span>
          </div>
        </Section>

        <Section title="Platform">
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {PLATFORMS.map((pl) => (
              <Chip key={pl.id} multi={false} selected={p.platform === pl.id} onClick={() => savePreferences({ platform: pl.id })}>
                {pl.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Genres" hint="Optional">
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Chip key={g} selected={p.genres.includes(g)} onClick={() => savePreferences({ genres: toggle(p.genres, g) })}>
                {g}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Release era" hint="Optional — none means any">
          <div className="flex flex-wrap gap-2">
            {ERAS.map((e) => (
              <Chip key={e.id} selected={p.eras.includes(e.id)} onClick={() => savePreferences({ eras: toggle(p.eras, e.id) })}>
                {e.label} <span className="ml-1 opacity-60">{e.blurb}</span>
              </Chip>
            ))}
          </div>
        </Section>
      </div>
    </WizardFrame>
  );
}
