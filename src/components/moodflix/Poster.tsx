import type { CSSProperties } from "react";
import { TYPE_LABEL } from "@/lib/constants";
import type { Title } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Typographic poster art generated from the title's palette. */
export function Poster({ title, className, size = "md" }: { title: Title; className?: string; size?: "sm" | "md" | "lg" }) {
  const style = { "--h1": title.poster.hues[0], "--h2": title.poster.hues[1] } as CSSProperties;
  return (
    <div
      style={style}
      className={cn("poster-art poster-grain relative aspect-[2/3] overflow-hidden rounded-lg", className)}
      role="img"
      aria-label={`${title.title} poster`}
    >
      {title.poster.url ? (
        <img src={title.poster.url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-6 font-display text-[9rem] font-black leading-none text-foreground/10 select-none"
          >
            {title.title.replace(/[^A-Za-z0-9]/g, "").charAt(0)}
          </span>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 text-[10px] font-semibold tracking-[0.2em] text-foreground/70 uppercase">
            <span>{TYPE_LABEL[title.type]}</span>
            <span>{title.year}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-fade-bottom p-3 pt-10">
            <p
              className={cn(
                "font-display leading-[0.95] font-black text-balance text-foreground uppercase",
                size === "sm" && "text-lg",
                size === "md" && "text-2xl",
                size === "lg" && "text-4xl md:text-5xl",
              )}
            >
              {title.title}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-foreground/60 uppercase">{title.language}</p>
          </div>
        </>
      )}
    </div>
  );
}
