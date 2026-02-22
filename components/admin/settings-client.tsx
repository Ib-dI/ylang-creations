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

  // Reset Dialog State
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

  // Pending Uploads State
  const pendingUploads = useRef(new Map<string, File>());

  // Settings State
  const [settings, setSettings] = useState<SettingsState>({
    storeName: "Ylang Créations",
    storeDescription:
      "Allier élégance, raffinement et personnalisation. Ylang Créations vous propose des services premium de confection textile, de décoration d’intérieur et d’aménagement personnalisés. Des prestations qui vous ressemble et qui s’adaptent à vos envies.",
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

  const handleSettingsChange = (field: keyof SettingsState, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = <K extends keyof SettingsState>(
    parent: K,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value,
      },
    }));
  };

  // Initial Images State (to track deletions)
  const initialImages = useRef<Set<string>>(new Set());

  const uploadFile = async (file: File, path: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const res = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error);
    }
    return data.url;
  };

  const deleteFile = async (url: string) => {
    try {
      const res = await fetch(
        `/api/admin/storage/upload?path=${encodeURIComponent(url)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to delete file:", url, res.status, errorData);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log("🔍 Saving settings...");

    try {
      // 1. Identify images to delete
      const currentImages = new Set<string>();

      // Collect current non-blob images
      settings.heroSlides.forEach((s) => {
        if (s.image && !s.image.startsWith("blob:")) currentImages.add(s.image);
      });
      settings.testimonials.forEach((t) => {
        if (t.image && !t.image.startsWith("blob:")) currentImages.add(t.image);
      });
      if (
        settings.craftsmanshipImage &&
        !settings.craftsmanshipImage.startsWith("blob:")
      ) {
        currentImages.add(settings.craftsmanshipImage);
      }
      if (settings.aboutImage && !settings.aboutImage.startsWith("blob:")) {
        currentImages.add(settings.aboutImage);
      }

      // Find removed images
      const imagesToDelete = Array.from(initialImages.current).filter(
        (url) => !currentImages.has(url),
      );

      // Delete removed images from storage
      await Promise.all(imagesToDelete.map((url) => deleteFile(url)));

      // Process Pending Images Helper
      const processImage = async (
        imageUrl: string | null,
        pathPrefix: string,
      ) => {
        if (imageUrl && imageUrl.startsWith("blob:")) {
          const file = pendingUploads.current.get(imageUrl);
          if (file) {
            const path = `${pathPrefix}/${Date.now()}-${file.name}`;
            return await uploadFile(file, path);
          }
        }
        return imageUrl;
      };

      // 2. Upload pending images
      let updatedSettings = { ...settings };

      // Process Hero Slides
      updatedSettings.heroSlides = await Promise.all(
        settings.heroSlides.map(async (slide) => ({
          ...slide,
          image: await processImage(slide.image, "settings/hero"),
        })),
      );

      // Process Testimonials
      updatedSettings.testimonials = await Promise.all(
        settings.testimonials.map(async (t) => ({
          ...t,
          image: await processImage(t.image, "settings/testimonials"),
        })),
      );

      // Process Craftsmanship Image
      updatedSettings.craftsmanshipImage = await processImage(
        settings.craftsmanshipImage,
        "settings/craftsmanship",
      );

      // Process About Image
      updatedSettings.aboutImage = await processImage(
        settings.aboutImage,
        "settings/about",
      );

      // 3. Save Settings
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      setSettings(updatedSettings); // Update local state with real URLs

      // Update initial images set with new state
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

      pendingUploads.current.clear(); // Clear pending uploads
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
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
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

  const removeHeroSlide = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
  };

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
    const newTestimonial = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
      image: "",
    };
    setSettings((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }));
  };

  const removeTestimonial = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

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
    // Populate initial images for deletion tracking from props
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

    // Real-time subscription
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
          console.log("Real-time update received:", payload);
          const newData = payload.new as Record<string, any>;

          // Parse JSON fields - JSONB columns are already objects, but keep string fallback for safety
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

          setSettings((prev) => ({
            ...prev,
            ...parsedData,
          }));

          showToast("Paramètres mis à jour en temps réel", "success");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, initialSettings]);

  return (
    <div className="">
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
            Paramètres
          </h1>
          <p className="text-ylang-rose">
            Configurez les paramètres de votre boutique
          </p>
        </div>

        {activeTab !== "security" && (
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
                Enregistrer
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="w-56 space-y-1">
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
        <div className="lg:col-span-4">
          <div className="border-ylang-terracotta rounded-2xl border bg-white p-6">
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2 className="text-ylang-charcoal mb-4 text-xl font-bold">
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
                    <label className="font-body text-ylang-charcoal/60 group-focus-within:text-ylang-rose absolute -top-2.5 left-3 bg-white px-2 text-xs tracking-wide uppercase transition-all duration-300 group-focus-within:font-medium">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.storeDescription ?? ""}
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
                      value={settings.contactEmail ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("contactEmail", e.target.value)
                      }
                    />
                    {/* <Input
                      label="Téléphone"
                      type="tel"
                      value={settings.contactPhone ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("contactPhone", e.target.value)
                      }
                    /> */}
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
                      value={settings.shippingEmail ?? ""}
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
                    value={settings.adminEmail ?? ""}
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
                      value={settings.currency ?? ""}
                      onChange={(e) =>
                        handleSettingsChange("currency", e.target.value)
                      }
                      className="border-ylang-beige font-body text-ylang-charcoal focus:border-ylang-rose hover:border-ylang-terracotta/50 flex h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 text-sm transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(183,110,121,0.1)] focus:outline-none"
                    >
                      <option value="eur">EUR (€)</option>
                      <option value="usd">USD ($)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                    <ChevronDown className="text-ylang-charcoal/40 pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
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
                      <span className="text-ylang-charcoal/60 absolute top-1/2 right-8 -translate-y-1/2">
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
                      <span className="text-ylang-charcoal/60 absolute top-1/2 right-8 -translate-y-1/2">
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
                      {settings.heroSlides.map((slide: any, index: number) => (
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

                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                      {settings.testimonials.map(
                        (testimonial: any, index: number) => (
                          <div
                            key={testimonial.id}
                            className="group border-ylang-beige bg-ylang-cream relative aspect-5/4 overflow-hidden rounded-xl border"
                          >
                            {testimonial.image ? (
                              <>
                                <img
                                  src={testimonial.image}
                                  alt={`Capture ${index + 1}`}
                                  className="h-full w-full object-cover"
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
                                    className="p-2 text-white hover:text-red-400"
                                  >
                                    <Trash2 className="h-6 w-6" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="text-ylang-charcoal/40 hover:text-ylang-rose absolute inset-0 flex cursor-pointer flex-col items-center justify-center transition-colors">
                                <ImageIcon className="mb-2 h-8 w-8" />
                                <span className="text-xs font-medium">
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
                              handleImageSelect(
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
                              handleImageSelect("aboutImage", e.target.files[0])
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
                    onClick={openResetDialog}
                  >
                    Réinitialiser toutes les données
                  </Button>

                  {/* Modern Reset Confirmation Dialog */}
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
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-red-100">
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
                            <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                              <Users className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                              <div>
                                <p className="font-medium text-red-800">
                                  Clients
                                </p>
                                <p className="text-sm text-red-600">
                                  Toutes les données clients seront supprimées
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                              <Package className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                              <div>
                                <p className="font-medium text-red-800">
                                  Commandes
                                </p>
                                <p className="text-sm text-red-600">
                                  Tout l&apos;historique des commandes sera
                                  effacé
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <p className="text-sm text-green-700">
                                Les comptes utilisateurs seront conservés
                              </p>
                            </div>
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
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-red-100 to-red-200">
                              <Trash2 className="h-8 w-8 text-red-600" />
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
                              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                resetProducts
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={resetProducts}
                                onChange={(e) =>
                                  setResetProducts(e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Remettre les stocks à zéro
                                </p>
                                <p className="text-sm text-gray-500">
                                  Tous les produits auront un stock de 0 unités
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-center text-sm font-medium text-red-800">
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
