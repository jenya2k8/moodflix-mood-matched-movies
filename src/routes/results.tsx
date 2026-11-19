import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shuffle, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/moodflix/AppShell";
import { EmptyState } from "@/components/moodflix/EmptyState";
import { TitleGridSkeleton } from "@/components/moodflix/Skeletons";
import { TitleCard } from "@/components/moodflix/TitleCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TITLES } from "@/data/titles";
import { useMoodflix } from "@/hooks/use-moodflix";
import { AGE_LABEL, MOODS, PLATFORMS, TYPE_LABEL } from "@/lib/constants";
import { savePreferences } from "@/lib/db";
import { recommend, relaxPreferences, sortResults, type SortKey } from "@/lib/recommend";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your picks — MoodFlix" },
      { name: "description", content: "Recommendations matched to your mood, length, language and taste." },
      { property: "og:title", content: "Your picks — MoodFlix" },
      { property: "og:description", content: "Recommendations matched to your mood and taste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <Results />}</AppShell>,
});

function Results() {
  const { preferences: p, profile, watchedIds } = useMoodflix();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>("relevance");
  const [loading, setLoading] = useState(true);

  // Brief "crunching" state so results feel considered rather than instant.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => recommend(TITLES, p, { profile, watchedIds }), [p, profile, watchedIds]);
  const sorted = useMemo(() => sortResults(results, sort), [results, sort]);
  const mood = MOODS.find((m) => m.id === p.mood);

  const surprise = () => {
    const pool = results.slice(0, Math.min(10, results.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) navigate({ to: "/title/$id", params: { id: pick.title.id } });
  };

  if (!p.mood || !p.contentType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState emoji="🎬" title="Let's start with your mood" action={<Button asChild variant="hero" size="xl"><Link to="/discover/mood">Pick a mood</Link></Button>}>
          Answer a few quick questions and we'll build your shortlist.
        </EmptyState>
      </div>
    );
  }

  const summary = [
    `${mood?.emoji} ${mood?.label}`,
    TYPE_LABEL[p.contentType],
    `Up to ${AGE_LABEL[p.maxAgeRating]}`,
    p.languages.join(", ") || "Any language",
    `IMDb ${p.minImdb.toFixed(1)}+`,
    PLATFORMS.find((x) => x.id === p.platform)?.label,
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
      <div className="animate-rise space-y-4">
        <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">Your shortlist</p>
        <h1 className="text-5xl font-black uppercase md:text-7xl">
          {loading ? "Finding picks…" : `${results.length} pick${results.length === 1 ? "" : "s"} for you`}
        </h1>
        <div className="flex flex-wrap gap-2">
          {summary.map((s) => (
            <span key={s} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/80">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-40" aria-label="Sort results"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="imdb">IMDb rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass">
            <Link to="/discover/preferences"><SlidersHorizontal /> Edit filters</Link>
          </Button>
          <Button variant="hero" onClick={surprise} disabled={loading || results.length === 0}>
            <Shuffle /> Surprise me
          </Button>
        </div>
      </div>

      {loading ? (
        <TitleGridSkeleton />
      ) : sorted.length === 0 ? (
        <EmptyState
          emoji="🍿"
          title="No matches, try relaxing filters"
          action={
            <>
              <Button variant="hero" onClick={() => savePreferences(relaxPreferences(p))}>Relax filters for me</Button>
              <Button asChild variant="glass"><Link to="/discover/preferences">Adjust preferences</Link></Button>
            </>
          }
        >
          Try more languages, allowing dubbed audio, a lower IMDb minimum or any platform.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((r, i) => (
            <TitleCard key={r.title.id} title={r.title} why={r.why} match={r.match} watched={watchedIds.has(r.title.id)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
