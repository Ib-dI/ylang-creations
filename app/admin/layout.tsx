"use client";

import { PremiumLoader } from "@/components/admin/premium-loader";
import { SidebarToggle } from "@/components/admin/sidebar-toggle";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Commandes",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Produits",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Clients",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { push } = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        push("/sign-in");
        return;
      }

      if (user.app_metadata?.role !== "admin") {
        push("/");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkAuth();
  }, [push, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    push("/");
  };

  if (loading) {
    return <PremiumLoader />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="bg-ylang-terracotta/30 min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="border-ylang-beige flex h-10 items-center gap-2 rounded-xl border bg-white px-3 shadow-lg"
        >
          <Menu className="text-ylang-charcoal h-5 w-5" />
          <span className="text-ylang-charcoal font-body text-xs font-semibold uppercase">
            Menu
          </span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-ylang-beige flex h-full flex-col border-r bg-white">
          {/* Logo */}
          <div
            className={`border-ylang-beige flex items-center border-b transition-all duration-300 ${
              sidebarOpen ? "p-6" : "flex-col gap-4 p-4"
            }`}
          >
            <Link
              href="/"
              className={`flex items-center gap-3 ${
                sidebarOpen ? "" : "justify-center"
              }`}
            >
              <Image
                src="/logo/logo-2.png"
                alt="Ylang Logo"
                width={40}
                height={40}
              />
              {sidebarOpen && (
                <span className="font-display text-ylang-charcoal font-bold whitespace-nowrap">
                  Ylang Admin
                </span>
              )}
            </Link>
            <div className={sidebarOpen ? "ml-auto" : ""}>
              <SidebarToggle
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    sidebarOpen ? "justify-start" : "justify-center"
                  } ${
                    isActive
                      ? "text-ylang-rose bg-ylang-terracotta/20"
                      : "text-ylang-charcoal hover:text-ylang-rose hover:bg-ylang-terracotta/20"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle & Logout */}
          <div className="border-ylang-beige space-y-2 border-t p-4">
            <Link
              href="/admin/settings"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                pathname === "/admin/settings"
                  ? "text-ylang-rose bg-ylang-terracotta/20"
                  : "text-ylang-charcoal hover:bg-ylang-terracotta/20 hover:text-ylang-rose"
              }`}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">Paramètres</span>}
            </Link>

            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50 ${
                sidebarOpen ? "justify-start" : "justify-center"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {sidebarOpen ? (
                <span className="font-medium">Déconnexion</span>
              ) : null}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`pb-12 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="px-4 pt-20 sm:p-6 lg:p-8">
          <div className="safe-area-bottom">{children}</div>
        </div>
      </main>
    </div>
  );
}
