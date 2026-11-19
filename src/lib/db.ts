/**
 * Local data layer for MoodFlix.
 *
 * Every "table" is a localStorage key holding an array of rows keyed by userId,
 * mirroring how the data would live in a hosted database. Writes are async so a
 * remote backend can replace this module without changing callers; reads go
 * through `getSnapshot()` for React's useSyncExternalStore.
 */
import { DEFAULT_PREFERENCES } from "./recommend";
import type {
  Preferences,
  RatingEntry,
  StoredUser,
  User,
  WatchEntry,
  WatchlistEntry,
} from "./types";

const KEYS = {
  users: "moodflix:users",
  session: "moodflix:session",
  preferences: "moodflix:preferences",
  history: "moodflix:history",
  ratings: "moodflix:ratings",
  watchlist: "moodflix:watchlist",
} as const;

type PrefRow = Preferences & { userId: string };

// ─── Raw table access ───────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ─── Change notifications ───────────────────────────────────────────────────
const listeners = new Set<() => void>();
let cached: Snapshot | null = null;

function emit() {
  cached = null;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("moodflix:")) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ─── Snapshot for the signed-in user ────────────────────────────────────────
export interface Snapshot {
  hydrated: boolean;
  user: User | null;
  preferences: Preferences;
  history: WatchEntry[];
  ratings: RatingEntry[];
  watchlist: WatchlistEntry[];
}

export const SERVER_SNAPSHOT: Snapshot = {
  hydrated: false,
  user: null,
  preferences: DEFAULT_PREFERENCES,
  history: [],
  ratings: [],
  watchlist: [],
};

export function getSnapshot(): Snapshot {
  if (cached) return cached;
  const sessionId = read<string | null>(KEYS.session, null);
  const stored = read<StoredUser[]>(KEYS.users, []).find((u) => u.id === sessionId) ?? null;
  const user: User | null = stored ? stripPassword(stored) : null;
  const uid = user?.id;
  const prefRow = read<PrefRow[]>(KEYS.preferences, []).find((p) => p.userId === uid);
  cached = {
    hydrated: true,
    user,
    preferences: prefRow ? { ...DEFAULT_PREFERENCES, ...withoutUserId(prefRow) } : DEFAULT_PREFERENCES,
    history: uid
      ? read<WatchEntry[]>(KEYS.history, [])
          .filter((h) => h.userId === uid)
          .sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))
      : [],
    ratings: uid ? read<RatingEntry[]>(KEYS.ratings, []).filter((r) => r.userId === uid) : [],
    watchlist: uid
      ? read<WatchlistEntry[]>(KEYS.watchlist, [])
          .filter((w) => w.userId === uid)
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      : [],
  };
  return cached;
}

function stripPassword(u: StoredUser): User {
  const { passwordHash: _ignored, ...rest } = u;
  return rest;
}

function withoutUserId(p: PrefRow): Preferences {
  const { userId: _ignored, ...rest } = p;
  return rest;
}

function requireUserId(): string {
  const id = read<string | null>(KEYS.session, null);
  if (!id) throw new Error("Not signed in");
  return id;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`moodflix:${email}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class AuthError extends Error {}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const users = read<StoredUser[]>(KEYS.users, []);
  if (users.some((u) => u.email === normalized)) {
    throw new AuthError("An account with this email already exists. Try logging in.");
  }
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    isGuest: false,
    createdAt: now,
    lastLoginAt: now,
    previousLoginAt: null,
    passwordHash: await hashPassword(normalized, password),
  };
  window.localStorage.setItem(KEYS.users, JSON.stringify([...users, user]));
  write(KEYS.session, user.id);
  return stripPassword(user);
}

export async function signIn(email: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const users = read<StoredUser[]>(KEYS.users, []);
  const found = users.find((u) => u.email === normalized);
  if (!found || found.passwordHash !== (await hashPassword(normalized, password))) {
    throw new AuthError("Email or password is incorrect.");
  }
  const updated = { ...found, previousLoginAt: found.lastLoginAt, lastLoginAt: new Date().toISOString() };
  window.localStorage.setItem(KEYS.users, JSON.stringify(users.map((u) => (u.id === found.id ? updated : u))));
  write(KEYS.session, found.id);
  return stripPassword(updated);
}

export async function continueAsGuest(): Promise<User> {
  const users = read<StoredUser[]>(KEYS.users, []);
  const now = new Date().toISOString();
  const guest: StoredUser = {
    id: crypto.randomUUID(),
    name: "Guest",
    email: null,
    isGuest: true,
    createdAt: now,
    lastLoginAt: now,
    previousLoginAt: null,
    passwordHash: null,
  };
  window.localStorage.setItem(KEYS.users, JSON.stringify([...users, guest]));
  write(KEYS.session, guest.id);
  return stripPassword(guest);
}

export async function signOut(): Promise<void> {
  window.localStorage.removeItem(KEYS.session);
  emit();
}

// ─── Preferences ────────────────────────────────────────────────────────────
export async function savePreferences(patch: Partial<Preferences>): Promise<void> {
  const userId = requireUserId();
  const rows = read<PrefRow[]>(KEYS.preferences, []);
  const current = rows.find((r) => r.userId === userId) ?? { ...DEFAULT_PREFERENCES, userId };
  const next = { ...current, ...patch, userId };
  write(KEYS.preferences, [...rows.filter((r) => r.userId !== userId), next]);
}

// ─── History & ratings ──────────────────────────────────────────────────────
export async function markWatched(
  titleId: string,
  rating: { stars: number; liked: boolean | null; note: string },
): Promise<void> {
  const userId = requireUserId();
  const now = new Date().toISOString();
  const history = read<WatchEntry[]>(KEYS.history, []).filter(
    (h) => !(h.userId === userId && h.titleId === titleId),
  );
  window.localStorage.setItem(KEYS.history, JSON.stringify([...history, { userId, titleId, watchedAt: now }]));
  const ratings = read<RatingEntry[]>(KEYS.ratings, []).filter(
    (r) => !(r.userId === userId && r.titleId === titleId),
  );
  write(KEYS.ratings, [...ratings, { userId, titleId, ...rating, ratedAt: now }]);
}

export async function removeFromHistory(titleId: string): Promise<void> {
  const userId = requireUserId();
  const notThis = <T extends { userId: string; titleId: string }>(r: T) =>
    !(r.userId === userId && r.titleId === titleId);
  window.localStorage.setItem(KEYS.history, JSON.stringify(read<WatchEntry[]>(KEYS.history, []).filter(notThis)));
  write(KEYS.ratings, read<RatingEntry[]>(KEYS.ratings, []).filter(notThis));
}

// ─── Watchlist ──────────────────────────────────────────────────────────────
export async function toggleWatchlist(titleId: string): Promise<boolean> {
  const userId = requireUserId();
  const rows = read<WatchlistEntry[]>(KEYS.watchlist, []);
  const exists = rows.some((r) => r.userId === userId && r.titleId === titleId);
  write(
    KEYS.watchlist,
    exists
      ? rows.filter((r) => !(r.userId === userId && r.titleId === titleId))
      : [...rows, { userId, titleId, addedAt: new Date().toISOString() }],
  );
  return !exists;
}
