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
    setSelectedImage((prev: number) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage(
      (prev: number) =>
        (prev - 1 + productImages.length) % productImages.length,
    );
  };

  return (
    <div className="bg-ylang-terracotta/30 section-padding min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="font-body text-ylang-charcoal/60 mb-8 flex items-center text-sm">
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
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          {/* Galerie d'images */}
          <div className="space-y-4">
            {/* Image principale */}
            <motion.div
              className="bg-ylang-beige/30 relative aspect-square overflow-hidden rounded-2xl shadow-(--shadow-card)"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />

              {/* Badges */}
              {product.customizable && (
                <div className="text-ylang-charcoal bg-ylang-yellow font-body absolute top-4 left-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Wand2 className="h-4 w-4" />
                  Sur mesure
                </div>
              )}

              {/* Boutons navigation */}
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
              >
                <ChevronLeft className="text-ylang-charcoal h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
              >
                <ChevronRight className="text-ylang-charcoal h-6 w-6" />
              </button>

              {/* Bouton zoom */}
              <button
                onClick={() => setShowZoom(true)}
                className="absolute right-4 bottom-4 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
              >
                <ZoomIn className="text-ylang-charcoal h-5 w-5" />
              </button>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: `calc((100% - ${(productImages.length - 1) * 16}px) / ${productImages.length})`,
                    maxWidth: productImages.length === 1 ? "150px" : undefined,
                  }}
                  className={`aspect-square shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === idx
                      ? "border-ylang-rose ring-ylang-rose/20 ring-2"
                      : "hover:border-ylang-beige border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vue ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Informations produit */}
          <div className="space-y-6">
            {/* En-tête */}
            <div>
              <p className="text-ylang-rose font-body mb-2 text-sm tracking-widest uppercase">
                {product.category}
              </p>
              <h1 className="font-display text-ylang-charcoal mb-4 text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {/* Prix et évaluation */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-ylang-charcoal/60 font-body mb-1 text-sm">
                    À partir de
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="font-display text-ylang-rose text-4xl font-semibold">
                      {product.price}€
                    </p>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <p className="font-body text-ylang-charcoal/40 text-xl font-medium line-through">
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
              <div className="from-ylang-rose/10 to-ylang-terracotta/10 border-ylang-rose/20 rounded-2xl border bg-linear-to-r p-6">
                <div className="mb-4 flex items-start gap-4">
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
                <Link href={`/configurateur?product=${product.id}`}>
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
              Ajouter au panier — {product.price}€
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
                className={`font-body group bg-ylang-beige flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
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
            <div className="border-ylang-beige grid grid-cols-2 gap-4 border-t pt-6">
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
          className="border-ylang-rose mb-16 rounded-2xl border bg-white p-8"
        >
          <h2 className="font-display text-ylang-charcoal mb-6 text-2xl">
            Description détaillée
          </h2>
          <div className="prose max-w-none">
            <p className="font-body text-ylang-charcoal/80 mb-6 leading-relaxed">
              {product.longDescription}
            </p>
            <h3 className="font-display text-ylang-charcoal mb-4 text-lg">
              Caractéristiques
            </h3>
            <ul className="space-y-3">
              {product.features?.map((feature, idx) => (
                <li
                  key={idx}
                  className="font-body text-ylang-charcoal/80 flex items-start gap-3"
                >
                  <div className="bg-ylang-sage/50 mt-0.5 rounded-full p-1">
                    <Check className="text-ylang-charcoal h-4 w-4" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Section Avis */}
        <div className="mb-16">
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
              className="mb-8 text-center"
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
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={productImages[selectedImage]}
              alt={product.name}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
