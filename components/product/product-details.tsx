"use client";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { type CatalogProduct } from "@/data/products";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { CartItem } from "@/types/cart";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
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
import { useEffect, useState } from "react";

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
  const [showZoom, setShowZoom] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.defaultSize ?? product.sizes?.[0],
  );

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

  // Spring-based slide transition (same as hero-section)
  const x = selectedImage * 100;
  const xSpring = useSpring(x, { bounce: 0 });
  const xPct = useMotionTemplate`-${xSpring}%`;

  useEffect(() => {
    xSpring.set(x);
  }, [x, xSpring]);

  const nextImage = () => {
    setSelectedImage((prev: number) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage(
      (prev: number) =>
        (prev - 1 + productImages.length) % productImages.length,
    );
  };

  return (
    <div className="section-padding min-h-screen" style={{ background: "var(--color-paper)" }}>
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
        <div className="mb-8 grid gap-8 lg:mb-16 lg:grid-cols-[3fr_2fr] lg:gap-12">
          {/* Galerie d'images */}
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
            {/* Thumbnails — colonne à gauche sur desktop, rangée sous l'image sur mobile */}
            <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-2 lg:w-[76px] shrink-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:h-[min(75vh,720px)]">
              {productImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Voir l'image ${idx + 1}`}
                  aria-pressed={selectedImage === idx}
                  className={`relative aspect-square shrink-0 w-16 lg:w-full overflow-hidden rounded-lg border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50 ${
                    selectedImage === idx
                      ? "border-ylang-rose"
                      : "border-transparent hover:border-ylang-rose/40"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Vue ${idx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 64px, 76px"
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

            {/* Image principale */}
            <div className="order-1 lg:order-2 relative flex-1 aspect-[3/4] lg:aspect-auto lg:h-[min(75vh,720px)] overflow-hidden" style={{ background: "var(--color-paper-3)" }}>
              <motion.div style={{ x: xPct }} className="flex h-full">
                {productImages.map((img, i) => (
                  <div key={i} className="relative h-full w-full shrink-0">
                    <Image
                      src={img}
                      alt={`${product.name} - vue ${i + 1}`}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </motion.div>

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
                aria-label="Image précédente"
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 select-none rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50"
              >
                <ChevronLeft className="text-ylang-charcoal h-6 w-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "white" }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                aria-label="Image suivante"
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 select-none rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50"
              >
                <ChevronRight className="text-ylang-charcoal h-6 w-6" />
              </motion.button>

              {/* Bouton zoom */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "white" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowZoom(true)}
                aria-label="Agrandir l'image"
                className="absolute right-4 bottom-4 z-10 select-none rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50"
              >
                <ZoomIn className="text-ylang-charcoal h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Informations produit */}
          <div className="space-y-5 lg:space-y-6">
            {/* En-tête */}
            <div>
              <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
                {product.category}
              </p>
              <h1
                className="mb-2 type-headline"
                style={{ color: "var(--color-ink)" }}
              >
                {product.name}
              </h1>

              {/* Prix et évaluation */}
              <div className="mb-5 flex items-center justify-between lg:mb-6">
                <div>
                  <p className="text-ylang-charcoal/60 font-body mb-1 text-sm">
                    À partir de
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p
                      className="type-title"
                      style={{ color: "var(--color-ink)" }}
                    >
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

            {/* Sélecteur de taille */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="font-body text-ylang-charcoal/60 text-xs font-medium tracking-wide uppercase">
                    Taille
                  </label>
                  {selectedSize && (
                    <span className="font-body text-ylang-rose text-sm font-medium">
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`font-body min-w-11 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50 ${
                        selectedSize === size
                          ? "border-ylang-rose bg-ylang-rose/10 text-ylang-rose"
                          : "border-ylang-beige/60 text-ylang-charcoal hover:border-ylang-rose/40 hover:text-ylang-rose"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Personnaliser */}
            {product.customizable && (
              <div className="bg-ylang-rose/10 border-ylang-rose/20 rounded-2xl border p-5 lg:p-6">
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
              variant="maison"
              size="lg"
              className="w-full"
              style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
              onClick={() => {
                const item: CartItem = {
                  id: `${product.id}-standard-${selectedSize ?? "unique"}-${Date.now()}`,
                  productId: product.id,
                  productName: product.name,
                  configuration: {
                    fabricName: "Standard",
                    fabricColor: "Original",
                    ...(selectedSize ? { size: selectedSize } : {}),
                  },
                  price: product.price,
                  weight: product.weight ?? 0,
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
                    weight: product.weight ?? 0,
                    image: productImages[0],
                    customizable: product.customizable,
                  })
                }
                aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-pressed={isWishlisted}
                className={`font-body group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose/50 ${
                  isWishlisted
                    ? "border-ylang-rose bg-ylang-rose/10 text-ylang-rose"
                    : "border-ylang-beige/80 bg-ylang-beige/60 text-ylang-charcoal hover:border-ylang-rose/50 hover:text-ylang-rose"
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-colors group-hover:text-ylang-rose ${isWishlisted ? "fill-current" : ""}`}
                />
                {isWishlisted ? "Ajouté aux favoris" : "Ajouter aux favoris"}
              </button>
            </div>

            {/* Points forts */}
            <div className="border-ylang-yellow/50 bg-ylang-terracotta/30 grid grid-cols-2 gap-4 rounded-2xl border p-5">
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Truck className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="type-caption font-medium" style={{ color: "var(--color-ink)" }}>
                    Livraison offerte
                  </p>
                  <p className="type-caption" style={{ color: "var(--color-ink-2)" }}>
                    Dès {freeShippingThreshold}€ d&apos;achat
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Shield className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="type-caption font-medium" style={{ color: "var(--color-ink)" }}>
                    Paiement sécurisé
                  </p>
                  <p className="type-caption" style={{ color: "var(--color-ink-2)" }}>
                    Cryptage SSL
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-ylang-sage/30 rounded-lg p-2">
                  <Package className="text-ylang-charcoal h-5 w-5" />
                </div>
                <div>
                  <p className="type-caption font-medium" style={{ color: "var(--color-ink)" }}>
                    Fait main
                  </p>
                  <p className="type-caption" style={{ color: "var(--color-ink-2)" }}>
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
                    <p className="type-caption font-medium" style={{ color: "var(--color-ink)" }}>
                      Sur mesure
                    </p>
                    <p className="type-caption" style={{ color: "var(--color-ink-2)" }}>
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 lg:mb-16"
          style={{ borderTop: "var(--rule-hair)", borderBottom: "var(--rule-hair)", padding: "2.5rem 0" }}
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
            <div>
              <h2
                className="mb-6 type-headline"
                style={{ color: "var(--color-ink)" }}
              >
                Description détaillée
              </h2>
              <p className="font-body leading-relaxed" style={{ color: "var(--color-ink)", opacity: 0.8 }}>
                {product.longDescription}
              </p>
            </div>

            <div style={{ background: "var(--color-paper-2)", padding: "1.5rem 2rem" }}>
              <h3
                className="mb-6 type-title"
                style={{ color: "var(--color-ink)" }}
              >
                Caractéristiques
              </h3>
              <ul className="space-y-4">
                {product.features?.map((feature, idx) => (
                  <li
                    key={idx}
                    className="font-body flex items-start gap-4 text-sm"
                    style={{ color: "var(--color-ink)", opacity: 0.8 }}
                  >
                    <div
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                      style={{ background: "var(--color-ink)" }}
                    >
                      <Check className="h-3 w-3" style={{ color: "var(--color-paper)" }} />
                    </div>
                    <span>{feature}</span>
                  </li>
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
              <p className="type-overline mb-3" style={{ color: "var(--color-accent)" }}>
                Inspirations
              </p>
              <h2 className="type-headline mb-2" style={{ color: "var(--color-ink)" }}>
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
