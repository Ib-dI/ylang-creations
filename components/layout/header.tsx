"use client";

import { SearchModal } from "@/components/search/search-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { type Session } from "@supabase/supabase-js";
import {
  ChevronDown,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
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

// Catégories du Mega Menu
const megaMenuCategories = [
  {
    title: "LA CHAMBRE",
    href: "/collections?category=chambre",
    items: [
      {
        name: "Coussin musical",
        href: "/collections?category=chambre&search=Coussin musical",
      },
      {
        name: "Couverture",
        href: "/collections?category=chambre&search=Couverture",
      },
      {
        name: "Draps de lit bébé",
        href: "/collections?category=chambre&search=Draps de lit",
      },
      {
        name: "Housse matelas à langer",
        href: "/collections?category=chambre&search=Housse matelas",
      },
      {
        name: "Lange carré blanc",
        href: "/collections?category=chambre&search=Lange carré",
      },
      {
        name: "Mobile de lit",
        href: "/collections?category=chambre&search=Mobile de lit",
      },
      {
        name: "Tour de lit",
        href: "/collections?category=chambre&search=Tour de lit",
      },
    ],
    sections: [
      {
        title: "Gigoteuses Légères",
        items: [
          {
            name: "0/3 mois",
            href: "/collections?category=chambre&search=Gigoteuse légère 0/3",
          },
          {
            name: "3/6 mois",
            href: "/collections?category=chambre&search=Gigoteuse légère 3/6",
          },
          {
            name: "6/12 mois",
            href: "/collections?category=chambre&search=Gigoteuse légère 6/12",
          },
          {
            name: "12/24 mois",
            href: "/collections?category=chambre&search=Gigoteuse légère 12/24",
          },
        ],
      },
      {
        title: "Gigoteuses Molletonnées",
        items: [
          {
            name: "0/3 mois",
            href: "/collections?category=chambre&search=Gigoteuse molletonnée 0/3",
          },
          {
            name: "3/6 mois",
            href: "/collections?category=chambre&search=Gigoteuse molletonnée 3/6",
          },
          {
            name: "6/12 mois",
            href: "/collections?category=chambre&search=Gigoteuse molletonnée 6/12",
          },
          {
            name: "12/24 mois",
            href: "/collections?category=chambre&search=Gigoteuse molletonnée 12/24",
          },
        ],
      },
    ],
  },
  {
    title: "LA TOILETTE",
    href: "/collections?category=toilette",
    items: [
      {
        name: "Bavoir",
        href: "/collections?category=toilette&search=Bavoir",
      },
      {
        name: "Cape de bain",
        href: "/collections?category=toilette&search=Cape de bain",
      },
      {
        name: "Gant de toilette",
        href: "/collections?category=toilette&search=Gant de toilette",
      },
      {
        name: "Serviette de toilette",
        href: "/collections?category=toilette&search=Serviette de toilette",
      },
    ],
  },
  {
    title: "LINGE DE NAISSANCE",
    href: "/collections?category=linge-naissance",
    items: [
      {
        name: "Pyjama",
        href: "/collections?category=linge-naissance&search=Pyjama",
      },
      {
        name: "Chaussons",
        href: "/collections?category=linge-naissance&search=Chaussons",
      },
      {
        name: "Pantalon",
        href: "/collections?category=linge-naissance&search=Pantalon",
      },
      {
        name: "Gilet cache-cœur",
        href: "/collections?category=linge-naissance&search=Gilet cache-cœur",
      },
      {
        name: "Bloomer",
        href: "/collections?category=linge-naissance&search=Bloomer",
      },
      {
        name: "Robe chasuble 12 mois",
        href: "/collections?category=linge-naissance&search=Robe chasuble",
      },
    ],
  },
  {
    title: "BAGAGERIES/PROMENADE",
    href: "/collections?category=bagageries",
    items: [
      {
        name: "Valisette",
        href: "/collections?category=bagageries&search=Valisette",
      },
      {
        name: "Vanity",
        href: "/collections?category=bagageries&search=Vanity",
      },
      {
        name: "Sac à langer",
        href: "/collections?category=bagageries&search=Sac à langer",
      },
      {
        name: "Sac à dos maternelle",
        href: "/collections?category=bagageries&search=Sac à dos maternelle",
      },
      {
        name: "Matelas à langer nomade",
        href: "/collections?category=bagageries&search=Matelas à langer nomade",
      },
      {
        name: "Protège carnet de santé",
        href: "/collections?category=bagageries&search=Protège carnet de santé",
      },
      {
        name: "Protège livret de famille",
        href: "/collections?category=bagageries&search=Protège livret de famille",
      },
      {
        name: "Protège passeport",
        href: "/collections?category=bagageries&search=Protège passeport",
      },
      {
        name: "Trousse de toilette",
        href: "/collections?category=bagageries&search=Trousse de toilette",
      },
    ],
  },
  {
    title: "ACCESSOIRES",
    href: "/collections?category=accessoires",
    items: [
      {
        name: "Anneaux de dentition",
        href: "/collections?category=accessoires&search=Anneaux de dentition",
      },
      {
        name: "Attache tétine",
        href: "/collections?category=accessoires&search=Attache tétine",
      },
      {
        name: "Brosse à cheveux",
        href: "/collections?category=accessoires&search=Brosse à cheveux",
      },
    ],
  },
  {
    title: "LES JEUX",
    href: "/collections?category=jeux",
    subtitle: "PARTENARIAT EXCLUSIF URBIDOLLS",
    items: [
      {
        name: "Poupées",
        href: "/collections?category=jeux&search=Poupée",
      },
      {
        name: "Bébés",
        href: "/collections?category=jeux&search=Bébé",
      },
      {
        name: "Accessoires",
        href: "/collections?category=jeux&search=Accessoire",
      },
    ],
  },
];

// Badge de compteur animé (composant léger)
const AnimatedBadge = React.memo(({ count }: { count: number }) => {
  if (count === 0) return null;

  return (
    <span
      className="bg-ylang-rose animate-scale-in absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-medium text-white lg:-top-1 lg:-right-1 lg:h-4 lg:w-4 lg:text-[10px]"
      aria-hidden="true"
    >
      {count}
    </span>
  );
});
AnimatedBadge.displayName = "AnimatedBadge";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = React.useState<Session | null>(null);

  // États UI
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null,
  );

  // Store hooks
  const cartCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.getTotalItems());
  const setShippingConfig = useCartStore((state) => state.setShippingConfig);
  const freeShippingThreshold = useCartStore(
    (state) => state.freeShippingThreshold,
  );

  // Refs
  const megaMenuRef = React.useRef<HTMLDivElement>(null);
  const desktopMegaMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  // Auth effect
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Shipping config effect
  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setShippingConfig(
            parseFloat(data.shippingFee) || 9.9,
            parseFloat(data.freeShippingThreshold) || 150,
          );
        }
      })
      .catch(console.error);
  }, [setShippingConfig]);

  // Scroll effect - throttled
  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside effect
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideMegaMenu = megaMenuRef.current?.contains(
        event.target as Node,
      );
      const isClickInsideDesktopMegaMenu = desktopMegaMenuRef.current?.contains(
        event.target as Node,
      );
      const isClickInsideMobileMenu = mobileMenuRef.current?.contains(
        event.target as Node,
      );

      if (
        isMegaMenuOpen &&
        !isClickInsideMegaMenu &&
        !isClickInsideDesktopMegaMenu &&
        !isClickInsideMobileMenu
      ) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMegaMenuOpen]);

  const toggleMegaMenu = React.useCallback(() => {
    setIsMegaMenuOpen((prev) => !prev);
  }, []);

  const closeMegaMenu = React.useCallback(() => {
    setIsMegaMenuOpen(false);
    setExpandedCategory(null);
  }, []);

  const handleSignOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    router.refresh();
  }, [supabase.auth, router]);

  return (
    <>
      <header
        className={cn(
          "bg-pattern fixed top-0 right-0 left-0 z-50 transition-all duration-500",
          isScrolled && "shadow-[0_2px_20px_rgba(0,0,0,0.08)]",
        )}
      >
        {/* Barre Social Media */}
        <div className="bg-ylang-rose px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/ylang_creations/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white transition-colors hover:text-white/80"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.facebook.com/ylangcreations/?ref=_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white transition-colors hover:text-white/80"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="font-body hidden text-[10px] font-medium tracking-widest text-white uppercase sm:block">
              Livraison offerte dès {freeShippingThreshold}€ d&apos;achat
            </p>
          </div>
        </div>

        {/* Barre principale */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Bouton Menu et Recherche Mobile */}
            <div className="flex items-center gap-2" ref={megaMenuRef}>
              <button
                onClick={toggleMegaMenu}
                aria-label={
                  isMegaMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
                }
                aria-expanded={isMegaMenuOpen}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2",
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

              {/* Nouveau bouton recherche mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Rechercher"
                className="text-ylang-charcoal hover:text-ylang-rose flex transform items-center justify-center rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80 sm:hidden"
              >
                <Search className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="group absolute left-1/2 -translate-x-1/2 transform"
              aria-label="Ylang Créations - Accueil"
            >
              <div className="relative h-20 w-20 sm:h-[100px] sm:w-[100px]">
                <Image
                  src="/logo/ylang créations_6.png"
                  alt="Ylang Créations"
                  fill
                  priority
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 80px, 100px"
                />
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Rechercher"
                className="text-ylang-charcoal hover:text-ylang-rose hidden transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80 sm:block"
              >
                <Search className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
              </button>

              {/* Reste du code dans la partie 2... */}
              {/* Account Dropdown */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Mon compte"
                      className="text-ylang-charcoal hover:border-ylang-rose focus:ring-ylang-rose/20 h-9 w-9 transform overflow-hidden rounded-full border border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80 focus:ring-2 focus:outline-none"
                    >
                      {session.user.user_metadata?.avatar_url ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={session.user.user_metadata.avatar_url}
                            alt={
                              session.user.user_metadata?.full_name ?? "User"
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-ylang-rose/10 text-ylang-rose group-hover:bg-ylang-rose/20 flex h-full w-full items-center justify-center text-xs font-bold uppercase transition-colors">
                          {session.user.email?.charAt(0) || "U"}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-ylang-beige w-64 bg-white/95 p-2 shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="border-ylang-beige bg-ylang-cream flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                        {session.user.user_metadata?.avatar_url ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={session.user.user_metadata.avatar_url}
                              alt={
                                session.user.user_metadata?.full_name ?? "User"
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-ylang-rose text-sm font-bold uppercase">
                            {session.user.email?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {session.user.user_metadata?.full_name ||
                            session.user.email?.split("@")[0]}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-ylang-beige" />

                    <div className="py-1">
                      {session.user.app_metadata?.role === "admin" ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="group focus:text-ylang-rose data-highlighted:text-ylang-rose hover:bg-ylang-beige hover:text-ylang-rose flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-colors"
                          >
                            <LayoutDashboard className="group-hover:text-ylang-rose mr-3 h-4 w-4 text-gray-400" />
                            <span>Tableau de bord</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push("/orders")}
                            className="group focus:text-ylang-rose data-highlighted:text-ylang-rose hover:bg-ylang-beige hover:text-ylang-rose cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-colors"
                          >
                            <Package className="group-hover:text-ylang-rose mr-3 h-4 w-4 text-gray-400" />
                            <span>Mes Commandes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push("/profil")}
                            className="group focus:text-ylang-rose data-highlighted:text-ylang-rose hover:bg-ylang-beige hover:text-ylang-rose cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-colors"
                          >
                            <User className="group-hover:text-ylang-rose mr-3 h-4 w-4 text-gray-400" />
                            <span>Mon Profil</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </div>

                    <DropdownMenuSeparator className="bg-ylang-beige" />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="group cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:text-red-700 data-highlighted:text-red-700"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-700" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => router.push("/sign-in")}
                  aria-label="Se connecter"
                  className="text-ylang-charcoal hover:text-ylang-rose transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => useWishlistStore.getState().openWishlist()}
                aria-label="Ma liste d'envies"
                className="text-ylang-charcoal hover:text-ylang-rose relative transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
              >
                <Heart className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
                <AnimatedBadge count={wishlistCount} />
              </button>

              {/* Cart */}
              <button
                onClick={() => useCartStore.getState().openCart()}
                aria-label="Mon panier"
                className="text-ylang-charcoal hover:text-ylang-rose group relative transform rounded-full bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/80"
              >
                <ShoppingBag
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  strokeWidth={1.5}
                />
                <AnimatedBadge count={cartCount} />
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

        <div className="via-ylang-beige h-px bg-linear-to-r from-transparent to-transparent" />
      </header>

      {/* Mega Menu Desktop - Optimisé sans framer-motion */}
      {isMegaMenuOpen && (
        <div
          ref={desktopMegaMenuRef}
          className="bg-ylang-cream/98 animate-fade-in-down fixed top-20 right-0 left-0 z-40 hidden shadow-2xl backdrop-blur-lg lg:block"
          style={{ animation: "fadeInDown 0.3s ease-out" }}
        >
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="flex gap-12">
              {/* Navigation Principale */}
              <div className="border-ylang-terracotta shrink-0 border-r pr-8">
                <h3 className="text-ylang-charcoal/50 font-body mb-6 text-xs font-semibold tracking-widest uppercase">
                  Menu
                </h3>
                <ul className="space-y-2">
                  {mainNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={closeMegaMenu}
                          className={cn(
                            "group flex items-center justify-between rounded-lg p-2 text-lg font-light tracking-wide transition-all duration-300",
                            isActive
                              ? "text-ylang-rose bg-ylang-terracotta/10 font-medium"
                              : "text-ylang-charcoal hover:text-ylang-rose hover:bg-ylang-terracotta/10 hover:translate-x-2",
                          )}
                        >
                          <span>
                            {item.name}
                            {item.featured ? (
                              <span className="ml-2 text-sm">✨</span>
                            ) : null}
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
              </div>

              {/* Grille Catégories */}
              <div className="grow">
                <div className="grid grid-cols-5 gap-12">
                  <div className="col-span-4 grid grid-cols-4 gap-x-8 gap-y-10">
                    {megaMenuCategories.map((category) => (
                      <div key={category.title} className="space-y-4">
                        <Link
                          href={category.href}
                          onClick={closeMegaMenu}
                          className="group block"
                        >
                          <h3 className="text-ylang-rose font-abramo text-sm font-bold tracking-wider transition-colors">
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
                                className="text-ylang-charcoal/70 hover:text-ylang-rose hover:bg-ylang-terracotta/10 font-body block text-xs transition-colors duration-200"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* @ts-ignore - sections added in data */}
                        {category.sections && (
                          <div className="space-y-4 pt-2">
                            {/* @ts-ignore */}
                            {category.sections.map((section) => (
                              <div key={section.title} className="space-y-2">
                                <h4 className="border-ylang-beige font-body border-b pb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                  {section.title}
                                </h4>
                                <ul className="grid grid-cols-2 gap-1">
                                  {section.items.map((item: any) => (
                                    <li key={item.name}>
                                      <Link
                                        href={item.href}
                                        onClick={closeMegaMenu}
                                        className="text-ylang-charcoal/60 hover:text-ylang-rose hover:bg-ylang-beige font-body block rounded-sm px-1 py-0.5 text-[10px] transition-colors"
                                      >
                                        {item.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Produit Vedette - Touche Premium */}
                  {/* <div className="border-ylang-beige/50 col-span-1 border-l pl-8">
                    <div className="group relative overflow-hidden rounded-2xl">
                      <div className="aspect-3/4overflow-hidden">
                        <Image
                          src="/images/products/gigoteuse.jpg"
                          alt="Nouveauté ylang"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="from-ylang-charcoal/60 absolute inset-0 bg-linear-to-t to-transparent" />
                      </div>
                      <div className="absolute right-4 bottom-4 left-4 text-white">
                        <p className="font-body text-[10px] font-medium tracking-widest uppercase">
                          Must-have
                        </p>
                        <h4 className="font-heading mt-1 text-lg leading-tight font-bold">
                          Gigoteuse <br />
                          sur-mesure
                        </h4>
                        <Link
                          href="/configurateur"
                          onClick={closeMegaMenu}
                          className="hover:text-ylang-rose mt-3 inline-flex items-center text-xs font-semibold underline underline-offset-4 transition-colors"
                        >
                          Configurer la mienne
                        </Link>
                      </div>
                    </div>

                    <div className="bg-ylang-beige/50 mt-8 rounded-xl p-4">
                      <h4 className="text-ylang-charcoal font-heading text-xs font-bold tracking-wider uppercase">
                        Atelier Ylang
                      </h4>
                      <p className="text-ylang-charcoal/60 mt-1 text-[10px] leading-relaxed">
                        Chaque pièce est imaginée et confectionnée avec amour à
                        Lyon.
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu - Optimisé */}
      {isMegaMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="bg-ylang-cream/98 border-ylang-beige animate-fade-in fixed top-16 right-0 left-0 z-40 max-h-[calc(100vh-64px)] overflow-y-auto border-b shadow-2xl backdrop-blur-lg lg:hidden"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <nav className="px-4 py-6">
            {/* Recherche Mobile */}
            <div className="mb-6">
              <button
                onClick={() => {
                  closeMegaMenu();
                  setIsSearchOpen(true);
                }}
                className="border-ylang-beige text-ylang-charcoal/60 hover:border-ylang-rose/50 mt-4 flex w-full items-center gap-3 rounded-xl border bg-white/80 px-4 py-3 transition-all duration-300 hover:bg-white"
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
                <span className="font-body text-sm">
                  Rechercher un produit...
                </span>
              </button>
            </div>

            {/* Navigation principale */}
            <div className="border-ylang-beige mb-6 space-y-3 border-b pb-6">
              {mainNavigation.map((item, index) => (
                <div
                  key={item.href}
                  style={{
                    animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`,
                  }}
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
                    {item.featured ? (
                      <span className="ml-2 text-xs">✨</span>
                    ) : null}
                  </Link>
                </div>
              ))}
            </div>

            {/* Catégories */}
            <div className="space-y-2">
              <h4 className="text-ylang-charcoal/50 font-body mb-4 px-4 text-xs font-semibold tracking-widest uppercase">
                Nos créations par catégorie
              </h4>
              {megaMenuCategories.map((category, index) => (
                <div
                  key={category.title}
                  style={{
                    animation: `slideInLeft 0.3s ease-out ${(mainNavigation.length + index) * 0.05}s both`,
                  }}
                >
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

                  {expandedCategory === category.title && (
                    <div className="animate-slide-down overflow-hidden">
                      <div className="bg-ylang-beige/30 ml-4 space-y-1 rounded-lg px-4 py-2">
                        {category.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
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

                        {/* @ts-ignore */}
                        {category.sections &&
                          /* @ts-ignore */
                          category.sections.map((section) => (
                            <div
                              key={section.title}
                              className="mt-4 first:mt-2"
                            >
                              <h5 className="text-ylang-charcoal/40 font-body px-2 pb-1 text-[10px] font-bold tracking-wider uppercase">
                                {section.title}
                              </h5>
                              <div className="grid grid-cols-2 gap-1">
                                {section.items.map((item: any) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={closeMegaMenu}
                                    className="text-ylang-charcoal/70 hover:text-ylang-rose font-body rounded-md px-2 py-2 text-xs transition-colors hover:bg-white"
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions Mobile */}
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
                  aria-label="Rechercher"
                  className="bg-ylang-beige/50 hover:bg-ylang-beige flex flex-col items-center justify-center rounded-lg p-4 transition-colors"
                >
                  <Search
                    className="text-ylang-charcoal mb-1 h-5 w-5"
                    strokeWidth={1.5}
                  />
                  <span className="text-ylang-charcoal text-xs">Recherche</span>
                </button>

                <button
                  onClick={() => {
                    closeMegaMenu();
                    useWishlistStore.getState().openWishlist();
                  }}
                  aria-label="Mes favoris"
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
                  aria-label="Mon panier"
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

                <button
                  onClick={() => {
                    closeMegaMenu();
                    if (!session) {
                      router.push("/sign-in");
                    } else if (session.user.app_metadata?.role === "admin") {
                      router.push("/admin");
                    } else {
                      router.push("/profil");
                    }
                  }}
                  aria-label={session ? "Mon compte" : "Se connecter"}
                  className="bg-ylang-beige/50 hover:bg-ylang-beige flex flex-col items-center justify-center rounded-lg p-4 transition-colors"
                >
                  {session?.user.user_metadata?.avatar_url ? (
                    <img
                      src={session.user.user_metadata.avatar_url}
                      alt="Profile"
                      className="mb-1 h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <User
                      className="text-ylang-charcoal mb-1 h-5 w-5"
                      strokeWidth={1.5}
                    />
                  )}
                  <span className="text-ylang-charcoal text-xs">
                    {session ? "Compte" : "Connexion"}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}
