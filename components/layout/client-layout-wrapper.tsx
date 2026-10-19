"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";
import { useCartStore } from "@/lib/store/cart-store";
import { useNavigationStore } from "@/lib/store/navigation-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
// import { CookieBanner } from "./cookie-banner";
import { Footer } from "./footer";
import { Header } from "./header";

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Stores persistés (skipHydration) : lecture du localStorage après le montage
  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useNavigationStore.persist.rehydrate();
    Promise.resolve(useCartStore.persist.rehydrate()).then(() =>
      useCartStore.getState().refreshWeights(),
    );
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="mt-22 lg:mt-25">{children}</div>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      {/* <CookieBanner /> */}
    </>
  );
}
