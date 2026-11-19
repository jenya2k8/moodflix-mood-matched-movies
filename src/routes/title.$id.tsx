import { useState, type CSSProperties } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Clock, Play, Star } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/moodflix/AppShell";
import { Poster } from "@/components/moodflix/Poster";
import { RatingDialog } from "@/components/moodflix/RatingDialog";
import { StarRating } from "@/components/moodflix/StarRating";
import { TitleRow } from "@/components/moodflix/TitleRow";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TITLES, getTitle } from "@/data/titles";
import { useMoodflix } from "@/hooks/use-moodflix";
import { AGE_LABEL, MOOD_LABEL, PLATFORM_LABEL, TYPE_LABEL } from "@/lib/constants";
import { toggleWatchlist } from "@/lib/db";
import { formatRuntime } from "@/lib/format";
import { similarTo } from "@/lib/recommend";
import type { Title } from "@/lib/types";

export const Route = createFileRoute("/title/$id")({
  loader: ({ params }) => {
    const title = getTitle(params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.title;
    if (!t) return { meta: [{ title: "Title not found — MoodFlix" }, { name: "robots", content: "noindex" }] };
    const desc = `${t.description} ${TYPE_LABEL[t.type]} · ${t.year} · IMDb ${t.imdbRating}.`;
    return {
      meta: [
        { title: `${t.title} (${t.year}) — MoodFlix` },
        { name: "description", content: desc },
        { property: "og:title", content: `${t.title} — MoodFlix` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "video.other" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-5xl font-black uppercase">Title not found</h1>
      <Button asChild variant="hero"><Link to="/results">Back to picks</Link></Button>
    </div>
  ),
  component: DetailPage,
});

function DetailPage() {
  const { title } = Route.useLoaderData();
  return <AppShell>{() => <Detail key={title.id} title={title} />}</AppShell>;
}

function Detail({ title: t }: { title: Title }) {
  const router = useRouter();
  const { ratings, watchedIds, watchlistIds, profile } = useMoodflix();
  const [open, setOpen] = useState(false);
  const audioOptions = [`${t.language} (original)`, ...t.dubbedLanguages.map((l) => `${l} (dubbed)`)];
  const [audio, setAudio] = useState<string>(audioOptions[0] ?? "");
  const [subs, setSubs] = useState<string>(t.subtitles[0] ?? "off");
  const rating = ratings.find((r) => r.titleId === t.id);
  const watched = watchedIds.has(t.id);
  const inList = watchlistIds.has(t.id);
  const style = { "--h1": t.poster.hues[0], "--h2": t.poster.hues[1] } as CSSProperties;

  return (
    <div className="relative">
      <div style={style} className="poster-art absolute inset-x-0 top-0 h-[70vh] opacity-50 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[70vh] bg-fade-bottom" aria-hidden />

      <div className="relative mx-auto max-w-6xl space-y-14 px-4 py-8 md:px-8 md:py-12">
        <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft /> Back
        </Button>

        <div className="grid gap-8 md:grid-cols-[280px_1fr] md:gap-12">
          <div className="mx-auto w-56 animate-rise md:w-full">
            <Poster title={t} size="lg" className="shadow-card ring-1 ring-border" />
          </div>

          <div className="animate-rise space-y-6" style={{ animationDelay: "80ms" }}>
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">
                {TYPE_LABEL[t.type]} · {PLATFORM_LABEL[t.platform]}
              </p>
              <h1 className="text-5xl leading-[0.9] font-black uppercase md:text-7xl">{t.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/80">
                <span className="inline-flex items-center gap-1 font-semibold text-gold"><Star className="h-4 w-4 fill-current" /> {t.imdbRating.toFixed(1)} IMDb</span>
                <span>{t.year}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {formatRuntime(t)}</span>
                {t.episodes && t.episodes > 1 && <span>{t.episodes} episodes</span>}
                <span className="rounded border border-border px-1.5 text-xs font-semibold">{AGE_LABEL[t.ageRating]}</span>
                <span>{t.language}</span>
              </div>
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-foreground/90">{t.description}</p>

            <div className="flex flex-wrap gap-2">
              {t.genres.map((g) => (
                <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{g}</span>
              ))}
              {t.moods.map((m) => (
                <span key={m} className="rounded-full border border-violet/50 px-3 py-1 text-xs font-medium text-foreground/80">{MOOD_LABEL[m]}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="xl" onClick={() => setOpen(true)}>
                <Check /> {watched ? "Update my rating" : "Mark as watched"}
              </Button>
              <Button
                variant="glass"
                size="xl"
                onClick={async () => {
                  const added = await toggleWatchlist(t.id);
                  toast(added ? "Added to your watchlist" : "Removed from your watchlist");
                }}
              >
                {inList ? <BookmarkCheck className="text-primary" /> : <Bookmark />} {inList ? "In watchlist" : "Add to watchlist"}
              </Button>
            </div>

            {rating && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/70 p-4 text-sm">
                <span className="text-muted-foreground">Your rating</span>
                <StarRating value={rating.stars} size="sm" />
                {rating.liked !== null && <span>{rating.liked ? "👍 Liked" : "👎 Not for you"}</span>}
                {rating.note && <span className="text-foreground/80 italic">“{rating.note}”</span>}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Audio</span>
                <Select value={audio} onValueChange={setAudio}>
                  <SelectTrigger aria-label="Audio track"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {audioOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Subtitles</span>
                <Select value={subs} onValueChange={setSubs}>
                  <SelectTrigger aria-label="Subtitles"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    {t.subtitles.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Cast</span>
              <p className="mt-1 text-foreground/90">{t.cast.join(" · ")}</p>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-3xl font-bold uppercase">Trailer</h2>
          <button
            type="button"
            style={style}
            onClick={() => toast("Trailer coming soon", { description: `We'll add the ${t.title} trailer here.` })}
            className="poster-art poster-grain group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl ring-1 ring-border"
          >
            <span className="absolute inset-0 bg-background/40 transition-colors group-hover:bg-background/20" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand shadow-glow transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 fill-current" />
            </span>
            <span className="absolute bottom-4 left-5 font-display text-2xl font-black uppercase">{t.title} — Official trailer</span>
          </button>
        </section>

        <TitleRow heading="More like this" titles={similarTo(t, TITLES, profile, new Set())} watchedIds={watchedIds} />
      </div>

      <RatingDialog title={t} open={open} onOpenChange={setOpen} existing={rating} />
    </div>
  );
}
