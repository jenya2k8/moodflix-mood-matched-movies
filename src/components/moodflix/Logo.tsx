import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group inline-flex items-baseline gap-0.5 font-display text-3xl font-black tracking-tight uppercase", className)}>
      <span className="text-gradient-brand">Mood</span>
      <span className="text-foreground">Flix</span>
      <span className="ml-1 h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-150" />
    </Link>
  );
}
