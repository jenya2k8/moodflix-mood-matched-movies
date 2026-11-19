import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Eye, Star } from "lucide-react";
import { AppShell } from "@/components/moodflix/AppShell";
import { TitleRow } from "@/components/moodflix/TitleRow";
import { Button } from "@/components/ui/button";
import { TITLES, getTitle } from "@/data/titles";
import { useMoodflix } from "@/hooks/use-moodflix";
import { MOODS } from "@/lib/constants";
import { similarTo } from "@/lib/recommend";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — MoodFlix" },
      { name: "description", content: "Pick up where you left off and find tonight's watch on MoodFlix." },
      { property: "og:title", content: "Welcome — MoodFlix" },
      { property: "og:description", content: "Pick up where you left off and find tonight's watch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <Welcome />}</AppShell>,
});

function Welcome() {
  const { user, history, ratings, watchlist, preferences, profile, watchedIds } = useMoodflix();
  if (!user) return null;
  const returning = !!user.previousLoginAt;
  const lastMood = MOODS.find((m) => m.id === preferences.mood);
  const topRated = [...ratings].sort((a, b) => b.stars - a.stars).find((r) => r.stars >= 4);
  const seed = topRated ? getTitle(topRated.titleId) : undefined;

  const stats = [
    { label: "Watched", value: history.length, Icon: Eye },
    { label: "Rated", value: ratings.length, Icon: Star },
    { label: "Watchlist", value: watchlist.length, Icon: Bookmark },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 md:px-8 md:py-20">
      <section className="animate-rise space-y-6">
        <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">{returning ? "Good to see you" : "You're in"}</p>
        <h1 className="text-6xl leading-[0.9] font-black uppercase md:text-8xl">
          {returning ? "Welcome back," : "Welcome,"} <br />
          <span className="text-gradient-brand">{user.name}</span>
        </h1>
        <p className="max-w-lg text-lg text-foreground/80">
          {lastMood
            ? `Last time you were feeling ${lastMood.label.toLowerCase()} ${lastMood.emoji}. How about now?`
            : "Tell us how you're feeling and we'll line up something worth watching."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero" size="xl">
            <Link to="/discover/mood">
              Find my next watch <ArrowRight />
            </Link>
          </Button>
          {preferences.mood && preferences.contentType && (
            <Button asChild variant="glass" size="xl">
              <Link to="/results">See last picks</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 md:max-w-xl">
        {stats.map(({ label, value, Icon }, i) => (
          <div key={label} className="animate-rise rounded-xl border border-border bg-card p-4" style={{ animationDelay: `${150 + i * 60}ms` }}>
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-2 font-display text-4xl font-black">{value}</p>
            <p className="text-xs text-muted-foreground uppercase">{label}</p>
          </div>
        ))}
      </section>

      {seed && (
        <TitleRow heading={<>Because you liked <span className="text-gradient-brand">{seed.title}</span></>} titles={similarTo(seed, TITLES, profile, watchedIds)} />
      )}
      <TitleRow heading="Top rated right now" titles={[...TITLES].sort((a, b) => b.imdbRating - a.imdbRating).slice(0, 12)} watchedIds={watchedIds} />
    </div>
  );
}
