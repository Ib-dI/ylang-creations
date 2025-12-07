"use client";

import { SearchModal } from "@/components/search/search-modal";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

// Navigation principales
const mainNavigation = [
  { name: "Créations", href: "/collections", hasMegaMenu: true },
  { name: "Créations sur mesure", href: "/configurateur", featured: true },
  { name: "Nouvelle collection", href: "/collections?filter=new" },
  { name: "La marque", href: "/a-propos" },
  { name: "Contact", href: "/contact" },
];

// Catégories du Mega Menu (La structure n'a pas été modifiée)
const megaMenuCategories = [
  {
    title: "LA CHAMBRE",
    href: "/collections?category=chambre",
    items: [
      {
        name: "Coussin musical",
        href: "/collections?category=coussin-musical",
      },
      { name: "Couverture", href: "/collections?category=couverture" },
      { name: "Draps de lit bébé", href: "/collections?category=draps-lit" },
      {
        name: "Gigoteuse légère 0/3",
        href: "/collections?category=gigoteuse-legere-0-3",
      },
      {
        name: "Gigoteuse légère 3/6",
        href: "/collections?category=gigoteuse-legere-3-6",
      },
      {
        name: "Gigoteuse légère 6/12",
        href: "/collections?category=gigoteuse-legere-6-12",
      },
      {
        name: "Gigoteuse légère 12/24",
        href: "/collections?category=gigoteuse-legere-12-24",
      },
      {
        name: "Gigoteuse molletonnée 0/3",
        href: "/collections?category=gigoteuse-molletonnee-0-3",
      },
      {
        name: "Gigoteuse molletonnée 3/6",
        href: "/collections?category=gigoteuse-molletonnee-3-6",
      },
      {
        name: "Gigoteuse molletonnée 6/12",
        href: "/collections?category=gigoteuse-molletonnee-6-12",
      },
      {
        name: "Gigoteuse molletonnée 12/24",
        href: "/collections?category=gigoteuse-molletonnee-12-24",
      },
      {
        name: "Housse matelas à langer avec serviette de protection",
        href: "/collections?category=housse-matelas",
      },
      { name: "Lange carré blanc", href: "/collections?category=lange-carre" },
      { name: "Mobile de lit", href: "/collections?category=mobile-lit" },
      { name: "Tour de lit", href: "/collections?category=tour-de-lit" },
    ],
  },
  {
    title: "LA TOILETTE",
    href: "/collections?category=toilette",
    items: [
      { name: "Bavoir", href: "/collections?category=bavoir" },
      { name: "Cape de bain", href: "/collections?category=cape-de-bain" },
      { name: "Gant de toilette", href: "/collections?category=gant-toilette" },
      {
        name: "Serviette de toilette",
        href: "/collections?category=serviette-toilette",
      },
    ],
  },
  {
    title: "LINGE DE NAISSANCE",
    href: "/collections?category=linge-naissance",
    items: [
      { name: "Pyjama", href: "/collections?category=pyjama" },
      { name: "Chaussons", href: "/collections?category=chaussons" },
      { name: "Pantalon", href: "/collections?category=pantalon" },
      {
        name: "Gilet cache-cœur",
        href: "/collections?category=gilet-cache-coeur",
      },
      { name: "Bloomer", href: "/collections?category=bloomer" },
      {
        name: "Robe chasuble 12 mois",
        href: "/collections?category=robe-chasuble",
      },
    ],
  },
  {
    title: "ACCESSOIRES",
    href: "/collections?category=accessoires",
    items: [
      {
        name: "Anneaux de dentition",
        href: "/collections?category=anneaux-dentition",
      },
      { name: "Attache tétine", href: "/collections?category=attache-tetine" },
      {
        name: "Brosse à cheveux",
        href: "/collections?category=brosse-cheveux",
      },
    ],
  },
  {
    title: "BAGAGERIES/PROMENADE",
    href: "/collections?category=bagageries",
    items: [
      { name: "Valisette", href: "/collections?category=valisette" },
      { name: "Vanity", href: "/collections?category=vanity" },
      { name: "Sac à langer", href: "/collections?category=sac-a-langer" },
      {
        name: "Sac à dos maternelle",
        href: "/collections?category=sac-dos-maternelle",
      },
      {
        name: "Matelas à langer nomade",
        href: "/collections?category=matelas-langer-nomade",
      },
      {
        name: "Protège carnet de santé",
        href: "/collections?category=protege-carnet-sante",
      },
      {
        name: "Protège livret de famille",
        href: "/collections?category=protege-livret-famille",
      },
      {
        name: "Protège passeport",
        href: "/collections?category=protege-passeport",
      },
      {
        name: "Trousse de toilette",
        href: "/collections?category=trousse-toilette",
      },
    ],
  },
  {
    title: "LES JEUX",
    href: "/collections?category=jeux",
    subtitle: "PARTENARIAT EXCLUSIF URBIDOLLS",
    items: [
      { name: "Poupées", href: "/collections?category=poupees" },
      { name: "Bébés", href: "/collections?category=bebes" },
      { name: "Accessoires", href: "/collections?category=accessoires-jeux" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false); // Inutilisé, l'état isMegaMenuOpen gère tout
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null,
  );
  const cartCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.getTotalItems());
  const megaMenuRef = React.useRef<HTMLDivElement>(null);

  // Correction 1: Nouvelle référence pour le conteneur du menu mobile
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  // Détection du scroll pour effet premium
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Correction 2: Mise à jour du useEffect pour inclure le conteneur mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideHeaderControls =
        megaMenuRef.current &&
        megaMenuRef.current.contains(event.target as Node);
      // Vérifie si le clic est dans le conteneur du menu mobile
      const isClickInsideMobileMenu =
        mobileMenuRef.current &&
        mobileMenuRef.current.contains(event.target as Node);

      if (
        isMegaMenuOpen &&
        !isClickInsideHeaderControls &&
        !isClickInsideMobileMenu
      ) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMegaMenuOpen]); // Ajout de isMegaMenuOpen pour capturer l'état à jour

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen(!isMegaMenuOpen);
  };

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "bg-pattern fixed top-0 right-0 left-0 z-50 transition-all duration-500",
          isScrolled && "shadow-[0_2px_20px_rgba(0,0,0,0.08)]",
        )}
      >
        {/* Barre supérieure avec navigation principale */}

        {/* Barre principale avec Menu - Logo - Actions */}
        {/* Barre Social Media - Top */}
        <div className="bg-[#A77769] px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/ylang_creations/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-white/80"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.facebook.com/ylangcreations/?ref=_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-white/80"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="font-body hidden text-[10px] font-medium tracking-widest text-white uppercase sm:block">
              Livraison offerte dès 150€ d'achat
            </p>
          </div>
        </div>

        {/* Barre principale avec Menu - Logo - Actions */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Bouton Menu - Gauche */}
            <div className="flex items-center space-x-4" ref={megaMenuRef}>
              <button
                onClick={toggleMegaMenu}
                className={cn(
                  "flex items-center space-x-2 rounded-full px-3 py-2 transition-all duration-300",
                  "text-ylang-charcoal bg-white/50 backdrop-blur-sm hover:bg-white/80",
                  isMegaMenuOpen &&
                    "bg-ylang-rose hover:bg-ylang-rose/90 text-white",
                )}
              >
                {isMegaMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                )}
                <span className="font-body hidden text-sm font-medium tracking-wide uppercase lg:inline">
                  Menu
                </span>
              </button>
            </div>

            {/* Logo - Centre */}
            <Link
              href="/"
              className="group absolute left-1/2 -translate-x-1/2 transform"
            >
              <div className="relative">
                <Image
                  src="/logo/ylang créations_6.png"
                  alt="Ylang Créations"
                  width={100}
                  height={100}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

            {/* Actions - Droite */}
            <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-ylang-charcoal hover:text-ylang-rose transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
              >
                <Search className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
              </button>

              {/* Account */}
              <button className="text-ylang-charcoal hover:text-ylang-rose hidden transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80 lg:block">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => useWishlistStore.getState().openWishlist()}
                className="text-ylang-charcoal hover:text-ylang-rose relative transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
              >
                <Heart className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-ylang-rose absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-medium text-white lg:-top-1 lg:-right-1 lg:h-4 lg:w-4 lg:text-[10px]"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart */}
              <button
                onClick={() => useCartStore.getState().openCart()}
                className="text-ylang-charcoal hover:text-ylang-rose group relative transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
              >
                <ShoppingBag
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  strokeWidth={1.5}
                />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-ylang-rose absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-medium text-white lg:-top-1 lg:-right-1 lg:h-4 lg:w-4 lg:text-[10px]"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* CTA Desktop */}
              <Button
                onClick={() => router.push("/configurateur")}
                variant="luxury"
                size="sm"
                className="ml-2 hidden lg:flex"
              >
                Configurer
              </Button>
            </div>
          </div>
        </div>

        {/* Ligne de séparation premium */}
        <div className="via-ylang-beige h-px bg-linear-to-r from-transparent to-transparent" />
      </header>

      {/* Mega Menu Desktop */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-ylang-cream/98 fixed top-20 right-0 left-0 z-40 hidden shadow-2xl backdrop-blur-lg lg:block"
          >
            <div className="mx-auto max-w-7xl px-8 py-10">
              <div className="flex gap-12">
                {/* Colonne Gauche - Navigation Principale */}
                <div className="border-ylang-beige/50 w-64 shrink-0 border-r pr-8">
                  <h3 className="text-ylang-charcoal/50 font-body mb-6 text-xs font-semibold tracking-widest uppercase">
                    Menu
                  </h3>
                  <ul className="space-y-6">
                    {mainNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={closeMegaMenu}
                            className={cn(
                              "group flex items-center justify-between text-lg font-light tracking-wide transition-all duration-300",
                              isActive
                                ? "text-ylang-rose font-medium"
                                : "text-ylang-charcoal hover:text-ylang-rose hover:translate-x-2",
                            )}
                          >
                            <span>
                              {item.name}
                              {item.featured && (
                                <span className="ml-2 text-sm">✨</span>
                              )}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100",
                                isActive && "text-ylang-rose opacity-100",
                              )}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="border-ylang-beige/50 mt-10 border-t pt-8">
                    <Button
                      onClick={() => {
                        router.push("/configurateur");
                        closeMegaMenu();
                      }}
                      variant="luxury"
                      className="w-full justify-center"
                    >
                      La Création sur Mesure
                    </Button>
                  </div>
                </div>

                {/* Colonne Droite - Grille Catégories */}
                <div className="grow">
                  <h3 className="text-ylang-charcoal/50 font-body mb-6 text-xs font-semibold tracking-widest uppercase">
                    Nos Univers
                  </h3>
                  <div className="grid grid-cols-5 gap-x-6 gap-y-8">
                    {megaMenuCategories.map((category) => (
                      <div key={category.title} className="space-y-4">
                        <Link
                          href={category.href}
                          onClick={closeMegaMenu}
                          className="group block"
                        >
                          <h3 className="text-ylang-charcoal group-hover:text-ylang-rose font-heading text-sm font-bold tracking-wider transition-colors">
                            {category.title}
                          </h3>
                          {category.subtitle && (
                            <span className="text-ylang-rose mt-1 block text-[10px] font-medium italic">
                              {category.subtitle}
                            </span>
                          )}
                        </Link>
                        <ul className="space-y-2">
                          {category.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={closeMegaMenu}
                                className="text-ylang-charcoal/70 hover:text-ylang-rose font-body block text-xs transition-colors duration-200"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            // Correction 3: Application de la référence au conteneur mobile
            ref={mobileMenuRef}
            className="bg-ylang-cream/98 border-ylang-beige fixed top-16 right-0 left-0 z-40 max-h-[calc(100vh-64px)] overflow-y-auto border-b shadow-2xl backdrop-blur-lg lg:hidden"
          >
            <nav className="px-4 py-6">
              {/* Navigation principale mobile */}
              <div className="border-ylang-beige mb-6 space-y-3 border-b pb-6">
                {mainNavigation.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMegaMenu}
                      className={cn(
                        "font-body block rounded-lg px-4 py-3 text-base transition-all duration-300",
                        pathname === item.href
                          ? "bg-ylang-rose font-medium text-white"
                          : "text-ylang-charcoal hover:bg-ylang-beige",
                        item.featured && "border-ylang-rose border-2",
                      )}
                    >
                      {item.name}
                      {item.featured && (
                        <span className="ml-2 text-xs">✨</span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Catégories de produits mobile */}
              <div className="space-y-2">
                <h4 className="text-ylang-charcoal/50 font-body mb-4 px-4 text-xs font-semibold tracking-widest uppercase">
                  Nos créations par catégorie
                </h4>
                {megaMenuCategories.map((category, index) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (mainNavigation.length + index) * 0.05,
                    }}
                  >
                    {/* Correction 4: Ajout de e.stopPropagation() pour éviter le conflit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCategory(
                          expandedCategory === category.title
                            ? null
                            : category.title,
                        );
                      }}
                      className="text-ylang-charcoal hover:bg-ylang-beige/50 flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors"
                    >
                      <span className="font-body text-sm font-medium">
                        {category.title}
                        {category.subtitle && (
                          <span className="text-ylang-rose ml-2 text-[10px] italic">
                            {category.subtitle}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedCategory === category.title && "rotate-180",
                        )}
                        strokeWidth={1.5}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedCategory === category.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-ylang-beige/30 ml-4 space-y-1 rounded-lg px-4 py-2">
                            {category.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                // Ferme le menu principal lors de la navigation vers la sous-catégorie
                                onClick={closeMegaMenu}
                                className="text-ylang-charcoal/80 hover:text-ylang-rose font-body flex items-center py-2 text-sm transition-colors"
                              >
                                <ChevronRight
                                  className="mr-2 h-3 w-3"
                                  strokeWidth={1.5}
                                />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Actions mobile */}
              <div className="border-ylang-beige mt-6 space-y-3 border-t pt-6">
                <Button
                  onClick={() => {
                    router.push("/configurateur");
                    closeMegaMenu();
                  }}
                  variant="luxury"
                  className="w-full"
                >
                  ✨ Créer sur mesure
                </Button>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      closeMegaMenu();
                      setIsSearchOpen(true);
                    }}
                    className="bg-ylang-beige/50 hover:bg-ylang-beige flex flex-col items-center justify-center rounded-lg p-4 transition-colors"
                  >
                    <Search
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">
                      Recherche
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      closeMegaMenu();
                      useWishlistStore.getState().openWishlist();
                    }}
                    className="bg-ylang-beige/50 hover:bg-ylang-beige relative flex flex-col items-center justify-center rounded-lg p-4 transition-colors"
                  >
                    <Heart
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">Favoris</span>
                    {wishlistCount > 0 && (
                      <span className="bg-ylang-rose absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      closeMegaMenu();
                      useCartStore.getState().openCart();
                    }}
                    className="bg-ylang-beige/50 hover:bg-ylang-beige relative flex flex-col items-center justify-center rounded-lg p-4 transition-colors"
                  >
                    <ShoppingBag
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                    <span className="text-ylang-charcoal text-xs">Panier</span>
                    {cartCount > 0 && (
                      <span className="bg-ylang-rose absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                        {cartCount}
                      </span>
                    )}
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

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
