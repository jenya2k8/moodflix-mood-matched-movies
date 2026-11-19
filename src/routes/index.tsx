import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, UserRound } from "lucide-react";
import { z } from "zod";
import heroPosters from "@/assets/hero-posters.jpg";
import { Logo } from "@/components/moodflix/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMoodflix } from "@/hooks/use-moodflix";
import { AuthError, continueAsGuest, signIn, signUp } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoodFlix — Sign in and find something for your mood" },
      { name: "description", content: "Log in, sign up or continue as a guest to get movie and series picks based on how you feel right now." },
      { property: "og:title", content: "MoodFlix — What are you in the mood for?" },
      { property: "og:description", content: "Mood-based movie, series, anime and documentary recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(40, "Keep it under 40 characters"),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").regex(/\d/, "Include at least one number"),
});

type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

function fieldErrors(err: z.ZodError): Errors {
  const out: Errors = {};
  for (const issue of err.issues) {
    const k = issue.path[0] as keyof Errors;
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

function AuthPage() {
  const navigate = useNavigate();
  const { hydrated, user } = useMoodflix();
  const [tab, setTab] = useState("login");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && user && !busy) navigate({ to: "/welcome" });
  }, [hydrated, user, busy, navigate]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      navigate({ to: "/welcome" });
    } catch (e) {
      setErrors({ form: e instanceof AuthError ? e.message : "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    run(() => signIn(parsed.data.email, parsed.data.password));
  }

  function onSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    run(() => signUp(parsed.data.name, parsed.data.email, parsed.data.password));
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={heroPosters}
        alt=""
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full animate-drift object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-fade-side" />
      <div className="absolute inset-0 bg-fade-bottom" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-8">
        <Logo />
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="animate-rise space-y-5">
            <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">Movies · Series · Anime · Docs</p>
            <h1 className="text-6xl leading-[0.9] font-black uppercase sm:text-7xl md:text-8xl">
              Watch what <br /> you <span className="text-gradient-brand">feel.</span>
            </h1>
            <p className="max-w-md text-lg text-foreground/80">
              Pick a mood, set your length and language, and get a shortlist that actually fits tonight.
            </p>
          </div>

          <div className="glass animate-rise rounded-2xl border border-border p-6 shadow-card md:p-8" style={{ animationDelay: "120ms" }}>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setErrors({}); }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={onLogin} noValidate className="space-y-4">
                  <Field id="login-email" name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
                  <Field id="login-password" name="password" label="Password" type="password" autoComplete="current-password" error={errors.password} />
                  {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
                  <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />} Log in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={onSignup} noValidate className="space-y-4">
                  <Field id="signup-name" name="name" label="Your name" autoComplete="name" error={errors.name} />
                  <Field id="signup-email" name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
                  <Field id="signup-password" name="password" label="Password" type="password" autoComplete="new-password" error={errors.password} hint="At least 8 characters, including a number." />
                  {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
                  <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="glass" size="xl" className="w-full" disabled={busy} onClick={() => run(continueAsGuest)}>
              <UserRound /> Continue as guest
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">Your data is saved on this device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, hint, ...props }: { id: string; label: string; error?: string | undefined; hint?: string | undefined } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="h-11 bg-background/60" {...props} />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
