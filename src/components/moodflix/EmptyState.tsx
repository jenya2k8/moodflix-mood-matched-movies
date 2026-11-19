import type { ReactNode } from "react";

export function EmptyState({ emoji, title, children, action }: { emoji: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex animate-rise flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="mt-4 text-3xl font-bold uppercase">{title}</h3>
      {children && <p className="mt-2 max-w-md text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
