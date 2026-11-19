import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "./Logo";
import { PageSkeleton } from "./Skeletons";
import { Button } from "@/components/ui/button";
import { useMoodflix } from "@/hooks/use-moodflix";
import { signOut } from "@/lib/db";
import type { User } from "@/lib/types";

/** Page frame for signed-in pages. Sends visitors without a session to the login page. */
export function AppShell({ children }: { children: (user: User) => ReactNode }) {
  const { hydrated, user } = useMoodflix();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/" });
  }, [hydrated, user, navigate]);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Logo className="text-2xl md:text-3xl" />
          {user && (
            <nav className="flex items-center gap-1 md:gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/discover/mood" activeProps={{ className: "text-primary" }}>
                  <Compass /> <span className="hidden sm:inline">Discover</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile" activeProps={{ className: "text-primary" }}>
                  <UserIcon /> <span className="hidden sm:inline">{user.name}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut />
              </Button>
            </nav>
          )}
        </div>
      </header>
      <main>{hydrated && user ? children(user) : <PageSkeleton />}</main>
    </div>
  );
}
