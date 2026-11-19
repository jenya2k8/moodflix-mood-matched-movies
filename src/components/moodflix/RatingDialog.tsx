import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { markWatched } from "@/lib/db";
import type { RatingEntry, Title } from "@/lib/types";
import { cn } from "@/lib/utils";

const NOTE_MAX = 280;

export function RatingDialog({
  title,
  open,
  onOpenChange,
  existing,
}: {
  title: Title;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  existing?: RatingEntry;
}) {
  const [stars, setStars] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStars(existing?.stars ?? 0);
      setLiked(existing?.liked ?? null);
      setNote(existing?.note ?? "");
      setError(null);
    }
  }, [open, existing]);

  async function submit() {
    if (stars < 1) return setError("Pick a rating from 1 to 5 stars.");
    if (note.length > NOTE_MAX) return setError(`Keep your note under ${NOTE_MAX} characters.`);
    setSaving(true);
    await markWatched(title.id, { stars, liked, note: note.trim() });
    setSaving(false);
    onOpenChange(false);
    toast.success(`Saved “${title.title}” to your history`, {
      description: stars >= 4 ? "We'll find more like this for you." : "Thanks — we'll tune your picks.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl uppercase">How was it?</DialogTitle>
          <DialogDescription>Rate “{title.title}” to sharpen your recommendations.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="flex flex-col items-center gap-2">
            <StarRating value={stars} onChange={(v) => { setStars(v); setError(null); }} />
            <span className="text-xs text-muted-foreground">{stars ? `${stars} / 5` : "Tap a star"}</span>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { v: true, label: "Liked it", Icon: ThumbsUp },
              { v: false, label: "Not for me", Icon: ThumbsDown },
            ].map(({ v, label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={liked === v}
                onClick={() => setLiked(liked === v ? null : v)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  liked === v
                    ? v
                      ? "border-success bg-success/15 text-success"
                      : "border-primary bg-primary/15 text-primary"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="note" className="text-sm font-medium">Note <span className="text-muted-foreground">(optional)</span></label>
            <Textarea id="note" value={note} maxLength={NOTE_MAX + 20} onChange={(e) => setNote(e.target.value)} placeholder="What stood out?" rows={3} />
            <p className={cn("text-right text-xs", note.length > NOTE_MAX ? "text-destructive" : "text-muted-foreground")}>{note.length}/{NOTE_MAX}</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" onClick={submit} disabled={saving}>Save rating</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
