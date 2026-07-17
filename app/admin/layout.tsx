"use client";

import { SidebarToggle } from "@/components/admin/sidebar-toggle";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Commandes", href: "/admin/orders", icon: ShoppingBag },
  { name: "Produits", href: "/admin/products", icon: Package },
  { name: "Configurateur", href: "/admin/configurator", icon: Palette },
  { name: "Clients", href: "/admin/users", icon: Users },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { push } = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    push("/");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-paper)" }}>
      {/* Mobile top bar */}
      <div
        className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{
          background: "var(--color-ink)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo/logo-2.png" alt="Ylang" width={28} height={28} />
          <span
            className="font-body text-sm font-medium"
            style={{ color: "var(--color-paper)" }}
          >
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
          style={{ color: "var(--color-paper)" }}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-[width,transform] duration-300 ${
          sidebarOpen ? "w-60" : "w-16"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "var(--color-ink)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 transition-[padding] duration-300 ${
            sidebarOpen ? "px-5 py-5" : "flex-col justify-center px-3 py-5"
          }`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo/logo-2.png"
              alt="Ylang"
              width={32}
              height={32}
              className="shrink-0"
            />
            {sidebarOpen && (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-paper)",
                  whiteSpace: "nowrap",
                }}
              >
                Ylang Admin
              </span>
            )}
          </Link>
          {sidebarOpen && (
            <div className="ml-auto">
              <SidebarToggle
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>
          )}
          {!sidebarOpen && (
            <SidebarToggle
              isOpen={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-body flex items-center gap-3 px-3 py-2.5 text-sm transition-opacity duration-150 ${
                  sidebarOpen ? "justify-start" : "justify-center"
                }`}
                style={{
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-paper)",
                  opacity: isActive ? 1 : 0.5,
                  borderLeft: isActive
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
                  background: isActive
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = "0.5";
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer nav */}
        <div
          className="space-y-0.5 px-2 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link
            href="/admin/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`font-body flex items-center gap-3 px-3 py-2.5 text-sm transition-opacity duration-150 ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
            style={{
              color:
                pathname === "/admin/settings"
                  ? "var(--color-accent)"
                  : "var(--color-paper)",
              opacity: pathname === "/admin/settings" ? 1 : 0.5,
              borderLeft:
                pathname === "/admin/settings"
                  ? "2px solid var(--color-accent)"
                  : "2px solid transparent",
              background:
                pathname === "/admin/settings"
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/admin/settings")
                e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/admin/settings")
                e.currentTarget.style.opacity = "0.5";
            }}
          >
            <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {sidebarOpen && <span>Paramètres</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`font-body flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-opacity hover:opacity-100 ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
            style={{ color: "var(--color-paper)", opacity: 0.35 }}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`transition-[margin-left] duration-300 ${sidebarOpen ? "lg:ml-60" : "lg:ml-16"}`}
      >
        <div className="px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
