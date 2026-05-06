"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { feedbackApi } from "@/lib/queue-api";
import { apiError } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";

function FeedbackForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [tokenId, setTokenId] = useState(params.get("token") || "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anon, setAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!tokenId) return toast.error("Token ID required");
    if (rating < 1) return toast.error("Pick a rating");
    setSubmitting(true);
    try {
      const { data } = await feedbackApi.submit(tokenId, rating, comment, anon);
      toast.success(data.message);
      router.push("/services");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate your experience</CardTitle>
        <CardDescription>
          Feedback can only be left for completed services.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Mongo ObjectId of token"
          />
        </div>

        <div className="grid gap-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1 transition hover:scale-110"
                aria-label={`${n} star`}
              >
                <Star
                  className={`h-7 w-7 ${
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="comment">Comment (optional)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us how it went…"
            rows={4}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={anon}
            onChange={(e) => setAnon(e.target.checked)}
            className="h-4 w-4"
          />
          Submit anonymously
        </label>
      </CardContent>
      <CardFooter>
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit feedback
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function FeedbackPage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <FeedbackForm />
      </Suspense>
    </div>
  );
}
