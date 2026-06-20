"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { cn } from "@/lib/utils";
import { Heart, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    images?: string[];
    featured?: boolean;
    new?: boolean;
    customizable?: boolean;
    weight?: number;
  };
  className?: string;
  priority?: boolean; // Pour les 2-4 premiers produits
  index?: number; // Pour les animations échelonnées
}

export function ProductCard({
  product,
  className,
  priority = false,
  index = 0,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Wishlist store
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const images = product.images || [product.image];

  // Optimisation: Précharger seulement l'image suivante au hover
  React.useEffect(() => {
    if (
      isHovered &&
      images.length > 1 &&
      currentImageIndex < images.length - 1
    ) {
      const nextImage = new window.Image();
      nextImage.src = images[currentImageIndex + 1];
    }
  }, [isHovered, currentImageIndex, images]);

  return (
    <div
      className={cn("group", className)}
      style={{
        // Animation CSS pure au lieu de framer-motion
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border-0 bg-white transition-[transform,box-shadow] duration-500">
        {/* Image Container */}
        <Link href={`/produits/${product.id}`}>
          <div className="bg-ylang-beige/30 relative aspect-4/5 overflow-hidden">
            {/* Image principale */}
            <div className="relative h-full w-full">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                quality={75}
                className="origin-center object-cover transition-opacity duration-500 group-hover:opacity-90"
                sizes="(max-width: 1024px) 48vw, 24vw"
              />
            </div>

            {/* Thumbnails si plusieurs images */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {images.map((_, imgIndex) => (
                  <button
                    key={imgIndex}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(imgIndex);
                    }}
                    aria-label={`Voir image ${imgIndex + 1}`}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      currentImageIndex === imgIndex
                        ? "w-6 bg-white"
                        : "bg-white/50 hover:bg-white/80",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 sm:top-4 sm:left-4">
          {product.new && (
            <span
              className="text-xs font-semibold tracking-[0.14em] uppercase"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-paper)", background: "var(--color-ink)", padding: "2px 8px" }}
            >
              Nouveau
            </span>
          )}
          {product.customizable && (
            <span
              className="text-xs font-semibold tracking-[0.14em] uppercase"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-ink)", background: "var(--color-paper-2)", padding: "2px 8px" }}
            >
              Sur mesure
            </span>
          )}
        </div>

        {/* Bouton Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem({
              id: `wishlist-${product.id}`,
              productId: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              weight: product.weight ?? 0,
              image: product.image,
              customizable: product.customizable,
            });
          }}
          aria-label={
            isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"
          }
          className={cn(
            isWishlisted
              ? "bg-ylang-terracotta/50 border-ylang-terracotta"
              : "border-white/90 bg-white/90",
            "group/heart absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border transition-opacity duration-200 hover:opacity-80 sm:top-4 sm:right-4 sm:h-10 sm:w-10",
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-300 sm:h-5 sm:w-5",
              isWishlisted
                ? "fill-ylang-rose text-ylang-rose scale-110"
                : "text-ylang-charcoal/60 group-hover/heart:text-ylang-rose group-hover/heart:scale-110",
            )}
          />
        </button>

        {/* Infos produit */}
        <div className="space-y-1.5 p-2.5 sm:p-3" style={{ background: "var(--color-paper-2)" }}>
          <div>
            <p
              className="mb-0.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
            >
              {product.category}
            </p>
            <Link href={`/produits/${product.id}`}>
              <h3 className="font-display text-ylang-charcoal hover:text-ylang-rose line-clamp-2 text-lg tracking-tight transition-colors duration-300 truncate">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex w-full items-center justify-between gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="group flex-1 border px-2 sm:px-4"
              asChild
            >
              <Link href={`/produits/${product.id}`}>
                <span className="hidden sm:inline">Découvrir</span>
                <span className="sm:hidden">Voir</span>
              </Link>
            </Button>

            {product.customizable && (
              <Button
                variant="primary"
                size="sm"
                className="group flex-1 px-2 sm:px-4"
                asChild
              >
                <Link
                  href={`/configurateur?product=${encodeURIComponent(product.name)}`}
                >
                  <Wand2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Personnaliser</span>
                  <span className="sm:hidden">Perso.</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Animations CSS dans un style tag */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
