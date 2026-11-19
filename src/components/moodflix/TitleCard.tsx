import { Link } from "@tanstack/react-router";
import { Star, Clock, Check } from "lucide-react";
import { Poster } from "./Poster";
import { AGE_LABEL } from "@/lib/constants";
import { formatRuntime } from "@/lib/format";
import type { Title } from "@/lib/types";

interface Props {
  title: Title;
  why?: string;
  match?: number;
  watched?: boolean;
  index?: number;
}

export function TitleCard({ title, why, match, watched, index = 0 }: Props) {
  return (
    <Link
      to="/title/$id"
      params={{ id: title.id }}
      className="group block animate-rise focus-visible:outline-none"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="relative transition-transform duration-300 group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
        <Poster title={title} className="shadow-card ring-1 ring-border transition-shadow duration-300 group-hover:shadow-glow group-hover:ring-primary/60 group-focus-visible:ring-2 group-focus-visible:ring-primary" />
        {typeof match === "number" && (
          <span className="absolute top-8 left-2.5 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-bold text-success backdrop-blur">
            {match}% match
          </span>
        )}
        {watched && (
          <span className="absolute top-8 right-2.5 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur">
            <Check className="h-3 w-3" /> Watched
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        <h3 className="truncate font-sans text-sm font-semibold tracking-normal text-foreground">{title.title}</h3>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-semibold text-gold">
            <Star className="h-3 w-3 fill-current" /> {title.imdbRating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatRuntime(title)}
          </span>
          <span className="rounded border border-border px-1 text-[10px] font-semibold">{AGE_LABEL[title.ageRating]}</span>
          <span>{title.language}</span>
        </div>
        {why && <p className="line-clamp-2 text-xs leading-snug text-foreground/80">{why}</p>}
      </div>
    </Link>
  );
}
