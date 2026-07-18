"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteAdminImage, uploadAdminImage } from "@/lib/admin/image-storage";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Info,
  Loader2,
  Mail,
  Package,
  Plus,
  Save,
  Shield,
  Store,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  link: string;
  cta: string;
}

export interface Testimonial {
  id: string;
  image: string | null;
}

export interface EmailTemplates {
  orderConfirmation: boolean;
  shippingNotification: boolean;
  adminNotification: boolean;
}

export interface Notifications {
  newOrder: boolean;
  lowStock: boolean;
  newCustomer: boolean;
  dailySummary: boolean;
}

export interface SettingsState {
  id: string;
  storeName: string | null;
  storeDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  shippingEmail: string | null;
  adminEmail: string | null;
  emailTemplates: EmailTemplates;
  currency: string | null;
  shippingFee: string | null;
  freeShippingThreshold: string | null;
  notifications: Notifications;
  heroSlides: HeroSlide[];
  craftsmanshipImage: string | null;
  aboutImage: string | null;
  testimonials: Testimonial[];
}

export function SettingsClient({
  initialSettings,
}: {
  initialSettings: Partial<SettingsState> | null;
}) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetProducts, setResetProducts] = useState(false);

  const tabs = [
    { id: "store", label: "Boutique", icon: Store },
    { id: "email", label: "Emails", icon: Mail },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "media", label: "Médias", icon: ImageIcon },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  const pendingUploads = useRef(new Map<string, File>());

  const [settings, setSettings] = useState<SettingsState>({
    storeName: "Ylang Créations",
    storeDescription:
      "Allier élégance, raffinement et personnalisation. Ylang Créations vous propose des services premium de confection textile, de décoration d'intérieur et d'aménagement personnalisés.",
    contactEmail: "contact@ylang-creations.fr",
    contactPhone: "",
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
    heroSlides: [],
    craftsmanshipImage: "",
    aboutImage: "",
    testimonials: [],
    ...(initialSettings || {}),
  } as SettingsState);

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
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  const handleSettingsChange = (field: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = <K extends keyof SettingsState>(
    parent: K,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as object), [field]: value },
    }));
  };

  const initialImages = useRef<Set<string>>(new Set());

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentImages = new Set<string>();
      settings.heroSlides.forEach((s) => {
        if (s.image && !s.image.startsWith("blob:")) currentImages.add(s.image);
      });
      settings.testimonials.forEach((t) => {
        if (t.image && !t.image.startsWith("blob:")) currentImages.add(t.image);
      });
      if (
        settings.craftsmanshipImage &&
        !settings.craftsmanshipImage.startsWith("blob:")
      )
        currentImages.add(settings.craftsmanshipImage);
      if (settings.aboutImage && !settings.aboutImage.startsWith("blob:"))
        currentImages.add(settings.aboutImage);

      const imagesToDelete = Array.from(initialImages.current).filter(
        (url) => !currentImages.has(url),
      );
      await Promise.all(imagesToDelete.map((url) => deleteAdminImage(url)));

      const processImage = async (
        imageUrl: string | null,
        area: "hero" | "testimonials" | "craftsmanship" | "about",
      ) => {
        if (imageUrl && imageUrl.startsWith("blob:")) {
          const file = pendingUploads.current.get(imageUrl);
          if (file) {
            const { url } = await uploadAdminImage(file, {
              scope: "settings",
              area,
            });
            return url;
          }
        }
        return imageUrl;
      };

      let updatedSettings = { ...settings };
      updatedSettings.heroSlides = await Promise.all(
        settings.heroSlides.map(async (slide) => ({
          ...slide,
          image: await processImage(slide.image, "hero"),
        })),
      );
      updatedSettings.testimonials = await Promise.all(
        settings.testimonials.map(async (t) => ({
          ...t,
          image: await processImage(t.image, "testimonials"),
        })),
      );
      updatedSettings.craftsmanshipImage = await processImage(
        settings.craftsmanshipImage,
        "craftsmanship",
      );
      updatedSettings.aboutImage = await processImage(
        settings.aboutImage,
        "about",
      );

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      setSettings(updatedSettings);
      const newInitialImages = new Set<string>();
      updatedSettings.heroSlides.forEach(
        (s) => s.image && newInitialImages.add(s.image),
      );
      updatedSettings.testimonials.forEach(
        (t) => t.image && newInitialImages.add(t.image),
      );
      if (updatedSettings.craftsmanshipImage)
        newInitialImages.add(updatedSettings.craftsmanshipImage);
      if (updatedSettings.aboutImage)
        newInitialImages.add(updatedSettings.aboutImage);
      initialImages.current = newInitialImages;
      pendingUploads.current.clear();
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
      const errorMessage =
        error.message || "Erreur lors du changement de mot de passe";
      setPasswordErrors((prev) => ({ ...prev, general: errorMessage }));
      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openResetDialog = () => {
    setResetStep(1);
    setResetProducts(false);
    setShowResetDialog(true);
  };
  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetStep(1);
    setResetProducts(false);
  };

  const handleResetData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetProducts }),
      });
      if (!response.ok) throw new Error("Erreur lors de la réinitialisation");
      showToast("Toutes les données ont été réinitialisées", "success");
      closeResetDialog();
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la réinitialisation des données", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (
    field: keyof SettingsState,
    file: File,
    itemId?: string,
  ) => {
    const previewUrl = URL.createObjectURL(file);
    pendingUploads.current.set(previewUrl, file);
    if (itemId) {
      if (field === "heroSlides") {
        setSettings((prev) => ({
          ...prev,
          heroSlides: prev.heroSlides.map((s) =>
            s.id === itemId ? { ...s, image: previewUrl } : s,
          ),
        }));
      } else if (field === "testimonials") {
        updateTestimonial(itemId, "image", previewUrl);
      }
    } else {
      handleSettingsChange(field, previewUrl);
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
    setSettings((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
  };

  const removeHeroSlide = (id: string) =>
    setSettings((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
  const updateHeroSlide = (
    id: string,
    field: keyof HeroSlide,
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const addTestimonial = () => {
    setSettings((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: crypto.randomUUID(), image: "" },
      ],
    }));
  };
  const removeTestimonial = (id: string) =>
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  const updateTestimonial = (
    id: string,
    field: keyof Testimonial,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === id ? { ...t, [field]: value } : t,
      ),
    }));
  };

  useEffect(() => {
    if (initialSettings) {
      const images = new Set<string>();
      initialSettings.heroSlides?.forEach(
        (s) => s.image && images.add(s.image),
      );
      initialSettings.testimonials?.forEach(
        (t) => t.image && images.add(t.image),
      );
      if (initialSettings.craftsmanshipImage)
        images.add(initialSettings.craftsmanshipImage);
      if (initialSettings.aboutImage) images.add(initialSettings.aboutImage);
      initialImages.current = images;
    }

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
          filter: "id=eq.main-settings",
        },
        (payload) => {
          const newData = payload.new as Record<string, any>;
          const parsedData = {
            ...newData,
            emailTemplates:
              typeof newData.email_templates === "string"
                ? JSON.parse(newData.email_templates)
                : (newData.email_templates ?? newData.emailTemplates),
            notifications:
              typeof newData.notifications === "string"
                ? JSON.parse(newData.notifications)
                : newData.notifications,
            heroSlides:
              typeof newData.hero_slides === "string"
                ? JSON.parse(newData.hero_slides)
                : (newData.hero_slides ?? newData.heroSlides),
            testimonials:
              typeof newData.testimonials === "string"
                ? JSON.parse(newData.testimonials)
                : newData.testimonials,
            storeName: newData.store_name,
            storeDescription: newData.store_description,
            contactEmail: newData.contact_email,
            contactPhone: newData.contact_phone,
            shippingEmail: newData.shipping_email,
            adminEmail: newData.admin_email,
            shippingFee:
              typeof newData.shipping_fee === "number"
                ? String(newData.shipping_fee / 100)
                : newData.shipping_fee,
            freeShippingThreshold:
              typeof newData.free_shipping_threshold === "number"
                ? String(newData.free_shipping_threshold / 100)
                : newData.free_shipping_threshold,
            craftsmanshipImage: newData.craftsmanship_image,
            aboutImage: newData.about_image,
          };
          setSettings((prev) => ({ ...prev, ...parsedData }));
          showToast("Paramètres mis à jour en temps réel", "success");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, initialSettings]);

  /* ── inline field style helper ── */
  const fieldCls =
    "font-body w-full px-4 py-2.5 text-sm outline-none transition-colors";
  const fieldStyle = {
    border: "var(--rule-soft)",
    background: "var(--color-paper)",
    color: "var(--color-ink)",
  };

  return (
    <div>
      {/* Toast */}
      {toast.show && (
        <div
          className="animate-in slide-in-from-top-5 fixed top-4 right-4 z-50 duration-300"
          role="alert"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 shadow-lg ${toast.type === "error" ? "border border-red-200 bg-red-50" : "border border-green-200 bg-green-50"}`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            <p
              className={`font-body text-sm font-medium ${toast.type === "error" ? "text-red-800" : "text-green-800"}`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p
            className="type-overline mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            Administration
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.75rem",
              color: "var(--color-ink)",
            }}
          >
            Paramètres
          </h1>
          <p
            className="font-body mt-1 text-sm"
            style={{ color: "var(--color-ink-3)" }}
          >
            Configurez les paramètres de votre boutique
          </p>
        </div>
        {activeTab !== "security" && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="font-body flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" strokeWidth={1.5} />
                Enregistrer
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Sidebar nav */}
        <div className="min-w-0 lg:col-span-1">
          <nav className="touch-action-manipulation -mx-4 flex flex-nowrap items-center gap-1 overflow-x-auto px-4 pb-4 lg:mx-0 lg:w-56 lg:flex-col lg:overflow-x-visible lg:px-0 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="font-body flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors lg:w-full lg:justify-start lg:py-3"
                style={{
                  background:
                    activeTab === tab.id ? "var(--color-ink)" : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-paper)"
                      : "var(--color-ink-3)",
                  border: activeTab === tab.id ? "none" : "var(--rule-soft)",
                }}
              >
                <tab.icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.5} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content panel */}
        <div className="lg:col-span-4">
          <div
            className="p-6"
            style={{
              border: "var(--rule-hair)",
              background: "var(--color-paper)",
            }}
          >
            {/* ── Store ── */}
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Informations de la boutique
                </h2>
                <div className="space-y-6">
                  <Input
                    label="Nom de la boutique"
                    value={settings.storeName ?? ""}
                    onChange={(e) =>
                      handleSettingsChange("storeName", e.target.value)
                    }
                  />
                  <div className="group relative w-full">
                    <label
                      className="font-body absolute -top-2.5 left-3 bg-white px-2 text-xs tracking-wide uppercase transition-colors"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.storeDescription ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("storeDescription", e.target.value)
                      }
                      className={fieldCls}
                      style={fieldStyle}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Email de contact"
                      type="email"
                      value={settings.contactEmail ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("contactEmail", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Email ── */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Configuration des emails
                </h2>
                <div className="space-y-6">
                  <div>
                    <Input
                      label="Email d'expédition"
                      type="email"
                      value={settings.shippingEmail ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("shippingEmail", e.target.value)
                      }
                    />
                    <p
                      className="font-body mt-1 text-xs"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Les emails de confirmation seront envoyés depuis cette
                      adresse
                    </p>
                  </div>
                  <Input
                    label="Email admin pour les notifications"
                    type="email"
                    value={settings.adminEmail ?? ""}
                    onChange={(e) =>
                      handleSettingsChange("adminEmail", e.target.value)
                    }
                  />
                  <div
                    className="pt-4"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <h3
                      className="font-body mb-4 font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      Templates d&apos;emails
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "orderConfirmation",
                          label: "Confirmation de commande",
                        },
                        {
                          key: "shippingNotification",
                          label: "Notification d'expédition",
                        },
                        {
                          key: "adminNotification",
                          label: "Notification admin nouvelle commande",
                        },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={(settings.emailTemplates as any)[key]}
                            onChange={(e) =>
                              handleNestedChange(
                                "emailTemplates",
                                key,
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4"
                            style={{ accentColor: "var(--color-ink)" }}
                          />
                          <span
                            className="font-body text-sm"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Payment ── */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Configuration paiement
                </h2>
                <div className="flex items-center gap-2 border border-green-200 bg-green-50 p-4">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-body font-medium text-green-700">
                      SumUp est configuré
                    </p>
                    <p className="font-body text-sm text-green-600">
                      Les paiements sont actifs et fonctionnels
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <label
                      className="type-overline mb-1 block"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      Devise par défaut
                    </label>
                    <select
                      value={settings.currency ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("currency", e.target.value)
                      }
                      className="font-body h-11 w-full cursor-pointer appearance-none pr-8 pl-4 text-sm outline-none"
                      style={fieldStyle}
                    >
                      <option value="eur">EUR (€)</option>
                      <option value="usd">USD ($)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-8 right-3 h-4 w-4"
                      style={{ color: "var(--color-ink-3)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <Input
                        label="Frais de livraison"
                        type="number"
                        value={settings.shippingFee ?? ""}
                        onChange={(e) =>
                          handleSettingsChange("shippingFee", e.target.value)
                        }
                      />
                      <span
                        className="font-body absolute top-1/2 right-8 -translate-y-1/2 text-sm"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        €
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        label="Seuil livraison gratuite"
                        type="number"
                        value={settings.freeShippingThreshold ?? ""}
                        onChange={(e) =>
                          handleSettingsChange(
                            "freeShippingThreshold",
                            e.target.value,
                          )
                        }
                      />
                      <span
                        className="font-body absolute top-1/2 right-8 -translate-y-1/2 text-sm"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Notifications
                </h2>
                <div className="space-y-3">
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
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors"
                      style={{
                        background: "var(--color-paper-2)",
                        border: "var(--rule-soft)",
                      }}
                    >
                      <div>
                        <p
                          className="font-body font-medium"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {notif.label}
                        </p>
                        <p
                          className="font-body text-sm"
                          style={{ color: "var(--color-ink-3)" }}
                        >
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
                        className="h-4 w-4"
                        style={{ accentColor: "var(--color-ink)" }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── Media ── */}
            {activeTab === "media" && (
              <div className="space-y-12">
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1.125rem",
                      color: "var(--color-ink)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Médias du site
                  </h2>

                  {/* Hero slides */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-body font-semibold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        Hero Section
                      </h3>
                      <button
                        onClick={addHeroSlide}
                        className="font-body flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{
                          border: "var(--rule-soft)",
                          color: "var(--color-ink-3)",
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Ajouter un slide
                      </button>
                    </div>

                    {/* CTA guide */}
                    <div
                      className="flex items-start gap-4 p-4"
                      style={{
                        border: "var(--rule-soft)",
                        background: "var(--color-paper-2)",
                      }}
                    >
                      <Info
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: "var(--color-ink-3)" }}
                        strokeWidth={1.5}
                      />
                      <div className="space-y-2">
                        <p
                          className="font-body text-sm font-medium"
                          style={{ color: "var(--color-ink)" }}
                        >
                          Guide des liens CTA
                        </p>
                        <p
                          className="font-body text-xs"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          Les liens CTA redirigent vers des pages de la
                          boutique.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {["/", "/collections", "/configurateur"].map(
                            (path) => (
                              <code
                                key={path}
                                className="px-2 py-0.5 font-mono text-[10px]"
                                style={{
                                  border: "var(--rule-soft)",
                                  color: "var(--color-ink-3)",
                                }}
                              >
                                {path}
                              </code>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {settings.heroSlides.map((slide: any, index: number) => (
                        <div
                          key={slide.id}
                          className="space-y-4 p-6"
                          style={{ border: "var(--rule-soft)" }}
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className="type-overline"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              Slide #{index + 1}
                            </span>
                            <button
                              onClick={() => removeHeroSlide(slide.id)}
                              className="p-1 text-red-500 transition-colors hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-4">
                              <Input
                                label="Titre"
                                value={slide.title ?? ""}
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
                                value={slide.subtitle ?? ""}
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
                                  value={slide.link ?? ""}
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
                                  value={slide.cta ?? ""}
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
                            <div
                              className="relative flex aspect-video items-center justify-center overflow-hidden"
                              style={{
                                border: "var(--rule-soft)",
                                background: "var(--color-paper-2)",
                              }}
                            >
                              {slide.image ? (
                                <>
                                  <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                    <label
                                      className="font-body cursor-pointer bg-white px-4 py-2 text-sm font-medium"
                                      style={{ color: "var(--color-ink)" }}
                                    >
                                      Modifier l'image
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) =>
                                          e.target.files?.[0] &&
                                          handleImageSelect(
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
                                <label
                                  className="flex cursor-pointer flex-col items-center gap-2 transition-opacity hover:opacity-70"
                                  style={{ color: "var(--color-ink-3)" }}
                                >
                                  <ImageIcon
                                    className="h-8 w-8"
                                    strokeWidth={1}
                                  />
                                  <span className="font-body text-sm">
                                    Ajouter une image
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      e.target.files?.[0] &&
                                      handleImageSelect(
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

                  {/* Testimonials */}
                  <div
                    className="mt-12 space-y-6 pt-12"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-body font-semibold"
                        style={{ color: "var(--color-ink)" }}
                      >
                        Témoignages Clients
                      </h3>
                      <button
                        onClick={addTestimonial}
                        className="font-body flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{
                          border: "var(--rule-soft)",
                          color: "var(--color-ink-3)",
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Ajouter un témoignage
                      </button>
                    </div>
                    <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
                      {settings.testimonials.map(
                        (testimonial: any, index: number) => (
                          <div
                            key={testimonial.id}
                            className="group relative mb-4 break-inside-avoid overflow-hidden"
                            style={{
                              border: "var(--rule-soft)",
                              background: "var(--color-paper-2)",
                            }}
                          >
                            {testimonial.image ? (
                              <>
                                <img
                                  src={testimonial.image}
                                  alt={`Capture ${index + 1}`}
                                  className="block h-auto w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <label className="cursor-pointer p-2 text-white">
                                    <ImageIcon className="h-6 w-6" />
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        e.target.files?.[0] &&
                                        handleImageSelect(
                                          "testimonials",
                                          e.target.files[0],
                                          testimonial.id,
                                        )
                                      }
                                    />
                                  </label>
                                  <button
                                    onClick={() =>
                                      removeTestimonial(testimonial.id)
                                    }
                                    className="p-2 text-white transition-colors hover:text-red-400"
                                  >
                                    <Trash2
                                      className="h-6 w-6"
                                      strokeWidth={1.5}
                                    />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label
                                className="flex aspect-5/4 cursor-pointer flex-col items-center justify-center transition-opacity hover:opacity-70"
                                style={{ color: "var(--color-ink-3)" }}
                              >
                                <ImageIcon
                                  className="mb-2 h-8 w-8"
                                  strokeWidth={1}
                                />
                                <span className="font-body text-xs">
                                  Ajouter capture
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleImageSelect(
                                      "testimonials",
                                      e.target.files[0],
                                      testimonial.id,
                                    )
                                  }
                                />
                              </label>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Craftsmanship */}
                  <div
                    className="mt-12 space-y-6 pt-12"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <h3
                      className="font-body font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      Section Artisanat (Atelier)
                    </h3>
                    <div className="grid items-center gap-6 lg:grid-cols-2">
                      <div>
                        <p
                          className="font-body mb-4 text-sm"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          Image "Un savoir-faire d'exception" sur la page
                          d'accueil.
                        </p>
                        <label
                          className="font-body inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                          style={{
                            background: "var(--color-ink)",
                            color: "var(--color-paper)",
                          }}
                        >
                          <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
                          <span>Choisir une image</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageSelect(
                                "craftsmanshipImage",
                                e.target.files[0],
                              )
                            }
                          />
                        </label>
                      </div>
                      <div
                        className="group relative flex aspect-3/4 scale-90 items-center justify-center overflow-hidden"
                        style={{
                          border: "var(--rule-soft)",
                          background: "var(--color-paper-2)",
                        }}
                      >
                        {settings.craftsmanshipImage ? (
                          <>
                            <img
                              src={settings.craftsmanshipImage}
                              alt="Atelier"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <label
                                className="font-body cursor-pointer bg-white px-4 py-2 text-sm font-medium"
                                style={{ color: "var(--color-ink)" }}
                              >
                                Modifier
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleImageSelect(
                                      "craftsmanshipImage",
                                      e.target.files[0],
                                    )
                                  }
                                />
                              </label>
                              <button
                                onClick={() =>
                                  handleSettingsChange("craftsmanshipImage", "")
                                }
                                className="bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                              >
                                <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <ImageIcon
                            className="h-12 w-12"
                            style={{
                              color: "var(--color-ink-3)",
                              opacity: 0.2,
                            }}
                            strokeWidth={1}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div
                    className="mt-12 space-y-6 pt-12"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <h3
                      className="font-body font-semibold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      Page À Propos (Fondatrice)
                    </h3>
                    <div className="grid items-center gap-6 lg:grid-cols-2">
                      <div>
                        <p
                          className="font-body mb-4 text-sm"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          Image de la fondatrice sur la page "À Propos".
                        </p>
                        <label
                          className="font-body inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                          style={{
                            background: "var(--color-ink)",
                            color: "var(--color-paper)",
                          }}
                        >
                          <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
                          <span>Modifier la photo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageSelect("aboutImage", e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                      <div
                        className="group relative flex aspect-3/4 scale-90 items-center justify-center overflow-hidden"
                        style={{
                          border: "var(--rule-soft)",
                          background: "var(--color-paper-2)",
                        }}
                      >
                        {settings.aboutImage ? (
                          <>
                            <img
                              src={settings.aboutImage}
                              alt="Fondatrice"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <label
                                className="font-body cursor-pointer bg-white px-4 py-2 text-sm font-medium"
                                style={{ color: "var(--color-ink)" }}
                              >
                                Modifier
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleImageSelect(
                                      "aboutImage",
                                      e.target.files[0],
                                    )
                                  }
                                />
                              </label>
                              <button
                                onClick={() =>
                                  handleSettingsChange("aboutImage", "")
                                }
                                className="bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                              >
                                <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <ImageIcon
                            className="h-12 w-12"
                            style={{
                              color: "var(--color-ink-3)",
                              opacity: 0.2,
                            }}
                            strokeWidth={1}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "1.125rem",
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Sécurité
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div
                    className="space-y-6 p-6"
                    style={{
                      background: "var(--color-paper-2)",
                      border: "var(--rule-soft)",
                    }}
                  >
                    <h3
                      className="font-body font-medium"
                      style={{ color: "var(--color-ink)" }}
                    >
                      Changer le mot de passe admin
                    </h3>
                    {passwordErrors.general && (
                      <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <p className="font-body text-sm text-red-800">
                          {passwordErrors.general}
                        </p>
                      </div>
                    )}
                    <div className="space-y-6">
                      {[
                        {
                          key: "new",
                          label: "Nouveau mot de passe",
                          show: showPasswords.new,
                          toggle: () =>
                            setShowPasswords((s) => ({ ...s, new: !s.new })),
                          error: passwordErrors.new,
                        },
                        {
                          key: "confirm",
                          label: "Confirmer le nouveau mot de passe",
                          show: showPasswords.confirm,
                          toggle: () =>
                            setShowPasswords((s) => ({
                              ...s,
                              confirm: !s.confirm,
                            })),
                          error: passwordErrors.confirm,
                        },
                      ].map(({ key, label, show, toggle, error }) => (
                        <div key={key} className="relative">
                          <Input
                            label={label}
                            type={show ? "text" : "password"}
                            value={(passwords as any)[key]}
                            onChange={(e) =>
                              setPasswords((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            error={error}
                          />
                          <button
                            type="button"
                            onClick={toggle}
                            className="absolute top-2.5 right-3 transition-opacity hover:opacity-70"
                            style={{ color: "var(--color-ink-3)" }}
                          >
                            {show ? (
                              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                            ) : (
                              <Eye className="h-5 w-5" strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving && activeTab === "security"}
                          className="font-body flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: "var(--color-ink)",
                            color: "var(--color-paper)",
                          }}
                        >
                          {isSaving && activeTab === "security" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            "Mettre à jour le mot de passe"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Danger zone */}
                <div className="border border-orange-200 bg-orange-50 p-6">
                  <h3 className="font-body mb-2 font-medium text-orange-800">
                    Zone dangereuse
                  </h3>
                  <p className="font-body mb-4 text-sm text-orange-700">
                    Ces actions sont irréversibles. Procédez avec précaution.
                  </p>
                  <button
                    onClick={openResetDialog}
                    className="font-body border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Réinitialiser toutes les données
                  </button>

                  <Dialog
                    open={showResetDialog}
                    onOpenChange={setShowResetDialog}
                  >
                    <DialogContent
                      className="sm:max-w-md"
                      showCloseButton={!isSaving}
                    >
                      {resetStep === 1 ? (
                        <>
                          <DialogHeader className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                              <AlertTriangle className="h-8 w-8 text-orange-600" />
                            </div>
                            <DialogTitle className="text-center text-xl">
                              Réinitialiser les données
                            </DialogTitle>
                            <DialogDescription className="text-center">
                              Cette action supprimera définitivement toutes les
                              données transactionnelles.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="my-4 space-y-3">
                            {[
                              {
                                icon: Users,
                                title: "Clients",
                                desc: "Toutes les données clients seront supprimées",
                              },
                              {
                                icon: Package,
                                title: "Commandes",
                                desc: "Tout l'historique des commandes sera effacé",
                              },
                            ].map(({ icon: Icon, title, desc }) => (
                              <div
                                key={title}
                                className="flex items-start gap-3 border border-red-100 bg-red-50/50 p-3"
                              >
                                <Icon
                                  className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <p className="font-body font-medium text-red-800">
                                    {title}
                                  </p>
                                  <p className="font-body text-sm text-red-600">
                                    {desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                              variant="ghost"
                              onClick={closeResetDialog}
                              className="flex-1 sm:flex-none"
                            >
                              Annuler
                            </Button>
                            <Button
                              variant="luxury"
                              onClick={() => setResetStep(2)}
                              className="flex-1 bg-orange-600 hover:bg-orange-700 sm:flex-none"
                            >
                              Continuer
                            </Button>
                          </DialogFooter>
                        </>
                      ) : (
                        <>
                          <DialogHeader className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                              <Trash2
                                className="h-8 w-8 text-red-600"
                                strokeWidth={1.5}
                              />
                            </div>
                            <DialogTitle className="text-center text-xl">
                              Options de réinitialisation
                            </DialogTitle>
                            <DialogDescription className="text-center">
                              Souhaitez-vous également réinitialiser les stocks
                              ?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="my-4">
                            <label
                              className={`flex cursor-pointer items-center gap-4 border-2 p-4 transition-colors ${resetProducts ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                            >
                              <input
                                type="checkbox"
                                checked={resetProducts}
                                onChange={(e) =>
                                  setResetProducts(e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-red-600"
                              />
                              <div>
                                <p className="font-body font-medium text-gray-900">
                                  Remettre les stocks à zéro
                                </p>
                                <p className="font-body text-sm text-gray-600">
                                  Tous les produits auront un stock de 0 unités
                                </p>
                              </div>
                            </label>
                          </div>
                          <div className="border border-red-200 bg-red-50 p-3">
                            <p className="font-body text-center text-sm font-medium text-red-800">
                              ⚠️ Cette action est irréversible
                            </p>
                          </div>
                          <DialogFooter className="mt-4 gap-2 sm:gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => setResetStep(1)}
                              disabled={isSaving}
                              className="flex-1 sm:flex-none"
                            >
                              Retour
                            </Button>
                            <Button
                              onClick={handleResetData}
                              disabled={isSaving}
                              className="flex-1 bg-red-600 text-white hover:bg-red-700 sm:flex-none"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Réinitialisation...
                                </>
                              ) : (
                                "Confirmer la réinitialisation"
                              )}
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {/* Footer save button */}
            {activeTab !== "security" && (
              <div
                className="mt-8 flex justify-end pt-6"
                style={{ borderTop: "var(--rule-soft)" }}
              >
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="font-body flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    background: "var(--color-ink)",
                    color: "var(--color-paper)",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" strokeWidth={1.5} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
