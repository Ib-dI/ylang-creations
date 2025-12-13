"use client";

import { Button } from "@/components/ui/button";
import {
  Bell,
  CreditCard,
  Loader2,
  Mail,
  Save,
  Shield,
  Store,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "store", label: "Boutique", icon: Store },
    { id: "email", label: "Emails", icon: Mail },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-ylang-charcoal">Paramètres</h1>
        <p className="text-ylang-charcoal/60">
          Configurez les paramètres de votre boutique
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-ylang-rose text-white"
                    : "text-ylang-charcoal/70 hover:bg-ylang-beige"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-ylang-beige bg-white p-6">
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-bold text-ylang-charcoal">
                  Informations de la boutique
                </h2>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    defaultValue="Ylang Créations"
                    className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Créations artisanales pour bébés et enfants"
                    className="w-full resize-none rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@ylang-creations.fr"
                      className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Adresse
                  </label>
                  <input
                    type="text"
                    placeholder="Adresse de votre atelier"
                    className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-bold text-ylang-charcoal">
                  Configuration des emails
                </h2>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Email d&apos;expédition
                  </label>
                  <input
                    type="email"
                    defaultValue="commandes@ylang-creations.fr"
                    className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-ylang-charcoal/60">
                    Les emails de confirmation seront envoyés depuis cette
                    adresse
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Email admin pour les notifications
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@ylang-creations.fr"
                    className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                  />
                </div>

                <div className="border-t border-ylang-beige pt-4">
                  <h3 className="mb-4 font-semibold text-ylang-charcoal">
                    Templates d&apos;emails
                  </h3>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5 rounded"
                      />
                      <span className="text-sm text-ylang-charcoal">
                        Confirmation de commande
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5 rounded"
                      />
                      <span className="text-sm text-ylang-charcoal">
                        Notification d&apos;expédition
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5 rounded"
                      />
                      <span className="text-sm text-ylang-charcoal">
                        Notification admin nouvelle commande
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-bold text-ylang-charcoal">
                  Configuration Stripe
                </h2>

                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Stripe est configuré</span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    Les paiements sont actifs et fonctionnels
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Devise par défaut
                  </label>
                  <select className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none">
                    <option value="eur">EUR (€)</option>
                    <option value="usd">USD ($)</option>
                    <option value="gbp">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Frais de livraison par défaut
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="9.90"
                      step="0.01"
                      className="w-32 rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                    <span className="text-ylang-charcoal/60">€</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ylang-charcoal">
                    Seuil de livraison gratuite
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="100"
                      step="1"
                      className="w-32 rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                    <span className="text-ylang-charcoal/60">€</span>
                  </div>
                  <p className="mt-1 text-xs text-ylang-charcoal/60">
                    Livraison gratuite à partir de ce montant
                  </p>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-bold text-ylang-charcoal">
                  Notifications
                </h2>

                <div className="space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-ylang-cream p-4">
                    <div>
                      <p className="font-medium text-ylang-charcoal">
                        Nouvelle commande
                      </p>
                      <p className="text-sm text-ylang-charcoal/60">
                        Recevoir un email à chaque nouvelle commande
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 rounded"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-ylang-cream p-4">
                    <div>
                      <p className="font-medium text-ylang-charcoal">Stock faible</p>
                      <p className="text-sm text-ylang-charcoal/60">
                        Alerte quand un produit a moins de 5 unités
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 rounded"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-ylang-cream p-4">
                    <div>
                      <p className="font-medium text-ylang-charcoal">
                        Nouveau client
                      </p>
                      <p className="text-sm text-ylang-charcoal/60">
                        Notification à chaque nouvelle inscription
                      </p>
                    </div>
                    <input type="checkbox" className="h-5 w-5 rounded" />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl bg-ylang-cream p-4">
                    <div>
                      <p className="font-medium text-ylang-charcoal">
                        Récapitulatif quotidien
                      </p>
                      <p className="text-sm text-ylang-charcoal/60">
                        Résumé des ventes chaque jour à 9h
                      </p>
                    </div>
                    <input type="checkbox" className="h-5 w-5 rounded" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="mb-4 text-xl font-bold text-ylang-charcoal">
                  Sécurité
                </h2>

                <div className="rounded-xl bg-ylang-cream p-4">
                  <h3 className="mb-2 font-medium text-ylang-charcoal">
                    Changer le mot de passe admin
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Mot de passe actuel"
                      className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirmer le nouveau mot de passe"
                      className="w-full rounded-xl border border-ylang-beige px-4 py-3 focus:ring-2 focus:ring-ylang-rose/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h3 className="mb-2 font-medium text-orange-800">
                    Zone dangereuse
                  </h3>
                  <p className="mb-3 text-sm text-orange-700">
                    Ces actions sont irréversibles. Procédez avec précaution.
                  </p>
                  <Button
                    variant="secondary"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Réinitialiser toutes les données
                  </Button>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 flex justify-end border-t border-ylang-beige pt-6">
              <Button
                variant="luxury"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
