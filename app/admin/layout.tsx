"use client";

import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  ChevronLeft,
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
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
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
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="from-ylang-cream to-ylang-beige min-h-screen bg-linear-to-br">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="border-ylang-beige rounded-xl border bg-white p-2 shadow-lg"
        >
          <Menu className="text-ylang-charcoal h-6 w-6" />
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
            className={`border-ylang-beige flex items-center border-b ${
              sidebarOpen ? "p-6" : "justify-center p-4"
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
                <span className="font-display text-ylang-charcoal font-bold">
                  Ylang Admin
                </span>
              )}
            </Link>
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
                      ? "bg-ylang-rose text-white shadow-lg"
                      : "text-ylang-charcoal/70 hover:bg-ylang-beige hover:text-ylang-charcoal"
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
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`text-ylang-charcoal/70 hover:bg-ylang-beige hidden w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors lg:flex ${
                sidebarOpen ? "justify-start" : "justify-center"
              }`}
            >
              <ChevronLeft
                className={`h-5 w-5 transition-transform ${
                  !sidebarOpen && "rotate-180"
                }`}
              />
              {sidebarOpen && <span className="font-medium">Réduire</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50 ${
                sidebarOpen ? "justify-start" : "justify-center"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">Déconnexion</span>}
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
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
