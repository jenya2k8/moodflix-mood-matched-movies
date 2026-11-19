import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { AppShell } from "@/components/moodflix/AppShell";
import { EmptyState } from "@/components/moodflix/EmptyState";
import { Poster } from "@/components/moodflix/Poster";
import { StarRating } from "@/components/moodflix/StarRating";
import { TitleCard } from "@/components/moodflix/TitleCard";
import { TitleRow } from "@/components/moodflix/TitleRow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TITLES, getTitle } from "@/data/titles";
import { useMoodflix } from "@/hooks/use-moodflix";
import { MOOD_LABEL } from "@/lib/constants";
import { removeFromHistory } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ratingWeight, similarTo, type TasteProfile } from "@/lib/recommend";
import type { Mood, Title } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile & history — MoodFlix" },
      { name: "description", content: "Your watch history, ratings, watchlist and picks based on what you loved." },
      { property: "og:title", content: "Your profile — MoodFlix" },
      { property: "og:description", content: "Watch history, ratings, watchlist and personal picks." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell>{() => <Profile />}</AppShell>,
});

function topTraits(profile: TasteProfile) {
  const all = [
    ...Object.entries(profile.genres).map(([k, v]) => ({ label: k, v })),
    ...Object.entries(profile.languages).map(([k, v]) => ({ label: k, v })),
    ...Object.entries(profile.moods).map(([k, v]) => ({ label: MOOD_LABEL[k as Mood], v })),
  ];
  return {
    up: all.filter((x) => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 6),
    down: all.filter((x) => x.v < 0).sort((a, b) => a.v - b.v).slice(0, 6),
  };
}

function Profile() {
  const { user, history, ratings, watchlist, profile, watchedIds } = useMoodflix();
  if (!user) return null;

  const ratingFor = (id: string) => ratings.find((r) => r.titleId === id);
  const loved = [...ratings]
    .filter((r) => ratingWeight(r) >= 1)
    .sort((a, b) => ratingWeight(b) - ratingWeight(a) || b.ratedAt.localeCompare(a.ratedAt))
    .slice(0, 3)
    .map((r) => getTitle(r.titleId))
    .filter((t): t is Title => !!t);
  const traits = topTraits(profile);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-8">
      <header className="flex animate-rise flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand font-display text-4xl font-black shadow-glow">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase md:text-6xl">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.isGuest ? "Guest profile on this device" : user.email} · Joined {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          {[["Watched", history.length], ["Rated", ratings.length], ["Watchlist", watchlist.length]].map(([l, v]) => (
            <div key={l}>
              <p className="font-display text-4xl font-black">{v}</p>
              <p className="text-xs text-muted-foreground uppercase">{l}</p>
            </div>
          ))}
        </div>
      </header>

      {(traits.up.length > 0 || traits.down.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/70 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold uppercase"><TrendingUp className="h-5 w-5 text-success" /> We'll show you more</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {traits.up.length ? traits.up.map((t) => <span key={t.label} className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">{t.label}</span>) : <span className="text-sm text-muted-foreground">Rate a few titles 4★+ to teach us.</span>}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold uppercase"><TrendingDown className="h-5 w-5 text-primary" /> We'll show you less</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {traits.down.length ? traits.down.map((t) => <span key={t.label} className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">{t.label}</span>) : <span className="text-sm text-muted-foreground">Nothing yet — low ratings lower similar titles.</span>}
            </div>
          </div>
        </section>
      )}

      {loved.map((seed) => (
        <TitleRow
          key={seed.id}
          heading={<>Because you liked <span className="text-gradient-brand">{seed.title}</span></>}
          titles={similarTo(seed, TITLES, profile, watchedIds)}
        />
      ))}

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Watch history</TabsTrigger>
          <TabsTrigger value="ratings">My ratings</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          {history.length === 0 ? (
            <EmptyState emoji="📼" title="Nothing watched yet" action={<Button asChild variant="hero"><Link to="/discover/mood">Find something</Link></Button>}>
              Mark titles as watched and they'll show up here.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60">
              {history.map((h) => {
                const t = getTitle(h.titleId);
                if (!t) return null;
                const r = ratingFor(t.id);
                return (
                  <li key={h.titleId} className="flex items-center gap-4 p-3 md:p-4">
                    <Link to="/title/$id" params={{ id: t.id }} className="w-14 shrink-0"><Poster title={t} size="sm" className="rounded-md" /></Link>
                    <div className="min-w-0 flex-1">
                      <Link to="/title/$id" params={{ id: t.id }} className="font-semibold hover:text-primary">{t.title}</Link>
                      <p className="text-xs text-muted-foreground">Watched {formatDate(h.watchedAt)}</p>
                      {r && <div className="mt-1"><StarRating value={r.stars} size="sm" /></div>}
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${t.title} from history`} onClick={() => removeFromHistory(t.id)}>
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          {ratings.length === 0 ? (
            <EmptyState emoji="⭐" title="No ratings yet">Rate what you watch to sharpen your picks.</EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {[...ratings].sort((a, b) => b.ratedAt.localeCompare(a.ratedAt)).map((r) => {
                const t = getTitle(r.titleId);
                if (!t) return null;
                return (
                  <Link key={r.titleId} to="/title/$id" params={{ id: t.id }} className="flex gap-4 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/50">
                    <div className="w-16 shrink-0"><Poster title={t} size="sm" className="rounded-md" /></div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold">{t.title}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <StarRating value={r.stars} size="sm" />
                        {r.liked !== null && <span>{r.liked ? "👍" : "👎"}</span>}
                      </div>
                      {r.note && <p className="line-clamp-2 text-sm text-foreground/75 italic">“{r.note}”</p>}
                      <p className="text-xs text-muted-foreground">{formatDate(r.ratedAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist" className="mt-6">
          {watchlist.length === 0 ? (
            <EmptyState emoji="🔖" title="Your watchlist is empty">Tap “Add to watchlist” on any title to save it for later.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {watchlist.map((w, i) => {
                const t = getTitle(w.titleId);
                return t ? <TitleCard key={t.id} title={t} index={i} watched={watchedIds.has(t.id)} /> : null;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
