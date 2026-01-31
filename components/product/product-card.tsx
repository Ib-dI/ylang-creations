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
      <Card className="relative overflow-hidden border-0 bg-white transition-all duration-500 hover:shadow-lg">
        {/* Image Container */}
        <Link href={`/produits/${product.id}`}>
          <div className="bg-ylang-beige/30 relative aspect-square overflow-hidden">
            {/* Image principale */}
            <div className="relative h-full w-full">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                quality={85}
                className="origin-center object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
        <div className="absolute top-4 left-4 flex flex-col gap-2 transition-all duration-300 group-hover:opacity-0">
          {product.new && (
            <div
              className="bg-ylang-terracotta rounded-full px-3 py-1.5 text-xs font-medium tracking-wider text-white uppercase shadow-lg"
              style={{
                animation:
                  "scaleRotate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both",
              }}
            >
              Nouveauté
            </div>
          )}
          {product.customizable && (
            <div className="bg-ylang-yellow flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium tracking-wider text-white uppercase">
              <Wand2 className="h-3 w-3" />
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
          className="group/heart absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isWishlisted
                ? "fill-ylang-rose text-ylang-rose scale-110"
                : "text-ylang-charcoal/60 group-hover/heart:text-ylang-rose group-hover/heart:scale-110",
            )}
          />
        </button>

        {/* Infos produit */}
        <div className="bg-ylang-beige space-y-1.5 p-3">
          <div>
            <p className="font-body text-ylang-charcoal/50 mb-0.5 text-xs tracking-widest uppercase">
              {product.category}
            </p>
            <Link href={`/produits/${product.id}`}>
              <h3 className="font-display text-ylang-charcoal hover:text-ylang-rose line-clamp-2 text-base tracking-tight transition-colors duration-300">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="group flex-1"
              asChild
            >
              <Link href={`/produits/${product.id}`}>Découvrir</Link>
            </Button>

            {product.customizable && (
              <Button
                variant="primary"
                size="sm"
                className="group flex-1"
                asChild
              >
                <Link
                  href={`/configurateur?product=${encodeURIComponent(product.name)}`}
                >
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Personnaliser
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
