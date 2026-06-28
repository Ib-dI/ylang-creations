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
  Heart,
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
  { name: "LA BOUTIQUE", href: "/collections", hasMegaMenu: true },
  { name: "Sur mesure", href: "/configurateur", featured: true },
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
      className="bg-ylang-beige animate-scale-in absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-medium text-ylang-rose lg:-top-1 lg:-right-1 lg:h-4 lg:w-4 lg:text-[10px]"
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
  const categoryRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

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

  // Bloquer le scroll arrière-plan quand le mega menu est ouvert
  React.useEffect(() => {
    document.documentElement.style.overflow = isMegaMenuOpen ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [isMegaMenuOpen]);

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
          "bg-ylang-rose fixed top-0 right-0 left-0 z-50 transition-all duration-500",
          isScrolled && "shadow-[0_2px_20px_rgba(0,0,0,0.08)]",
        )}
      >
        {/* Barre d'annonce */}
        <div className="border-b px-4 py-2 sm:px-6 lg:px-8" style={{ background: "var(--color-paper-2)", borderColor: "var(--color-ink-2)" }}>
          <p className="text-center font-medium uppercase tracking-[0.18em] text-[10px] sm:text-md" style={{ fontFamily: "var(--font-body)", color: "var(--color-ink-3)" }}>
            Livraison offerte dès {freeShippingThreshold}&nbsp;€ d&apos;achat
          </p>
        </div>

        {/* Barre principale */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-18">
            {/* Bouton Menu et Recherche Mobile */}
            <div className="flex items-center gap-2" ref={megaMenuRef}>
              <button
                onClick={toggleMegaMenu}
                aria-label={
                  isMegaMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
                }
                aria-expanded={isMegaMenuOpen}
                className={cn(
                  "flex h-10 w-10 items-center justify-center transition-all duration-300 rounded-full sm:rounded-none lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2 cursor-pointer",
                  "hover:text-ylang-rose hover:bg-white/80",
                  isMegaMenuOpen ? "text-ylang-rose bg-white/80" : "text-ylang-white bg-white/20",
                )}
              >
                {isMegaMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.2} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.2} />
                )}
                <span className="font-body hidden text-sm font-light tracking-wide uppercase lg:inline">
                  Menu
                </span>
              </button>

              {/* Nouveau bouton recherche mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Rechercher"
                className="text-ylang-white hover:text-ylang-rose flex items-center justify-center rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 sm:hidden"
              >
                <Search className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.2} />
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
                className="text-ylang-white hover:text-ylang-rose hidden rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 sm:block"
              >
                <Search className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.2} />
              </button>

              {/* Reste du code dans la partie 2... */}
              {/* Account Dropdown */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Mon compte"
                      className="text-ylang-charcoal hover:border-ylang-rose focus:ring-ylang-rose/20 h-9 w-9 overflow-hidden rounded-full border border-ylang-beige/60 transition-all duration-300 hover:border-ylang-rose/50 focus:ring-2 focus:outline-none"
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
                  className="text-ylang-white hover:text-ylang-rose rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.2} />
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => useWishlistStore.getState().openWishlist()}
                aria-label="Ma liste d'envies"
                className="text-ylang-white hover:text-ylang-rose relative rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
              >
                <Heart className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.2} />
                <AnimatedBadge count={wishlistCount} />
              </button>

              {/* Cart */}
              <button
                onClick={() => useCartStore.getState().openCart()}
                aria-label="Mon panier"
                className="text-ylang-white hover:text-ylang-rose group relative rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
              >
                <ShoppingBag
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  strokeWidth={1.2}
                />
                <AnimatedBadge count={cartCount} />
              </button>

              {/* CTA Desktop */}
              <Button
                onClick={() => router.push("/configurateur")}
                variant="luxury"
                size="sm"
                className="ml-2 hidden lg:flex border duration-300 transition-all border-ylang-beige/20 hover:border-ylang-beige"
              >
                Configurer
              </Button>
            </div>
          </div>
        </div>

        <div className="via-ylang-beige h-px bg-linear-to-r from-transparent to-transparent" />
      </header>

      {/* Mega Menu Desktop */}
      {isMegaMenuOpen && (
        <div
          ref={desktopMegaMenuRef}
          className="animate-fade-in-down fixed top-20 right-0 left-0 z-40 hidden lg:flex"
          style={{ height: "calc(100vh - 5rem)", boxShadow: "0 12px 48px rgba(0,0,0,0.12)", animation: "fadeInDown 0.25s ease-out" }}
        >
          {/* ── Colonne éditoriale gauche 40% ── */}
          <div className="flex w-[40%] shrink-0 flex-col overflow-hidden bg-ylang-beige px-14 py-10">
            <p className="type-overline mb-10" style={{ color: "var(--color-ink-3)" }}>
              La boutique
            </p>
            <nav className="space-y-0">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMegaMenu}
                    className={cn(
                      "group flex items-center justify-between py-3 text-[1.65rem] font-light tracking-wide transition-all duration-200",
                      isActive ? "text-ylang-rose" : "hover:text-ylang-rose hover:pl-1",
                    )}
                    style={{
                      fontFamily: "var(--font-display)",
                      color: isActive ? undefined : "var(--color-ink)",
                      borderBottom: "var(--rule-soft)",
                    }}
                  >
                    <span>{item.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                        isActive && "opacity-100 text-ylang-rose",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Colonne catégories droite 60% ── */}
          <div className="relative w-[60%] overflow-hidden bg-ylang-cream">
            {/* Image d'ambiance en fond */}
            <div className="absolute inset-0">
              <Image
                src="/images/products/ensemble.jpg"
                alt=""
                fill
                className="object-cover opacity-[0.07]"
                sizes="60vw"
                aria-hidden="true"
              />
            </div>

            <div className="relative h-full overflow-y-auto px-12 py-10">
              <p className="type-overline mb-8" style={{ color: "var(--color-ink-3)" }}>
                Nos créations
              </p>
              <div className="grid grid-cols-4 gap-x-8 gap-y-8">
                {megaMenuCategories.map((category) => {
                  const isChambre = category.title === "LA CHAMBRE";

                  if (isChambre) {
                    return (
                      <div key={category.title} className="col-span-2 space-y-4">
                        {/* Titre */}
                        <Link href={category.href} onClick={closeMegaMenu} className="group block">
                          <p className="type-overline transition-colors group-hover:text-ylang-rose" style={{ color: "var(--color-accent)" }}>
                            {category.title}
                          </p>
                        </Link>

                        {/* Items en grille 2 colonnes */}
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {category.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={closeMegaMenu}
                                className="font-body block text-sm font-light transition-colors duration-200 hover:text-ylang-rose hover:underline underline-offset-4"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* Sections gigoteuses côte à côte */}
                        <div className="grid grid-cols-2 gap-x-6 pt-2" style={{ borderTop: "var(--rule-soft)" }}>
                          {category.sections?.map((section) => (
                            <div key={section.title} className="space-y-1.5">
                              <p
                                className="font-body pb-1 text-[10px] font-semibold tracking-wider uppercase"
                                style={{ color: "var(--color-ink-3)", borderBottom: "var(--rule-soft)" }}
                              >
                                {section.title}
                              </p>
                              <ul className="space-y-1">
                                {section.items.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      href={item.href}
                                      onClick={closeMegaMenu}
                                      className="font-body block text-sm font-light transition-colors duration-200 hover:text-ylang-rose hover:underline underline-offset-4"
                                      style={{ color: "var(--color-ink-3)" }}
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
                    );
                  }

                  return (
                    <div key={category.title} className="min-w-0 space-y-3 overflow-hidden">
                      <Link href={category.href} onClick={closeMegaMenu} className="group block">
                        <p className="type-overline break-words transition-colors group-hover:text-ylang-rose" style={{ color: "var(--color-accent)" }}>
                          {category.title}
                        </p>
                        {category.subtitle && (
                          <span className="mt-0.5 block text-[10px] italic" style={{ color: "var(--color-ink-3)" }}>
                            {category.subtitle}
                          </span>
                        )}
                      </Link>
                      <ul className="space-y-1.5">
                        {category.items.slice(0, 5).map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={closeMegaMenu}
                              className="font-body block text-sm font-light transition-colors duration-200 hover:text-ylang-rose hover:underline underline-offset-4"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                        {category.items.length > 5 && (
                          <li>
                            <Link
                              href={category.href}
                              onClick={closeMegaMenu}
                              className="text-[11px] font-medium text-ylang-rose hover:underline underline-offset-4"
                            >
                              Voir tout →
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMegaMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="animate-fade-in fixed top-16 right-0 left-0 z-40 overflow-y-auto lg:hidden"
          style={{ height: "calc(100vh - 4rem)", animation: "fadeIn 0.25s ease-out", boxShadow: "0 12px 48px rgba(0,0,0,0.12)" }}
        >
          {/* Section nav principale — bg-ylang-beige */}
          <div className="bg-ylang-beige px-6 py-8">
            <p className="type-overline mb-6" style={{ color: "var(--color-ink-3)" }}>
              La boutique
            </p>
            <nav>
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMegaMenu}
                    className={cn(
                      "flex items-center justify-between py-4 text-2xl font-light transition-colors duration-200",
                      isActive ? "text-ylang-rose" : "hover:text-ylang-rose",
                    )}
                    style={{
                      fontFamily: "var(--font-display)",
                      color: isActive ? undefined : "var(--color-ink)",
                      borderBottom: "var(--rule-soft)",
                    }}
                  >
                    <span>{item.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50" strokeWidth={1} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section catégories — bg-ylang-cream */}
          <div className="bg-ylang-cream px-6 py-8">
            <p className="type-overline mb-6" style={{ color: "var(--color-ink-3)" }}>
              Nos créations
            </p>
            <div>
              {megaMenuCategories.map((category) => {
                const isOpen = expandedCategory === category.title;
                return (
                  <div key={category.title}>
                    <button
                      ref={(el) => {
                        if (el) categoryRefs.current.set(category.title, el);
                        else categoryRefs.current.delete(category.title);
                      }}
                      onClick={() => {
                        const opening = !isOpen;
                        setExpandedCategory(opening ? category.title : null);
                        if (opening) {
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              const btn = categoryRefs.current.get(category.title);
                              const container = mobileMenuRef.current;
                              if (btn && container) {
                                const containerRect = container.getBoundingClientRect();
                                const btnRect = btn.getBoundingClientRect();
                                container.scrollTo({
                                  top: container.scrollTop + (btnRect.top - containerRect.top) - 16,
                                  behavior: "smooth",
                                });
                              }
                            });
                          });
                        }
                      }}
                      className="flex w-full items-center justify-between py-3 transition-colors"
                      style={{ borderBottom: "var(--rule-soft)" }}
                    >
                      <span
                        className="type-overline transition-colors duration-200"
                        style={{ color: isOpen ? "var(--color-ylang-rose)" : "var(--color-accent)" }}
                      >
                        {category.title}
                      </span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isOpen && "rotate-180")}
                        style={{ color: "var(--color-ink-3)" }}
                        strokeWidth={1.5}
                      />
                    </button>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-2 py-4 pl-2">
                          {category.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={closeMegaMenu}
                              className="font-body block py-1.5 text-sm font-light transition-colors hover:text-ylang-rose hover:underline underline-offset-4"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              {item.name}
                            </Link>
                          ))}
                          {category.sections?.map((section) => (
                            <div key={section.title} className="mt-4 space-y-2">
                              <p
                                className="font-body pb-1 text-[10px] font-semibold tracking-wider uppercase"
                                style={{ color: "var(--color-ink-3)", borderBottom: "var(--rule-soft)" }}
                              >
                                {section.title}
                              </p>
                              {section.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={closeMegaMenu}
                                  className="font-body block py-1 text-sm font-light transition-colors hover:text-ylang-rose hover:underline underline-offset-4"
                                  style={{ color: "var(--color-ink-3)" }}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
          animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
