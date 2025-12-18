"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Mail,
  Plus,
  Save,
  Shield,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const tabs = [
    { id: "store", label: "Boutique", icon: Store },
    { id: "email", label: "Emails", icon: Mail },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "media", label: "Médias", icon: ImageIcon },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  // Settings State
  const [settings, setSettings] = useState({
    storeName: "Ylang Créations",
    storeDescription: "Créations artisanales pour bébés et enfants",
    contactEmail: "contact@ylang-creations.fr",
    contactPhone: "+33 1 23 45 67 89",
    shippingEmail: "commandes@ylang-creations.fr",
    adminEmail: "ylang.creations@gmail.com",
    emailTemplates: {
      orderConfirmation: true,
      shippingNotification: true,
      adminNotification: true,
    },
    currency: "eur",
    shippingFee: "9.90",
    freeShippingThreshold: "150",
    notifications: {
      newOrder: true,
      lowStock: true,
      newCustomer: false,
      dailySummary: false,
    },
    heroSlides: [] as {
      id: string;
      title: string;
      subtitle: string;
      image: string;
      link: string;
      cta: string;
    }[],
    craftsmanshipImage: "",
    aboutImage: "",
    testimonials: [] as {
      id: string;
      name: string;
      location: string;
      rating: number;
      text: string;
      product: string;
      image: string;
      date: string;
    }[],
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    new: "",
    confirm: "",
    general: "",
  });

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 5000);
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      showToast("Paramètres mis à jour avec succès", "success");
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la sauvegarde des paramètres", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({ current: "", new: "", confirm: "", general: "" });

    if (!passwords.new) {
      setPasswordErrors((prev) => ({
        ...prev,
        new: "Le nouveau mot de passe est requis",
      }));
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordErrors((prev) => ({
        ...prev,
        new: "Le mot de passe doit contenir au moins 6 caractères",
      }));
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirm: "Les mots de passe ne correspondent pas",
      }));
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      showToast("Mot de passe mis à jour avec succès", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.message || "Erreur lors du changement de mot de passe";
      setPasswordErrors((prev) => ({ ...prev, general: errorMessage }));
      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    field: string,
    file: File,
    slideId?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", `settings/${Date.now()}-${file.name}`);

    try {
      const res = await fetch("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        if (slideId) {
          setSettings((prev) => ({
            ...prev,
            heroSlides: prev.heroSlides.map((s) =>
              s.id === slideId ? { ...s, image: data.url } : s,
            ),
          }));
        } else {
          handleSettingsChange(field, data.url);
        }
        showToast("Image téléchargée avec succès", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors du téléchargement de l'image", "error");
    }
  };

  const addHeroSlide = () => {
    const newSlide = {
      id: crypto.randomUUID(),
      title: "Nouveau Slide",
      subtitle: "Description du slide",
      image: "",
      link: "/",
      cta: "Découvrir",
    };
    setSettings((prev: any) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
  };

  const removeHeroSlide = (id: string) => {
    setSettings((prev: any) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s: any) => s.id !== id),
    }));
  };

  const updateHeroSlide = (id: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s: any) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: crypto.randomUUID(),
      name: "Nouveau Client",
      location: "Ville",
      rating: 5,
      text: "Un super témoignage...",
      product: "Produit acheté",
      image: "",
      date: "Aujourd'hui",
    };
    setSettings((prev: any) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }));
  };

  const removeTestimonial = (id: string) => {
    setSettings((prev: any) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t: any) => t.id !== id),
    }));
  };

  const updateTestimonial = (id: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      testimonials: prev.testimonials.map((t: any) =>
        t.id === id ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const handleTestimonialImageUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", `settings/testimonials/${Date.now()}-${file.name}`);

    try {
      const res = await fetch("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        updateTestimonial(id, "image", data.url);
        showToast("Image téléchargée avec succès", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors du téléchargement de l'image", "error");
    }
  };

  useEffect(() => {
    // Fetch settings on mount
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="animate-in slide-in-from-top-5 fixed top-4 right-4 z-50 duration-300"
          role="alert"
        >
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border border-red-200 bg-red-50"
                : "border border-green-200 bg-green-50"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            <p
              className={`text-sm font-medium ${
                toast.type === "error" ? "text-red-800" : "text-green-800"
              }`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
          Paramètres
        </h1>
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
          <div className="border-ylang-beige rounded-2xl border bg-white p-6">
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
                  Informations de la boutique
                </h2>

                <div className="space-y-6">
                  <Input
                    label="Nom de la boutique"
                    value={settings.storeName}
                    onChange={(e) =>
                      handleSettingsChange("storeName", e.target.value)
                    }
                  />

                  <div className="group relative w-full">
                    <label className="font-body text-ylang-charcoal/60 group-focus-within:text-ylang-rose absolute -top-2.5 left-3 bg-white px-2 text-xs tracking-wide uppercase transition-all duration-300 group-focus-within:font-medium">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.storeDescription}
                      onChange={(e) =>
                        handleSettingsChange("storeDescription", e.target.value)
                      }
                      className="border-ylang-beige font-body text-ylang-charcoal placeholder:text-ylang-charcoal/40 focus:border-ylang-rose hover:border-ylang-terracotta/50 flex w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(183,110,121,0.1)] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Email de contact"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        handleSettingsChange("contactEmail", e.target.value)
                      }
                    />
                    <Input
                      label="Téléphone"
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) =>
                        handleSettingsChange("contactPhone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
                  Configuration des emails
                </h2>

                <div className="space-y-6">
                  <div>
                    <Input
                      label="Email d'expédition"
                      type="email"
                      value={settings.shippingEmail}
                      onChange={(e) =>
                        handleSettingsChange("shippingEmail", e.target.value)
                      }
                    />
                    <p className="text-ylang-charcoal/60 mt-1 text-xs">
                      Les emails de confirmation seront envoyés depuis cette
                      adresse
                    </p>
                  </div>

                  <Input
                    label="Email admin pour les notifications"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      handleSettingsChange("adminEmail", e.target.value)
                    }
                  />

                  <div className="border-ylang-beige border-t pt-4">
                    <h3 className="text-ylang-charcoal mb-4 font-semibold">
                      Templates d&apos;emails
                    </h3>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.emailTemplates.orderConfirmation}
                          onChange={(e) =>
                            handleNestedChange(
                              "emailTemplates",
                              "orderConfirmation",
                              e.target.checked,
                            )
                          }
                          className="accent-ylang-rose h-5 w-5 rounded"
                        />
                        <span className="text-ylang-charcoal text-sm">
                          Confirmation de commande
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.emailTemplates.shippingNotification}
                          onChange={(e) =>
                            handleNestedChange(
                              "emailTemplates",
                              "shippingNotification",
                              e.target.checked,
                            )
                          }
                          className="accent-ylang-rose h-5 w-5 rounded"
                        />
                        <span className="text-ylang-charcoal text-sm">
                          Notification d&apos;expédition
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.emailTemplates.adminNotification}
                          onChange={(e) =>
                            handleNestedChange(
                              "emailTemplates",
                              "adminNotification",
                              e.target.checked,
                            )
                          }
                          className="accent-ylang-rose h-5 w-5 rounded"
                        />
                        <span className="text-ylang-charcoal text-sm">
                          Notification admin nouvelle commande
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
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

                <div className="space-y-6">
                  <div className="group relative w-full">
                    <label className="font-body text-ylang-charcoal/60 group-focus-within:text-ylang-rose absolute -top-2.5 left-3 bg-white px-2 text-xs tracking-wide uppercase transition-all duration-300 group-focus-within:font-medium">
                      Devise par défaut
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        handleSettingsChange("currency", e.target.value)
                      }
                      className="border-ylang-beige font-body text-ylang-charcoal focus:border-ylang-rose hover:border-ylang-terracotta/50 flex h-11 w-full rounded-lg border bg-white px-4 text-sm transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(183,110,121,0.1)] focus:outline-none"
                    >
                      <option value="eur">EUR (€)</option>
                      <option value="usd">USD ($)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <Input
                        label="Frais de livraison"
                        type="number"
                        value={settings.shippingFee}
                        onChange={(e) =>
                          handleSettingsChange("shippingFee", e.target.value)
                        }
                      />
                      <span className="text-ylang-charcoal/60 absolute top-1/2 right-4 -translate-y-1/2">
                        €
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        label="Seuil livraison gratuite"
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) =>
                          handleSettingsChange(
                            "freeShippingThreshold",
                            e.target.value,
                          )
                        }
                      />
                      <span className="text-ylang-charcoal/60 absolute top-1/2 right-4 -translate-y-1/2">
                        €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
                  Notifications
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: "newOrder",
                      label: "Nouvelle commande",
                      desc: "Recevoir un email à chaque nouvelle commande",
                    },
                    {
                      id: "lowStock",
                      label: "Stock faible",
                      desc: "Alerte quand un produit a moins de 5 unités",
                    },
                    {
                      id: "newCustomer",
                      label: "Nouveau client",
                      desc: "Notification à chaque nouvelle inscription",
                    },
                    {
                      id: "dailySummary",
                      label: "Récapitulatif quotidien",
                      desc: "Résumé des ventes chaque jour à 9h",
                    },
                  ].map((notif) => (
                    <label
                      key={notif.id}
                      className="bg-ylang-cream hover:bg-ylang-beige flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors"
                    >
                      <div>
                        <p className="text-ylang-charcoal font-medium">
                          {notif.label}
                        </p>
                        <p className="text-ylang-charcoal/60 text-sm">
                          {notif.desc}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={(settings.notifications as any)[notif.id]}
                        onChange={(e) =>
                          handleNestedChange(
                            "notifications",
                            notif.id,
                            e.target.checked,
                          )
                        }
                        className="accent-ylang-rose h-5 w-5 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-12">
                <div>
                  <h2 className="text-ylang-charcoal mb-6 text-xl font-bold">
                    Médias du site
                  </h2>

                  {/* Hero Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-ylang-charcoal text-lg font-semibold">
                        Hero Section (Bandeau d'accueil)
                      </h3>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={addHeroSlide}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un slide
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      {settings.heroSlides.map((slide, index) => (
                        <div
                          key={slide.id}
                          className="border-ylang-beige space-y-4 rounded-xl border p-6"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-ylang-charcoal/60 text-sm font-medium">
                              Slide #{index + 1}
                            </span>
                            <button
                              onClick={() => removeHeroSlide(slide.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-4">
                              <Input
                                label="Titre"
                                value={slide.title}
                                onChange={(e) =>
                                  updateHeroSlide(
                                    slide.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                              <Input
                                label="Sous-titre"
                                value={slide.subtitle}
                                onChange={(e) =>
                                  updateHeroSlide(
                                    slide.id,
                                    "subtitle",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  label="Lien CTA"
                                  value={slide.link}
                                  onChange={(e) =>
                                    updateHeroSlide(
                                      slide.id,
                                      "link",
                                      e.target.value,
                                    )
                                  }
                                />
                                <Input
                                  label="Texte CTA"
                                  value={slide.cta}
                                  onChange={(e) =>
                                    updateHeroSlide(
                                      slide.id,
                                      "cta",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="border-ylang-beige bg-ylang-cream relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
                              {slide.image ? (
                                <>
                                  <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                    <label className="text-ylang-charcoal cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium">
                                      Modifier l'image
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) =>
                                          e.target.files?.[0] &&
                                          handleImageUpload(
                                            "heroSlides",
                                            e.target.files[0],
                                            slide.id,
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                </>
                              ) : (
                                <label className="text-ylang-charcoal/40 hover:text-ylang-rose flex cursor-pointer flex-col items-center gap-2 transition-colors">
                                  <ImageIcon className="h-8 w-8" />
                                  <span className="text-sm">
                                    Ajouter une image
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      e.target.files?.[0] &&
                                      handleImageUpload(
                                        "heroSlides",
                                        e.target.files[0],
                                        slide.id,
                                      )
                                    }
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonials Section */}
                  <div className="border-ylang-beige mt-12 space-y-6 border-t pt-12">
                    <div className="flex items-center justify-between">
                      <h3 className="text-ylang-charcoal text-lg font-semibold">
                        Témoignages Clients
                      </h3>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={addTestimonial}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un témoignage
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      {settings.testimonials.map((testimonial, index) => (
                        <div
                          key={testimonial.id}
                          className="border-ylang-beige space-y-4 rounded-xl border p-6"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-ylang-charcoal/60 text-sm font-medium">
                              Témoignage #{index + 1}
                            </span>
                            <button
                              onClick={() => removeTestimonial(testimonial.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-3">
                            <div className="space-y-4 lg:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  label="Nom du client"
                                  value={testimonial.name}
                                  onChange={(e) =>
                                    updateTestimonial(
                                      testimonial.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                                <Input
                                  label="Localisation (ex: Paris)"
                                  value={testimonial.location}
                                  onChange={(e) =>
                                    updateTestimonial(
                                      testimonial.id,
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  label="Note (1-5)"
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={testimonial.rating}
                                  onChange={(e) =>
                                    updateTestimonial(
                                      testimonial.id,
                                      "rating",
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                                <Input
                                  label="Date du témoignage"
                                  value={testimonial.date}
                                  onChange={(e) =>
                                    updateTestimonial(
                                      testimonial.id,
                                      "date",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <Input
                                label="Produit acheté"
                                value={testimonial.product}
                                onChange={(e) =>
                                  updateTestimonial(
                                    testimonial.id,
                                    "product",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="space-y-1">
                                <label className="text-ylang-charcoal/60 px-1 text-xs font-medium">
                                  Témoignage (Texte)
                                </label>
                                <textarea
                                  className="border-ylang-beige focus:border-ylang-rose focus:ring-ylang-rose w-full rounded-xl border px-4 py-3 text-sm"
                                  rows={3}
                                  value={testimonial.text}
                                  onChange={(e) =>
                                    updateTestimonial(
                                      testimonial.id,
                                      "text",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                              <div className="border-ylang-beige bg-ylang-cream relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border">
                                {testimonial.image ? (
                                  <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="from-ylang-rose to-ylang-terracotta flex h-full w-full items-center justify-center bg-linear-to-br text-3xl font-bold text-white">
                                    {testimonial.name?.charAt(0) || "U"}
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                  <label className="cursor-pointer p-2 text-white">
                                    <ImageIcon className="h-6 w-6" />
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        e.target.files?.[0] &&
                                        handleTestimonialImageUpload(
                                          testimonial.id,
                                          e.target.files[0],
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                              <p className="text-ylang-charcoal/40 px-4 text-center text-xs">
                                Avatar client (optionnel, les initiales seront
                                utilisées par défaut)
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Craftsmanship Section */}

                  <div className="border-ylang-beige mt-12 space-y-6 border-t pt-12">
                    <h3 className="text-ylang-charcoal text-lg font-semibold">
                      Section Artisanat (Atelier)
                    </h3>
                    <div className="grid items-center gap-6 lg:grid-cols-2">
                      <div>
                        <p className="text-ylang-charcoal/60 mb-4 text-sm">
                          Cette image s'affiche dans la section "Un savoir-faire
                          d'exception" sur la page d'accueil.
                        </p>
                        <label className="bg-ylang-rose hover:bg-ylang-terracotta inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-white transition-colors">
                          <ImageIcon className="h-5 w-5" />
                          <span>Choisir une image</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageUpload(
                                "craftsmanshipImage",
                                e.target.files[0],
                              )
                            }
                          />
                        </label>
                      </div>
                      <div className="border-ylang-beige bg-ylang-cream flex aspect-video items-center justify-center overflow-hidden rounded-xl border">
                        {settings.craftsmanshipImage ? (
                          <img
                            src={settings.craftsmanshipImage}
                            alt="Atelier"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="text-ylang-charcoal/20 h-12 w-12" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="border-ylang-beige mt-12 space-y-6 border-t pt-12">
                    <h3 className="text-ylang-charcoal text-lg font-semibold">
                      Page À Propos (Fondatrice)
                    </h3>
                    <div className="grid items-center gap-6 lg:grid-cols-2">
                      <div>
                        <p className="text-ylang-charcoal/60 mb-4 text-sm">
                          Cette image illustre l'histoire de la marque sur la
                          page "À Propos".
                        </p>
                        <label className="bg-ylang-rose hover:bg-ylang-terracotta inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-white transition-colors">
                          <ImageIcon className="h-5 w-5" />
                          <span>Modifier la photo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageUpload("aboutImage", e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                      <div className="border-ylang-beige bg-ylang-cream flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl border">
                        {settings.aboutImage ? (
                          <img
                            src={settings.aboutImage}
                            alt="Fondatrice"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="text-ylang-charcoal/20 h-12 w-12" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
                  Sécurité
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="bg-ylang-cream rounded-xl p-6">
                    <h3 className="text-ylang-charcoal mb-6 font-medium">
                      Changer le mot de passe admin
                    </h3>

                    {passwordErrors.general && (
                      <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <p className="text-sm text-red-800">
                          {passwordErrors.general}
                        </p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="relative">
                        <Input
                          label="Nouveau mot de passe"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, new: e.target.value }))
                          }
                          error={passwordErrors.new}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((s) => ({ ...s, new: !s.new }))
                          }
                          className="text-ylang-charcoal/40 hover:text-ylang-rose absolute top-2.5 right-3 transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="Confirmer le nouveau mot de passe"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords((p) => ({
                              ...p,
                              confirm: e.target.value,
                            }))
                          }
                          error={passwordErrors.confirm}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((s) => ({
                              ...s,
                              confirm: !s.confirm,
                            }))
                          }
                          className="text-ylang-charcoal/40 hover:text-ylang-rose absolute top-2.5 right-3 transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="luxury"
                          disabled={isSaving}
                        >
                          {isSaving && activeTab === "security" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Mettre à jour le mot de passe"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
                  <h3 className="mb-2 font-medium text-orange-800">
                    Zone dangereuse
                  </h3>
                  <p className="mb-4 text-sm text-orange-700">
                    Ces actions sont irréversibles. Procédez avec précaution.
                  </p>
                  <Button
                    variant="link"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      if (
                        confirm(
                          "Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.",
                        )
                      ) {
                        showToast(
                          "Action non implémentée pour la sécurité",
                          "error",
                        );
                      }
                    }}
                  >
                    Réinitialiser toutes les données
                  </Button>
                </div>
              </div>
            )}

            {/* Save button (hidden for security tab as it has its own) */}
            {activeTab !== "security" && (
              <div className="border-ylang-beige mt-8 flex justify-end border-t pt-6">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
