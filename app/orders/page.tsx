import { Button } from "@/components/ui/button";
import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { desc, eq, type InferSelectModel } from "drizzle-orm";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// Types based on the schema and checkout actions
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  configuration?: {
    fabricName: string;
    embroidery?: string;
    accessories?: string[];
  };
}

export const metadata = {
  title: "Mes Commandes | Ylang Créations",
  description: "Consultez l'historique de vos commandes chez Ylang Créations.",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/orders");
  }

  // Get customer record
  const customerRecord = await db
    .select()
    .from(customer)
    .where(eq(customer.userId, user.id))
    .limit(1);

  let orders: InferSelectModel<typeof order>[] = [];

  if (customerRecord.length > 0) {
    // Get orders for this customer
    orders = await db
      .select()
      .from(order)
      .where(eq(order.customerId, customerRecord[0].id))
      .orderBy(desc(order.createdAt));
  }

  return (
    <div className="from-ylang-terracotta/50 to-ylang-terracotta/30 min-h-screen bg-linear-to-br pt-24 pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-ylang-charcoal/60 hover:text-ylang-charcoal mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>
          <h1 className="font-display text-ylang-charcoal text-4xl font-bold">
            Mes Commandes
          </h1>
          <p className="text-ylang-charcoal/60 mt-2">
            Retrouvez ici l'historique de tous vos achats chez Ylang Créations.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="border-ylang-beige flex flex-col items-center justify-center rounded-2xl border bg-white/50 p-12 text-center backdrop-blur-sm">
            <div className="bg-ylang-cream mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <Package className="text-ylang-charcoal/30 h-10 w-10" />
            </div>
            <h2 className="text-ylang-charcoal mb-2 text-xl font-semibold">
              Vous n'avez pas encore passé de commande
            </h2>
            <p className="text-ylang-charcoal/60 mb-8 max-w-md">
              Dès que vous aurez passé votre première commande, elle apparaîtra
              ici avec tous les détails de son suivi.
            </p>
            <Button variant="luxury" asChild>
              <Link href="/collections">Découvrir nos créations</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = (order.items as unknown as OrderItem[]) ?? [];
              const date = new Date(order.createdAt).toLocaleDateString(
                "fr-FR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={order.id}
                  className="border-ylang-beige overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="border-ylang-beige bg-ylang-cream/50 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
                    <div className="flex flex-wrap gap-4 sm:gap-8">
                      <div>
                        <p className="text-ylang-charcoal/50 text-xs font-medium tracking-wider uppercase">
                          Commande effectuée le
                        </p>
                        <div className="text-ylang-charcoal flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4 opacity-50" />
                          {date}
                        </div>
                      </div>
                      <div>
                        <p className="text-ylang-charcoal/50 text-xs font-medium tracking-wider uppercase">
                          Montant total
                        </p>
                        <p className="text-ylang-rose font-bold">
                          {(order.totalAmount / 100).toFixed(2)}€
                        </p>
                      </div>
                      <div>
                        <p className="text-ylang-charcoal/50 text-xs font-medium tracking-wider uppercase">
                          Statut
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            order.status === "paid"
                              ? "border border-green-200 bg-green-100 text-green-600"
                              : order.status === "shipped"
                                ? "border border-blue-200 bg-blue-100 text-blue-600"
                                : order.status === "delivered"
                                  ? "border border-purple-200 bg-purple-100 text-purple-600"
                                  : order.status === "in_production"
                                    ? "border border-orange-200 bg-orange-100 text-orange-600"
                                    : "border border-gray-200 bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status === "paid"
                            ? "Payée"
                            : order.status === "shipped"
                              ? "Expédiée"
                              : order.status === "delivered"
                                ? "Livrée"
                                : order.status === "in_production"
                                  ? "En production"
                                  : order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      N° {order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {items.map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex items-center gap-4"
                        >
                          <div className="border-ylang-beige bg-ylang-cream relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="text-ylang-charcoal/20 h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-ylang-charcoal truncate font-semibold">
                              {item.name}
                            </h4>
                            <p className="text-ylang-charcoal/60 text-sm">
                              Quantité : {item.quantity} •{" "}
                              {item.price.toFixed(2)}€
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/collections`}>
                                Commander à nouveau
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-ylang-beige mt-6 flex items-center justify-between border-t pt-6">
                      <div className="text-sm">
                        {order.trackingNumber && (
                          <p className="text-ylang-charcoal/60">
                            Numéro de suivi :{" "}
                            <span className="text-ylang-charcoal font-medium">
                              {order.trackingNumber}
                            </span>
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/collections`}
                        className="text-ylang-rose hover:text-ylang-rose/80 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        Voir les nouveautés
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
