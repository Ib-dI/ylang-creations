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
          <div className="text-ylang-rose font-abramo mb-1 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <MessageSquare className="h-3 w-3" />
            <span>Témoignages</span>
          </div>
          <h2 className="font-abramo-script text-ylang-charcoal text-3xl lg:text-5xl">
            L'avis de nos clients
          </h2>
        </div>

        <div className="border-ylang-beige/50 flex items-center gap-6 rounded-2xl border bg-white/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="text-center">
            <span className="font-display text-ylang-charcoal block text-3xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <span className="font-body text-ylang-charcoal/40 text-[10px] font-medium tracking-tighter uppercase">
              Note moyenne
            </span>
          </div>
          <div className="bg-ylang-beige/50 h-10 w-px" />
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
            <p className="font-body text-ylang-charcoal/60 text-xs">
              Basé sur {totalReviews} avis authentiques
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        {/* Formulaire d'avis */}
        <div className="h-fit space-y-6">
          <div className="border-ylang-beige/50 relative overflow-hidden rounded-3xl border bg-white p-8 shadow-sm">
            <div className="bg-ylang-rose/5 absolute -top-10 -left-10 h-32 w-32 rounded-full blur-2xl" />

            <h3 className="font-display text-ylang-charcoal relative mb-6 text-xl">
              Partagez votre expérience
            </h3>

            {currentUser ? (
              <form onSubmit={handleSubmit} className="relative space-y-6">
                <div>
                  <label className="font-body text-ylang-charcoal/60 mb-3 block text-xs font-medium tracking-wide uppercase">
                    Quelle est votre note ?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="group relative transition-transform hover:scale-110 focus:outline-hidden"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors duration-300 ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          } ${star <= hoverRating ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : ""}`}
                        />
                        {star === rating && (
                          <motion.div
                            layoutId="selected-star"
                            className="absolute -inset-1 rounded-full bg-yellow-400/10 blur-sm"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-ylang-charcoal/60 mb-2 block text-xs font-medium tracking-wide uppercase">
                    Votre témoignage
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'avez-vous particulièrement aimé ?"
                    className="border-ylang-beige/50 bg-ylang-beige/5 font-body ring-ylang-rose/20 focus:border-ylang-rose/30 min-h-[120px] resize-none p-4 transition-all focus:bg-white focus:ring-4"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
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
              <div className="bg-ylang-beige/10 rounded-2xl p-8 text-center">
                <p className="font-body text-ylang-charcoal/80 mb-4">
                  Votre avis compte pour nous. Connectez-vous pour rejoindre la
                  communauté.
                </p>
                <Link href="/sign-in">
                  <Button
                    variant="secondary"
                    className=""
                  >
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
                className="border-ylang-beige/50 rounded-3xl border border-dashed bg-white/30 p-12 text-center"
              >
                <div className="bg-ylang-beige/20 text-ylang-charcoal/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Star className="h-8 w-8" />
                </div>
                <p className="font-display text-ylang-charcoal/40 text-lg">
                  Soyez la première personne à sublimer ce produit avec votre
                  avis
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group border-ylang-beige/30 relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="ring-ylang-rose/10 relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-4">
                          {review.user?.image ? (
                            <Image
                              src={review.user.image}
                              alt={review.user.name || "Utilisateur"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-ylang-beige/20 flex h-full w-full items-center justify-center">
                              <User className="text-ylang-rose/40 h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-display text-ylang-charcoal font-medium">
                            {review.user?.name || "Client Anonyme"}
                          </p>
                          <p className="font-body text-ylang-charcoal/30 text-[10px] font-medium tracking-tight uppercase">
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
                      <div className="bg-ylang-beige/10 flex items-center gap-1 rounded-full px-3 py-1">
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
                        <p className="font-body text-ylang-charcoal/80 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
