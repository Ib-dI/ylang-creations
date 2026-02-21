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
                className="origin-center object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                sizes="(max-width: 1024px) 48vw, 24vw"
              />
            </div>

            {/* Overlay élégant au hover */}
            <div className="absolute inset-0 bg-linear-to-t from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

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

        {/* Badges - Animation CSS pure */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 transition-all duration-300 group-hover:opacity-0 sm:top-4 sm:left-4 sm:gap-2">
          {product.new && (
            <div
              className="bg-ylang-terracotta text-charcoal/80 rounded-full px-2 py-1 text-[10px] font-medium tracking-wider uppercase shadow-lg sm:px-3 sm:py-1.5 sm:text-xs"
              style={{
                animation:
                  "scaleRotate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both",
              }}
            >
              Nouveauté
            </div>
          )}
          {product.customizable && (
            <div className="bg-ylang-yellow text-charcoal/80 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium tracking-wider uppercase shadow-md sm:px-3 sm:py-1.5 sm:text-xs">
              <Wand2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Sur mesure
            </div>
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
            "group/heart absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-transform duration-300 hover:scale-110 sm:top-4 sm:right-4 sm:h-10 sm:w-10",
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
        <div className="bg-ylang-beige space-y-1.5 p-2.5 sm:p-3">
          <div>
            <p className="font-abramo text-ylang-rose mb-0.5 text-xs font-semibold tracking-widest uppercase">
              {product.category}
            </p>
            <Link href={`/produits/${product.id}`}>
              <h3 className="font-display text-ylang-charcoal hover:text-ylang-rose line-clamp-2 text-lg tracking-tight transition-colors duration-300">
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
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleRotate {
          0% {
            transform: scale(0) rotate(-180deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
