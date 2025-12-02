"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
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
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images = product.images || [product.image];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={cn("group", className)}
    >
      <Card className="relative overflow-hidden border-0 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)]">
        {/* Image Container */}
        <Link href={`/produits/${product.id}`}>
          <div className="bg-ylang-beige/30 relative aspect-square overflow-hidden">
            {/* Image principale avec effet zoom subtil */}
            <div className="relative h-full w-full">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="ease-slow-j origin-center object-cover transition-transform duration-500 group-hover:scale-[1.15]"
                sizes="(max-width: 560px) 100vw, (max-width: 800px) 50vw, 25vw"
              />
            </div>

            {/* Overlay élégant au hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* CTA qui slide du bas au hover */}
            <motion.div
              className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0"
              initial={{ y: "100%" }}
            >
              <Button variant="primary" className="w-full shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Personnaliser
              </Button>
            </motion.div>

            {/* Thumbnails si plusieurs images */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      currentImageIndex === index
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
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.new && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="bg-ylang-rose rounded-full px-3 py-1.5 text-xs font-medium tracking-wider text-white uppercase shadow-lg"
            >
              Nouveauté
            </motion.div>
          )}
          {product.customizable && (
            <div className="bg-ylang-sage/90 text-ylang-charcoal flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Sur mesure
            </div>
          )}
        </div>

        {/* Bouton Wishlist */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
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
        <div className="space-y-1.5 p-3">
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

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-ylang-charcoal/50 font-body text-[14px]">
                À partir de
              </p>
              <p className="font-display text-ylang-rose text-lg font-semibold">
                {product.price}€
              </p>
            </div>

            {/* Quick add button (visible sur desktop) */}
            <motion.div className="hidden lg:block">
              <Button variant="ghost" size="sm">
                Voir détails
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
