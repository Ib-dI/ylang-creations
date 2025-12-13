"use client";

import { authClient } from "@/lib/auth-client";
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-ylang-cream to-ylang-beige">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-ylang-beige bg-white p-2 shadow-lg"
        >
          <Menu className="h-6 w-6 text-ylang-charcoal" />
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
        <div className="flex h-full flex-col border-r border-ylang-beige bg-white">
          {/* Logo */}
          <div className="border-b border-ylang-beige p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-ylang-rose to-ylang-terracotta">
                <span className="text-lg font-bold text-white">Y</span>
              </div>
              {sidebarOpen && (
                <span className="font-display font-bold text-ylang-charcoal">
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
                  className={`flex items-center justify-center md:justify-start gap-3 rounded-xl px-4 py-3 transition-all ${
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
          <div className="space-y-2 border-t border-ylang-beige p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden w-full items-center gap-3 rounded-xl px-4 py-3 text-ylang-charcoal/70 transition-colors hover:bg-ylang-beige lg:flex"
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
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
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
