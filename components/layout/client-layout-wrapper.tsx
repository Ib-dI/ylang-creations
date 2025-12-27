"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";
import { usePathname } from "next/navigation";
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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="mt-22 lg:mt-26">{children}</div>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      {/* <CookieBanner /> */}
    </>
  );
}
