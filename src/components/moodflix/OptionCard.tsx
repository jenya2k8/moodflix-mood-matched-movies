import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selected: boolean;
  onSelect: () => void;
  label: string;
  emoji?: string;
  blurb?: string;
  index?: number;
  size?: "lg" | "md";
}

/** Large selectable card used throughout the wizard. */
export function OptionCard({ selected, onSelect, label, emoji, blurb, index = 0, size = "lg" }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        "group relative flex animate-rise flex-col items-start overflow-hidden rounded-2xl border bg-card text-left transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        size === "lg" ? "gap-3 p-5 md:p-6" : "gap-1 p-4",
        selected ? "border-primary bg-surface-raised shadow-glow" : "border-border",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-brand opacity-0 transition-opacity duration-300",
          selected ? "opacity-15" : "group-hover:opacity-5",
        )}
      />
      {emoji && (
        <span className={cn("relative transition-transform duration-300 group-hover:scale-110", size === "lg" ? "text-5xl" : "text-3xl")}>{emoji}</span>
      )}
      <span className={cn("relative font-display font-bold uppercase", size === "lg" ? "text-2xl" : "text-xl")}>{label}</span>
      {blurb && <span className="relative text-sm text-muted-foreground">{blurb}</span>}
      <span
        className={cn(
          "absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
          selected ? "border-primary bg-primary text-primary-foreground scale-100" : "border-border scale-90 opacity-0 group-hover:opacity-100",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
