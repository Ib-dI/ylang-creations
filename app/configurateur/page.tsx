"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Palette,
  Pause,
  Play,
  RotateCw,
  ShoppingBag,
  Sparkles,
  Type,
} from "lucide-react";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

// Types
interface Product {
  id: string;
  name: string;
  basePrice: number;
  description: string;
}

interface Fabric {
  id: string;
  name: string;
  color: string;
  price: number;
  baseColor: string;
}

interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
  embroidery: string;
  embroideryColor: string;
  accessories: string[];
}

// Data
const products: Product[] = [
  {
    id: "1",
    name: "Gigoteuse 4 saisons",
    basePrice: 89,
    description: "100% coton bio",
  },
  {
    id: "2",
    name: "Tour de lit",
    basePrice: 65,
    description: "Rembourrage premium",
  },
  {
    id: "3",
    name: "Coussin décoratif",
    basePrice: 45,
    description: "Housse amovible",
  },
  {
    id: "4",
    name: "Plaid bébé",
    basePrice: 55,
    description: "Doux et chaleureux",
  },
];

const fabrics: Fabric[] = [
  {
    id: "1",
    name: "Liberty Betsy Rose",
    color: "Rose",
    price: 15,
    baseColor: "#ffc0d3",
  },
  {
    id: "2",
    name: "Gaze Terracotta",
    color: "Terracotta",
    price: 12,
    baseColor: "#e6a68e",
  },
  {
    id: "3",
    name: "Velours Sauge",
    color: "Vert",
    price: 18,
    baseColor: "#b8d4b8",
  },
  {
    id: "4",
    name: "Liberty Michelle Bleu",
    color: "Bleu",
    price: 15,
    baseColor: "#a8c8e1",
  },
  {
    id: "5",
    name: "Lin Naturel",
    color: "Beige",
    price: 14,
    baseColor: "#e8dcc8",
  },
  {
    id: "6",
    name: "Étoiles Dorées",
    color: "Blanc",
    price: 13,
    baseColor: "#f5f5f5",
  },
];

const embroideryColors = [
  { name: "Rose", hex: "#b76e79" },
  { name: "Or", hex: "#d4af37" },
  { name: "Argent", hex: "#c0c0c0" },
  { name: "Bleu marine", hex: "#1a3a52" },
];

const accessories = [
  { id: "pompom", name: "Pompons décoratifs", price: 10, emoji: "🎀" },
  { id: "ruban", name: "Ruban satin", price: 8, emoji: "🎗️" },
  { id: "dentelle", name: "Bordure dentelle", price: 12, emoji: "🧵" },
];

