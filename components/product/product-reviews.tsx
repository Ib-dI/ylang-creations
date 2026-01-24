"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type ReviewWithUser, submitReview } from "@/lib/actions/reviews";
import { Star, User } from "lucide-react";
import Image from "next/image";
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
        userId: currentUser.id,
        rating,
        comment,
        userInfo: {
          name: currentUser.name,
          email: currentUser.email,
          image: currentUser.image,
        },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-ylang-charcoal mb-2 text-2xl">
            Avis clients
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="font-body text-ylang-charcoal/80 text-lg">
              {averageRating.toFixed(1)}{" "}
              <span className="text-sm text-gray-500">
                ({totalReviews} avis)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire d'avis */}
      <div className="bg-[#fdfdfd] border-ylang-beige rounded-2xl border p-6">
        <h3 className="font-display text-ylang-charcoal mb-4 text-lg">
          Donnez votre avis
        </h3>

        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-ylang-charcoal/80 mb-2 block text-sm">
                Votre note
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-body text-ylang-charcoal/80 mb-2 block text-sm">
                Votre commentaire (optionnel)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce produit..."
                className="bg-white focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-ylang-rose
                "
              />
            </div>

            <Button type="submit" disabled={isPending || rating === 0}>
              {isPending ? "Publication..." : "Publier mon avis"}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg bg-white/50 p-4 text-center">
            <p className="font-body text-ylang-charcoal/80">
              Veuillez vous{" "}
              <a href="/login" className="text-ylang-rose hover:underline">
                connecter
              </a>{" "}
              pour laisser un avis.
            </p>
          </div>
        )}
      </div>

      {/* Liste des avis */}
      <div className="space-y-6 rounded-2xl bg-[#fdfdfd] p-6">
        {reviews.length === 0 ? (
          <p className="font-body text-ylang-charcoal/60 text-center italic">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-ylang-beige/50 border-b pb-6 last:border-0"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-ylang-sage/20 relative h-10 w-10 overflow-hidden rounded-full">
                    {review.user?.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || "Utilisateur"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="text-ylang-sage h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display text-ylang-charcoal text-sm">
                      {review.user?.name || "Utilisateur inconnu"}
                    </p>
                    <p className="font-body text-ylang-charcoal/40 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="font-body text-ylang-charcoal/80 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
