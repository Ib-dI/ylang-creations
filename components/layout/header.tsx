"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store"
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import * as React from "react";

// Navigation items
const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Créer sur mesure", href: "/configurateur", featured: true },
  { name: "À propos", href: "/a-propos" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const cartCount = useCartStore((state) => state.getTotalItems())
  const router = useRouter();

  // Détection du scroll pour effet premium
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-ylang-cream/95 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between lg:h-24">
            {/* Logo */}
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/logo/ylang créations_2.png"
                  alt="Ylang Créations"
                  width={100}
                  height={100}
                  // className="h-12 w-12"
                />
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden items-center space-x-1 lg:flex">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative px-4 py-2"
                  >
                    <span
                      className={cn(
                        "font-body text-sm tracking-wide transition-colors duration-300",
                        isActive
                          ? "text-ylang-rose font-medium"
                          : "text-ylang-charcoal hover:text-ylang-rose",
                        item.featured && "font-medium uppercase",
                      )}
                    >
                      {item.name}
                    </span>

                    {/* Underline animé */}
                    <motion.div
                      className="from-ylang-rose to-ylang-terracotta absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isActive ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Badge "Nouveau" pour item featured */}
                    {item.featured && (
                      <span className="bg-ylang-rose absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white">
                        ✨
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden items-center space-x-4 lg:flex">
              {/* Search */}
              <button className="text-ylang-charcoal hover:text-ylang-rose transform p-2 transition-colors duration-300 hover:scale-106">
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <button className="text-ylang-charcoal hover:text-ylang-rose relative transform p-2 transition-colors duration-300 hover:scale-106">
                <Heart className="h-4 w-4" strokeWidth={1.5} />
                <span className="bg-ylang-rose absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium text-white">
                  2
                </span>
              </button>

              {/* Account */}
              <button className="text-ylang-charcoal hover:text-ylang-rose transform p-2 transition-colors duration-300 hover:scale-106">
                <User className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {/* Cart avec animation */}
              <button className="text-ylang-charcoal hover:text-ylang-rose group relative transform p-2 transition-colors duration-300 hover:scale-106">
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-ylang-rose absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium text-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* CTA Premium */}
              <Button
                onClick={() => router.push("/configurateur")}
                variant="luxury" size="sm" className="ml-2">
                Configurer
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-ylang-charcoal hover:text-ylang-rose p-2 transition-colors lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Ligne de séparation premium */}
        <div className="via-ylang-beige h-px bg-gradient-to-r from-transparent to-transparent" />
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-ylang-cream/98 border-ylang-beige fixed top-20 right-0 left-0 z-40 border-b shadow-2xl backdrop-blur-lg lg:hidden"
          >
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-6">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "font-body block rounded-lg px-4 py-3 text-base transition-all duration-300",
                        isActive
                          ? "bg-ylang-rose font-medium text-white"
                          : "text-ylang-charcoal hover:bg-ylang-beige",
                        item.featured && "border-ylang-rose border-2",
                      )}
                    >
                      {item.name}
                      {item.featured && (
                        <span className="ml-2 text-xs">✨ Nouveau</span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Actions */}
              <div className="border-ylang-beige mt-4 space-y-3 border-t pt-4">
                <Button variant="luxury" className="w-full">
                  Configurer mon produit
                </Button>

                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-ylang-beige/50 hover:bg-ylang-beige flex flex-col items-center justify-center rounded-lg p-4 transition-colors">
                    <Search
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">
                      Recherche
                    </span>
                  </button>

                  <button className="bg-ylang-beige/50 hover:bg-ylang-beige relative flex flex-col items-center justify-center rounded-lg p-4 transition-colors">
                    <Heart
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">Favoris</span>
                    <span className="bg-ylang-rose absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                      2
                    </span>
                  </button>

                  <button className="bg-ylang-beige/50 hover:bg-ylang-beige flex flex-col items-center justify-center rounded-lg p-4 transition-colors">
                    <User
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">Compte</span>
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
