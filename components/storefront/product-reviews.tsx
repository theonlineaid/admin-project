"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MessageSquare, CheckCircle2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

export function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, pct };
  });

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 3) {
      toast.error("Please write a meaningful review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/storefront/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review");
      } else {
        toast.success("Thank you! Your review has been published.");
        setReviews([data, ...reviews]);
        setShowForm(false);
        setTitle("");
        setComment("");
        setRating(5);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t border-border pt-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Customer Reviews & Ratings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real feedback from verified buyers of this product.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          className="gap-2 shrink-0 font-medium"
        >
          <MessageSquare className="h-4 w-4" />
          {showForm ? "Cancel Review" : "Write a Review"}
        </Button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5 animate-in fade-in duration-200"
        >
          <h3 className="font-semibold text-lg text-foreground">Share Your Experience</h3>

          {/* Interactive Rating Stars */}
          <div>
            <Label className="block mb-2">Your Rating</Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-foreground">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="review-title">Review Headline (optional)</Label>
            <Input
              id="review-title"
              placeholder="e.g. Excellent quality, exceeded my expectations!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="review-comment">Review Details</Label>
            <textarea
              id="review-comment"
              rows={4}
              required
              placeholder="What did you love or think could be improved about this item?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" disabled={submitting} className="font-semibold">
            {submitting ? "Publishing…" : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Rating Breakdown & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rounded-2xl bg-muted/40 p-6 border border-border/80">
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
          <span className="font-display text-5xl font-black text-foreground">{avgRating}</span>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="mt-1 text-xs text-muted-foreground">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {breakdown.map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-medium text-foreground">{stars} stars</span>
              <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground rounded-xl border border-dashed border-border">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-medium">No reviews yet.</p>
            <p className="text-xs mt-1">Be the first customer to leave your thoughts on this product!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                    {rev.user.image ? (
                      <Image src={rev.user.image} alt={rev.user.name} fill sizes="32px" className="object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {rev.user.name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(String(rev.createdAt))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.title && (
                <h4 className="font-semibold text-sm text-foreground">{rev.title}</h4>
              )}

              {rev.comment && (
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

