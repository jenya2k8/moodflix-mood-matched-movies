import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMoodflix } from "@/hooks/use-moodflix";
import { getSteps, STEP_LABEL, STEP_PATH, type WizardStep } from "@/lib/wizard";
import { cn } from "@/lib/utils";

export function WizardProgress({ step }: { step: WizardStep }) {
  const { preferences } = useMoodflix();
  const steps = getSteps(preferences);
  const index = steps.indexOf(step);
  const pct = ((index + 1) / (steps.length + 1)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        <span>Step {index + 1} of {steps.length}</span>
        <span className="hidden gap-4 sm:flex">
          {steps.map((s, i) => (
            <span key={s} className={cn(i <= index && "text-foreground", i === index && "text-primary")}>{STEP_LABEL[s]}</span>
          ))}
          <span>Results</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WizardFrame({ step, heading, sub, children, footer }: { step: WizardStep; heading: string; sub: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-8 pb-32 md:px-8 md:pt-12">
      <WizardProgress step={step} />
      <div key={step} className="animate-rise space-y-2">
        <h1 className="text-5xl font-black uppercase md:text-6xl">{heading}</h1>
        <p className="text-muted-foreground">{sub}</p>
      </div>
      {children}
      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 md:px-8">{footer}</div>
      </div>
    </div>
  );
}

/**
 * Back / Next buttons. `validate` returns an error message or null; Next only
 * advances when it returns null.
 */
export function WizardNav({ step, validate, onError }: { step: WizardStep; validate: () => string | null; onError: (msg: string | null) => void }) {
  const navigate = useNavigate();
  const { preferences } = useMoodflix();
  const steps = getSteps(preferences);
  const index = steps.indexOf(step);
  const isLast = index === steps.length - 1;

  const back = () => {
    if (index <= 0) navigate({ to: "/welcome" });
    else navigate({ to: STEP_PATH[steps[index - 1]] });
  };
  const next = () => {
    const err = validate();
    onError(err);
    if (err) return;
    if (isLast) navigate({ to: "/results" });
    else navigate({ to: STEP_PATH[steps[index + 1]] });
  };

  return (
    <>
      <Button variant="glass" size="xl" onClick={back}>
        <ArrowLeft /> Back
      </Button>
      <Button variant="hero" size="xl" onClick={next}>
        {isLast ? (<><Sparkles /> Show my picks</>) : (<>Next <ArrowRight /></>)}
      </Button>
    </>
  );
}

export function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="animate-fade rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">{message}</p>;
}
