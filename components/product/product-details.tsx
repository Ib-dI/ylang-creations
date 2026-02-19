"use client";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { type CatalogProduct } from "@/data/products";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { CartItem } from "@/types/cart";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
  Palette,
  Shield,
  ShoppingBag,
  Star,
  Truck,
  Wand2,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ProductReviews } from "@/components/product/product-reviews";
import type { ReviewWithUser } from "@/lib/actions/reviews";

interface ProductDetailsProps {
  product: CatalogProduct;
  similarProducts: CatalogProduct[];
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

export default function ProductDetails({
  product,
  similarProducts,
  reviews,
  averageRating,
  totalReviews,
  currentUser,
}: ProductDetailsProps) {
  // États locaux
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  // Wishlist
  const { isInWishlist, toggleItem } = useWishlistStore();
  const freeShippingThreshold = useCartStore(
    (state) => state.freeShippingThreshold,
  );
  const isWishlisted = isInWishlist(product.id);

  // Images du produit (utiliser l'image principale si pas d'images supplémentaires)
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const nextImage = () => {
    setDirection(1);
    setSelectedImage((prev: number) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setSelectedImage(
      (prev: number) =>
        (prev - 1 + productImages.length) % productImages.length,
    );
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-ylang-terracotta/30 section-padding min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="font-body text-ylang-charcoal/60 mb-4 flex items-center text-sm lg:mb-8">
          <Link href="/" className="hover:text-ylang-rose transition-colors">
            Accueil
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link
            href="/collections"
            className="hover:text-ylang-rose transition-colors"
          >
            Collections
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-ylang-charcoal">{product.name}</span>
        </nav>

        {/* Contenu principal */}
        <div className="mb-8 grid gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-12">
          {/* Galerie d'images */}
          <div className="space-y-3 lg:space-y-4">
            {/* Image principale */}
            <div className="bg-ylang-beige/30 relative aspect-square overflow-hidden rounded-2xl shadow-(--shadow-card)">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={selectedImage}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0 h-full w-full"
                >
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              {product.customizable && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-ylang-charcoal bg-ylang-yellow font-body absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md"
                >
                  <Wand2 className="h-4 w-4" />
                  Sur mesure
                </motion.div>
              )}

              {/* Boutons navigation */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "white" }}
                whileTap={{ scale: 0.9 }}
                onClick={prevImage}
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5"
              >
                <ChevronLeft className="text-ylang-charcoal h-6 w-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "white" }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5"
              >
                <ChevronRight className="text-ylang-charcoal h-6 w-6" />
              </motion.button>

              {/* Bouton zoom */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "white" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowZoom(true)}
                className="absolute right-4 bottom-4 z-10 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5"
              >
                <ZoomIn className="text-ylang-charcoal h-5 w-5" />
              </motion.button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 lg:gap-4">
              {productImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDirection(idx > selectedImage ? 1 : -1);
                    setSelectedImage(idx);
                  }}
                  style={{
                    width: `calc((100% - ${(productImages.length - 1) * 16}px) / ${productImages.length})`,
                    maxWidth: productImages.length === 1 ? "150px" : undefined,
                  }}
                  className={`relative aspect-square shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === idx
                      ? "border-ylang-rose"
                      : "hover:border-ylang-rose/40 border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Vue ${idx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 25vw, 10vw"
                    className={`object-cover transition-transform duration-500 ${
                      selectedImage === idx ? "scale-110" : "scale-100"
                    }`}
                  />
                  {selectedImage === idx && (
                    <motion.div
                      layoutId="active-thumb"
                      className="ring-ylang-rose/20 absolute inset-0 ring-2 ring-inset"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Informations produit */}
          <div className="space-y-5 lg:space-y-6">
            {/* En-tête */}
            <div>
              <p className="text-ylang-rose font-abramo text-md mb-2 font-semibold tracking-widest uppercase">
                {product.category}
              </p>
              <h1 className="font-display text-ylang-charcoal mb-3 text-2xl lg:mb-4 lg:text-4xl">
                {product.name}
              </h1>

              {/* Prix et évaluation */}
              <div className="mb-5 flex items-center justify-between lg:mb-6">
                <div>
                  <p className="text-ylang-charcoal/60 font-body mb-1 text-sm">
                    À partir de
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="font-display text-ylang-rose text-3xl font-semibold lg:text-4xl">
                      {product.price}€
                    </p>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <p className="font-body text-ylang-charcoal/40 text-lg font-medium line-through lg:text-xl">
                          {product.compareAtPrice}€
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-body text-ylang-charcoal/60 text-sm">
                    ({totalReviews} avis)
                  </span>
                </div>
              </div>

              <p className="font-body text-ylang-charcoal/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* CTA Personnaliser */}
            {product.customizable && (
              <div className="from-ylang-rose/10 to-ylang-terracotta/10 border-ylang-rose/20 rounded-2xl border bg-linear-to-r p-5 lg:p-6">
                <div className="mb-3 flex items-start gap-4 lg:mb-4">
                  <div className="bg-ylang-rose/20 rounded-xl p-3">
                    <Palette className="text-ylang-rose h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-ylang-charcoal mb-1 text-lg">
                      Personnalisez ce produit
                    </h3>
                    <p className="font-body text-ylang-charcoal/60 text-sm">
                      Choisissez vos couleurs, tissus et ajoutez une broderie
                      personnalisée pour créer une pièce unique.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/configurateur?product=${encodeURIComponent(product.name)}`}
                >
                  <Button variant="luxury" size="lg" className="w-full">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Personnaliser ce produit
                  </Button>
                </Link>
              </div>
            )}

            {/* Bouton Ajouter au panier */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                const item: CartItem = {
                  id: `${product.id}-standard-${Date.now()}`,
                  productId: product.id,
                  productName: product.name,
                  configuration: {
                    fabricName: "Standard",
                    fabricColor: "Original",
                    accessories: [],
                  },
                  price: product.price,
                  quantity: 1,
                  thumbnail: productImages[selectedImage],
                };
                useCartStore.getState().addItem(item);
                useCartStore.getState().openCart();
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ajouter au panier - {product.price}€
            </Button>

            {/* Actions secondaires */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  toggleItem({
                    id: `wishlist-${product.id}`,
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    image: productImages[0],
                    customizable: product.customizable,
                  })
                }
                className={`font-body group bg-ylang-beige flex flex-1 items-center justify-center gap-2 border-2 py-3 transition-all ${
                  isWishlisted
                    ? "border-ylang-rose bg-ylang-rose/10 text-ylang-rose"
                    : "border-ylang-beige/10 hover:border-ylang-rose hover:text-ylang-rose text-ylang-charcoal"
                }`}
              >
                <Heart
                  className={`group-hover:text-ylang-rose h-5 w-5 transition-colors ${isWishlisted ? "fill-current" : ""}`}
                />
                {isWishlisted ? "Ajouté aux favoris" : "Ajouter aux favoris"}
              </button>
            </div>

            {/* Points forts */}
            <div className="border-ylang-beige bg-ylang-terracotta/30 grid grid-cols-2 gap-3 border p-4 pt-6 lg:gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Truck className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-ylang-charcoal text-sm">
                    Livraison offerte
                  </p>
                  <p className="font-body text-ylang-charcoal/60 text-xs">
                    Dès {freeShippingThreshold}€ d'achat
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Shield className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-ylang-charcoal text-sm">
                    Paiement sécurisé
                  </p>
                  <p className="font-body text-ylang-charcoal/60 text-xs">
                    Cryptage SSL
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Package className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-ylang-charcoal text-sm">
                    Fait main
                  </p>
                  <p className="font-body text-ylang-charcoal/60 text-xs">
                    Artisanat français
                  </p>
                </div>
              </div>
              {product.customizable && (
                <div className="flex items-start gap-3">
                  <div className="bg-ylang-sage/30 rounded-lg p-2">
                    <Wand2 className="text-ylang-charcoal h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-ylang-charcoal text-sm">
                      Sur mesure
                    </p>
                    <p className="font-body text-ylang-charcoal/60 text-xs">
                      100% personnalisable
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description détaillée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-ylang-rose/10 to-ylang-beige/10 relative mb-8 overflow-hidden rounded-3xl border bg-linear-to-b from-white p-6 shadow-sm lg:mb-16 lg:p-10"
        >
          {/* Decorative element */}
          <div className="bg-ylang-rose/5 absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_350px]">
            <div>
              <h2 className="font-display text-ylang-charcoal mb-6 text-2xl tracking-tight lg:text-3xl">
                Description détaillée
              </h2>
              <div className="prose prose-ylang max-w-none">
                <p className="font-body text-ylang-charcoal/80 leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            </div>

            <div className="bg-ylang-beige/20 rounded-2xl p-6 lg:p-8">
              <h3 className="font-display text-ylang-charcoal mb-6 text-xl">
                Caractéristiques
              </h3>
              <ul className="space-y-4">
                {product.features?.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="font-body text-ylang-charcoal/80 flex items-start gap-4 text-sm"
                  >
                    <div className="bg-ylang-rose/10 text-ylang-rose mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Section Avis */}
        <div className="mb-8 lg:mb-16">
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={totalReviews}
            currentUser={currentUser}
          />
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 text-center lg:mb-8"
            >
              <p className="text-ylang-rose font-body mb-3 text-sm tracking-widest uppercase">
                Inspirations
              </p>
              <h2 className="font-display text-ylang-charcoal mb-2 text-3xl lg:text-4xl">
                Vous aimerez aussi
              </h2>
              <p className="font-body text-ylang-charcoal/60">
                Découvrez nos autres créations
                {similarProducts.some((p) => p.customizable)
                  ? " personnalisables"
                  : ""}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Zoom */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
            className="bg-ylang-charcoal/95 fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative h-full max-h-[90vh] w-full max-w-[90vw]"
            >
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="rounded-lg object-contain"
                sizes="90vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
