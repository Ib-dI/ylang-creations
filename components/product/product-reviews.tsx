"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type ReviewWithUser, submitReview } from "@/lib/actions/reviews";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewWithUser[];
  averageRating: number;
  totalReviews: number;
  currentUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  currentUser,
}: ProductReviewsProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [hoverRating, setHoverRating] = useState(0);

  const MAX_COMMENT_LENGTH = 500;
  const ratingLabels = ["", "Terrible", "Mauvais", "Passable", "Bien", "Excellent"] as const;
  const activeRatingLabel = ratingLabels[hoverRating || rating];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        productId,
        rating,
        comment,
      });

      if (result.success) {
        toast.success("Votre avis a été publié !");
        setRating(0);
        setComment("");
        router.refresh();
      } else {
        toast.error("Erreur lors de la publication de l'avis");
      }
    });
  };

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div
            className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase"
            style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
          >
            <MessageSquare className="h-3 w-3" />
            <span>Témoignages</span>
          </div>
          <h2
            className="text-3xl tracking-tight lg:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            L&apos;avis de nos clients
          </h2>
        </div>

        <div
          className="flex items-center gap-6"
          style={{ border: "var(--rule-hair)", padding: "1rem 1.5rem" }}
        >
          <div className="text-center">
            <span
              className="block text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {averageRating.toFixed(1)}
            </span>
            <span className="font-body text-[10px] font-medium tracking-tighter uppercase" style={{ color: "var(--color-ink)", opacity: 0.4 }}>
              Note moyenne
            </span>
          </div>
          <div style={{ width: "1px", height: "2.5rem", background: "var(--rule-soft)" }} />
          <div className="space-y-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="font-body text-xs" style={{ color: "var(--color-ink)", opacity: 0.6 }}>
              Basé sur {totalReviews} avis authentiques
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        {/* Formulaire d'avis */}
        <div className="h-fit space-y-6">
          <div
            className="relative p-8"
            style={{ background: "var(--color-paper-2)", border: "var(--rule-hair)" }}
          >
            <h3
              className="relative mb-6 text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Partagez votre expérience
            </h3>

            {currentUser ? (
              <form onSubmit={handleSubmit} className="relative space-y-6">
                <fieldset>
                  <div className="mb-3 flex items-center gap-3">
                    <legend className="font-body text-xs font-medium tracking-wide uppercase" style={{ color: "var(--color-ink)", opacity: 0.6 }}>
                      Quelle est votre note ?
                    </legend>
                    {activeRatingLabel && (
                      <motion.span
                        key={activeRatingLabel}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-body text-xs font-semibold"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {activeRatingLabel}
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${ratingLabels[star]}`}
                        aria-pressed={rating === star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-1 transition-opacity hover:opacity-80"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors duration-300 ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="review-comment"
                      className="font-body text-xs font-medium tracking-wide uppercase"
                      style={{ color: "var(--color-ink)", opacity: 0.6 }}
                    >
                      Votre témoignage
                    </label>
                    <span
                      className={`font-body text-xs tabular-nums transition-colors ${
                        comment.length >= MAX_COMMENT_LENGTH
                          ? "text-red-400"
                          : ""
                      }`}
                      style={comment.length < MAX_COMMENT_LENGTH ? { color: "var(--color-ink)", opacity: 0.3 } : undefined}
                    >
                      {comment.length}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
                    }
                    placeholder="Qu'avez-vous particulièrement aimé ?"
                    className="font-body min-h-[120px] resize-none p-4 transition-all"
                    style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="maison"
                  className="w-full"
                  style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
                  disabled={isPending || rating === 0}
                >
                  {isPending ? (
                    "Publication en cours..."
                  ) : (
                    <>
                      Publier mon avis
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="p-8 text-center" style={{ background: "var(--color-paper-3)" }}>
                <p className="font-body mb-4" style={{ color: "var(--color-ink)", opacity: 0.8 }}>
                  Votre avis compte pour nous. Connectez-vous pour rejoindre la
                  communauté.
                </p>
                <Link href="/sign-in">
                  <Button variant="maison" style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}>
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Liste des avis */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center"
                style={{ border: "1px dashed var(--color-ink)", opacity: 0.25 }}
              >
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
                  style={{ background: "var(--color-paper-2)" }}
                >
                  <Star className="h-8 w-8" style={{ color: "var(--color-ink)", opacity: 0.2 }} />
                </div>
                <p className="text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", opacity: 0.4 }}>
                  Soyez la première personne à sublimer ce produit avec votre
                  avis
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {reviews.map((review, idx) => (
                  <motion.article
                    key={review.id}
                    aria-label={`Avis de ${review.user?.name ?? "Client Anonyme"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.07 }}
                    className="p-6"
                    style={{ background: "var(--color-paper-2)", border: "var(--rule-hair)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden" style={{ background: "var(--color-paper-3)" }}>
                          {review.user?.image ? (
                            <Image
                              src={review.user.image}
                              alt={review.user.name || "Utilisateur"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-6 w-6" style={{ color: "var(--color-ink)", opacity: 0.3 }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p
                            className="font-medium"
                            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
                          >
                            {review.user?.name || "Client Anonyme"}
                          </p>
                          <p className="font-body text-[10px] font-medium tracking-tight uppercase" style={{ color: "var(--color-ink)", opacity: 0.3 }}>
                            {new Date(review.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <div className="mt-4">
                        <p className="font-body leading-relaxed" style={{ color: "var(--color-ink)", opacity: 0.8 }}>
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