// Composant 3D Product
function Product3D({
  fabricColor,
  embroidery,
  embroideryColor,
  accessories: selectedAccessories,
  productId,
}: {
  fabricColor: string;
  embroidery: string;
  embroideryColor: string;
  accessories: string[];
  productId: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Dimensions différentes selon le produit
  const getProductGeometry = () => {
    switch (productId) {
      case "1": // Gigoteuse
        return { topRadius: 0.9, bottomRadius: 0.6, height: 2.5 };
      case "2": // Tour de lit
        return { topRadius: 1.2, bottomRadius: 1.2, height: 1.5 };
      case "3": // Coussin
        return { topRadius: 0.7, bottomRadius: 0.7, height: 0.7 };
      case "4": // Plaid
        return { topRadius: 1.0, bottomRadius: 1.0, height: 0.3 };
      default:
        return { topRadius: 0.9, bottomRadius: 0.6, height: 2.5 };
    }
  };

  const geometry = getProductGeometry();

  return (
    <group ref={groupRef} key={productId}>
      {/* Corps principal - forme selon le produit */}
      <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry
          args={[
            geometry.topRadius,
            geometry.bottomRadius,
            geometry.height,
            32,
          ]}
        />
        <meshStandardMaterial
          color={fabricColor}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Haut arrondi (sauf pour le plaid) */}
      {productId !== "4" && (
        <mesh castShadow receiveShadow position={[0, geometry.height / 2, 0]}>
          <sphereGeometry
            args={[geometry.topRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial
            color={fabricColor}
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* Coutures décoratives */}
      <mesh position={[0, 0.5, 0.91]}>
        <boxGeometry args={[1.6, 0.03, 0.03]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0, -0.5, 0.91]}>
        <boxGeometry args={[1.6, 0.03, 0.03]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Broderie - Texte simple */}
      {embroidery && (
        <group position={[0, 0.2, geometry.topRadius + 0.05]}>
          {/* Fond de la broderie pour meilleure visibilité */}
          <mesh>
            <planeGeometry args={[1.5, 0.3]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          {/* Texte broderie simulé avec plusieurs petits rectangles */}
          {embroidery.split("").map((char, i) => {
            const spacing = 0.15;
            const startX = -(embroidery.length * spacing) / 2 + spacing / 2;
            return (
              <mesh key={i} position={[startX + i * spacing, 0, 0.01]}>
                <planeGeometry args={[0.12, 0.2]} />
                <meshBasicMaterial color={embroideryColor} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Pompons */}
      {selectedAccessories.includes("pompom") && (
        <>
          <mesh position={[-0.8, 1.4, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#b76e79"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
          <mesh position={[0.8, 1.4, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#b76e79"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </>
      )}

      {/* Ruban */}
      {selectedAccessories.includes("ruban") && (
        <mesh position={[0, 0.9, 0.92]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.4, 0.12, 0.02]} />
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      )}

      {/* Dentelle */}
      {selectedAccessories.includes("dentelle") && (
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.025, 16, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  );
}

// OrbitControls simple
function CameraControls({ autoRotate }: { autoRotate: boolean }) {
  useFrame((state) => {
    if (autoRotate) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 5;
      state.camera.position.z = Math.cos(state.clock.elapsedTime * 0.2) * 5;
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

// Scene 3D
function Scene3D({
  configuration,
  autoRotate,
}: {
  configuration: Configuration;
  autoRotate: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#faf9f6"]} />
      <CameraControls autoRotate={autoRotate} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#fff5e6" />

      {configuration.product && configuration.fabric && (
        <Suspense fallback={null}>
          <Product3D
            productId={configuration.product.id}
            fabricColor={configuration.fabric.baseColor}
            embroidery={configuration.embroidery}
            embroideryColor={configuration.embroideryColor}
            accessories={configuration.accessories}
          />
        </Suspense>
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.4, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  );
}

export default function ConfiguratorPremium() {
  const [activeTab, setActiveTab] = useState<
    "product" | "fabric" | "embroidery" | "accessories" | "summary"
  >("product");
  const [configuration, setConfiguration] = useState<Configuration>({
    product: null,
    fabric: null,
    embroidery: "",
    embroideryColor: embroideryColors[0].hex,
    accessories: [],
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Cart store
  const { addItem, openCart } = useCartStore();

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroidery) total += 15;
    configuration.accessories.forEach((accId) => {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) total += acc.price;
    });
    return total;
  };

  const toggleAccessory = (id: string) => {
    setConfiguration((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(id)
        ? prev.accessories.filter((a) => a !== id)
        : [...prev.accessories, id],
    }));
  };

  const tabs = [
    {
      id: "product" as const,
      label: "Produit",
      icon: Package,
      complete: !!configuration.product,
    },
    {
      id: "fabric" as const,
      label: "Tissu",
      icon: Palette,
      complete: !!configuration.fabric,
    },
    {
      id: "embroidery" as const,
      label: "Broderie",
      icon: Type,
      complete: configuration.embroidery.length > 0,
    },
    {
      id: "accessories" as const,
      label: "Accessoires",
      icon: Sparkles,
      complete: configuration.accessories.length > 0,
    },
    {
      id: "summary" as const,
      label: "Résumé",
      icon: ShoppingBag,
      complete: false,
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const canGoNext = currentTabIndex < tabs.length - 1;
  const canGoPrevious = currentTabIndex > 0;

  const goNext = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goPrevious = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleAddToCart = () => {
    if (!configuration.product || !configuration.fabric) {
      alert("Veuillez sélectionner un produit et un tissu");
      return;
    }
    
    // Générer un ID unique pour cet article personnalisé
    const uniqueId = `custom-${configuration.product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Créer l'élément du panier
    const cartItem = {
      id: uniqueId,
      productId: configuration.product.id,
      productName: configuration.product.name,
      configuration: {
        fabricName: configuration.fabric.name,
        fabricColor: configuration.fabric.baseColor,
        embroidery: configuration.embroidery || undefined,
        accessories: configuration.accessories,
      },
      price: totalPrice(),
      quantity: 1,
    };
    
    // Ajouter au panier via le store
    addItem(cartItem);
    
    // Afficher la confirmation
    setAddedToCart(true);
    
    // Ouvrir le drawer du panier après un court délai
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8]">
      <div
        className="flex min-h-screen flex-col lg:flex-row"
        style={{ marginTop: "90px" }}
      >
        {/* Gauche: Preview 3D */}
        <div className="relative flex h-[50vh] flex-col bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8] lg:h-[calc(100vh-90px)] lg:w-1/2 lg:sticky lg:top-[90px]">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 1, 5], fov: 40 }}
          >
            <Scene3D configuration={configuration} autoRotate={autoRotate} />
          </Canvas>

          {/* Contrôles overlay */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="rounded-full p-2 transition-colors hover:bg-[#f5f1e8]"
              title={autoRotate ? "Pause rotation" : "Auto rotation"}
            >
              {autoRotate ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <div className="h-6 w-px bg-[#e8dcc8]" />
            <button
              onClick={() => setAutoRotate(false)}
              className="rounded-full p-2 transition-colors hover:bg-[#f5f1e8]"
              title="Reset vue"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          {/* Info produit */}
          {configuration.product && configuration.fabric && (
            <div className="absolute top-6 left-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md">
              <p className="mb-1 text-xs text-[#1a1a1a]/60">Votre création</p>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {configuration.product.name}
              </p>
              <p className="text-xs font-medium text-[#b76e79]">
                {configuration.fabric.name}
              </p>
            </div>
          )}

          {/* Prix en mobile */}
          <div className="absolute top-6 right-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md lg:hidden">
            <p className="text-xs text-[#1a1a1a]/60">Total</p>
            <p className="text-2xl font-bold text-[#b76e79]">{totalPrice()}€</p>
          </div>
        </div>

        {/* Droite: Options */}
        <div className="flex h-1/2 flex-col overflow-y-auto bg-white lg:h-full lg:w-1/2">
          <div className="flex-1 p-6 lg:p-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#1a1a1a]/60">
                  Étape {currentTabIndex + 1} sur {tabs.length}
                </h3>
                <span className="text-sm text-[#1a1a1a]/60">
                  {Math.round(((currentTabIndex + 1) / tabs.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8dcc8]">
                <div
                  className="h-full bg-gradient-to-r from-[#b76e79] to-[#d4a89a] transition-all duration-300"
                  style={{
                    width: `${((currentTabIndex + 1) / tabs.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Tabs navigation */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isPast = index < currentTabIndex;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#b76e79] to-[#d4a89a] text-white shadow-lg"
                        : isPast
                          ? "bg-[#b76e79]/10 text-[#b76e79]"
                          : "bg-[#f5f1e8] text-[#1a1a1a]/60 hover:bg-[#e8dcc8]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.complete && !isActive && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Produit */}
              {activeTab === "product" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Choisissez votre produit
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Sélectionnez le produit à personnaliser
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {products.map((product) => {
                      const isSelected =
                        configuration.product?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() =>
                            setConfiguration((prev) => ({ ...prev, product }))
                          }
                          className={`relative rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                            isSelected
                              ? "scale-105 border-[#b76e79] bg-[#b76e79]/5 shadow-lg"
                              : "border-[#e8dcc8] hover:border-[#b76e79]/50 hover:shadow-md"
                          }`}
                        >
                          <h3 className="mb-1 font-bold">{product.name}</h3>
                          <p className="mb-2 text-xs text-[#1a1a1a]/60">
                            {product.description}
                          </p>
                          <p className="text-xl font-bold text-[#b76e79]">
                            {product.basePrice}€
                          </p>
                          {isSelected && (
                            <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#b76e79]">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Tissu */}
              {activeTab === "fabric" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Choisissez votre tissu
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Visible en temps réel sur le modèle 3D
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {fabrics.map((fabric) => {
                      const isSelected = configuration.fabric?.id === fabric.id;
                      return (
                        <button
                          key={fabric.id}
                          onClick={() =>
                            setConfiguration((prev) => ({ ...prev, fabric }))
                          }
                          className={`overflow-hidden rounded-xl transition-all duration-300 ${
                            isSelected
                              ? "scale-105 shadow-2xl ring-4 ring-[#b76e79]"
                              : "hover:scale-105 hover:shadow-xl"
                          }`}
                        >
                          <div
                            className="aspect-[4/3]"
                            style={{ backgroundColor: fabric.baseColor }}
                          />
                          <div className="bg-white p-2">
                            <h4 className="mb-1 text-xs font-bold">
                              {fabric.name}
                            </h4>
                            <p className="text-sm font-bold text-[#b76e79]">
                              +{fabric.price}€
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Broderie */}
              {activeTab === "embroidery" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Broderie personnalisée
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      +15€ • Aperçu immédiat sur le produit
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Texte (max 15 caractères)
                      </label>
                      <input
                        type="text"
                        value={configuration.embroidery}
                        onChange={(e) =>
                          setConfiguration((prev) => ({
                            ...prev,
                            embroidery: e.target.value.slice(0, 15),
                          }))
                        }
                        placeholder="Emma, Léo..."
                        className="w-full rounded-xl border-2 border-[#e8dcc8] px-4 py-3 transition-colors focus:border-[#b76e79] focus:outline-none"
                        maxLength={15}
                      />
                      <p className="mt-1 text-xs text-[#1a1a1a]/40">
                        {configuration.embroidery.length}/15 caractères
                      </p>
                    </div>

                    {configuration.embroidery && (
                      <div>
                        <label className="mb-3 block text-sm font-medium">
                          Couleur du fil
                        </label>
                        <div className="flex gap-3">
                          {embroideryColors.map((color) => (
                            <button
                              key={color.hex}
                              onClick={() =>
                                setConfiguration((prev) => ({
                                  ...prev,
                                  embroideryColor: color.hex,
                                }))
                              }
                              className={`h-12 w-12 rounded-full transition-all ${
                                configuration.embroideryColor === color.hex
                                  ? "scale-110 ring-4 ring-[#b76e79] ring-offset-2"
                                  : "hover:scale-110"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Accessoires */}
              {activeTab === "accessories" && (
                <>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                      Accessoires décoratifs
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Finitions premium visibles en 3D
                    </p>
                  </div>
                  <div className="space-y-3">
                    {accessories.map((acc) => {
                      const isSelected = configuration.accessories.includes(
                        acc.id,
                      );
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all duration-300 ${
                            isSelected
                              ? "border-[#b76e79] bg-[#b76e79]/5 shadow-lg"
                              : "border-[#e8dcc8] hover:border-[#b76e79]/50"
                          }`}
                        >
                          <span className="text-2xl">{acc.emoji}</span>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold">{acc.name}</h4>
                            <p className="text-sm font-bold text-[#b76e79]">
                              +{acc.price}€
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b76e79]">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Résumé */}
              {activeTab === "summary" && (
                <>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b76e79]">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold">
                      Création terminée !
                    </h2>
                    <p className="text-sm text-[#1a1a1a]/60">
                      Vérifiez votre configuration
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl bg-[#f5f1e8] p-4">
                    {configuration.product && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          {configuration.product.name}
                        </span>
                        <span className="font-bold">
                          {configuration.product.basePrice}€
                        </span>
                      </div>
                    )}
                    {configuration.fabric && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          {configuration.fabric.name}
                        </span>
                        <span className="font-bold">
                          +{configuration.fabric.price}€
                        </span>
                      </div>
                    )}
                    {configuration.embroidery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#1a1a1a]/70">
                          Broderie "{configuration.embroidery}"
                        </span>
                        <span className="font-bold">+15€</span>
                      </div>
                    )}
                    {configuration.accessories.map((accId) => {
                      const acc = accessories.find((a) => a.id === accId);
                      return acc ? (
                        <div
                          key={accId}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-[#1a1a1a]/70">{acc.name}</span>
                          <span className="font-bold">+{acc.price}€</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#b76e79]/10 to-[#d4a89a]/10 p-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-bold text-[#b76e79]">
                      {totalPrice()}€
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer avec navigation et prix */}
          <div className="border-t border-[#e8dcc8] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Bouton Précédent */}
              <button
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                  canGoPrevious
                    ? "bg-[#f5f1e8] text-[#1a1a1a] hover:bg-[#e8dcc8]"
                    : "cursor-not-allowed bg-[#f5f1e8]/50 text-[#1a1a1a]/30"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Précédent</span>
              </button>

              {/* Prix total (desktop) */}
              <div className="hidden text-center lg:block">
                <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                  Prix total
                </p>
                <p className="text-3xl font-bold text-[#b76e79]">
                  {totalPrice()}€
                </p>
              </div>

              {/* Bouton Suivant / Ajouter au panier */}
              {activeTab === "summary" ? (
                <button
                  onClick={handleAddToCart}
                  disabled={!configuration.product || !configuration.fabric}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-all ${
                    configuration.product && configuration.fabric
                      ? "bg-gradient-to-r from-[#b76e79] to-[#d4a89a] hover:scale-105 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Ajouter au panier
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                    canGoNext
                      ? "bg-gradient-to-r from-[#b76e79] to-[#d4a89a] text-white hover:scale-105 hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300 text-white"
                  }`}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suivant</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast de confirmation d'ajout au panier */}
      {addedToCart && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in-up">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl border border-[#e8dcc8]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[#1a1a1a]">Ajouté au panier !</p>
              <p className="text-sm text-[#1a1a1a]/60">
                {configuration.product?.name} - {configuration.fabric?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
