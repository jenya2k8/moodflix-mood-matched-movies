import type { ReactNode } from "react";
import { TitleCard } from "./TitleCard";
import type { Title } from "@/lib/types";

export function TitleRow({ heading, titles, watchedIds }: { heading: ReactNode; titles: Title[]; watchedIds?: Set<string> }) {
  if (titles.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold uppercase md:text-3xl">{heading}</h2>
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8">
        {titles.map((t, i) => (
          <div key={t.id} className="w-36 shrink-0 snap-start sm:w-44">
            <TitleCard title={t} index={i} watched={watchedIds?.has(t.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}
