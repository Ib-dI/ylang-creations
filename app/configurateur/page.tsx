"use client";

import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { useCartStore } from "@/lib/store/cart-store";
import { CartItem } from "@/types/cart"
import * as THREE from "three";
import {
  Package,
  Palette,
  Type,
  Sparkles,
  ShoppingBag,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
} from "lucide-react";

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
}: {
  fabricColor: string;
  embroidery: string;
  embroideryColor: string;
  accessories: string[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Corps principal - forme gigoteuse */}
      <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.6, 2.5, 32]} />
        <meshStandardMaterial
          color={fabricColor}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Haut arrondi */}
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={fabricColor}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Coutures décoratives */}
      <mesh position={[0, 0.5, 0.91]}>
        <boxGeometry args={[1.6, 0.03, 0.03]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0, -0.5, 0.91]}>
        <boxGeometry args={[1.6, 0.03, 0.03]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Broderie */}
      {embroidery && (
        <Text
          position={[0, 0.2, 0.95]}
          fontSize={0.25}
          color={embroideryColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {embroidery}
        </Text>
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
            emissive="#d4af37"
            emissiveIntensity={0.1}
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

      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={40} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={7}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        enableDamping
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#fff5e6" />

      {configuration.product && configuration.fabric && (
        <Suspense fallback={null}>
          <Product3D
            fabricColor={configuration.fabric.baseColor}
            embroidery={configuration.embroidery}
            embroideryColor={configuration.embroideryColor}
            accessories={configuration.accessories}
          />
        </Suspense>
      )}

      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.3}
        scale={8}
        blur={2}
        far={4}
      />
      <Environment preset="city" />
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
  const [zoom, setZoom] = useState(5);

  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroidery) total += 15;
    total += configuration.accessories.length * 10;
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
      complete: !!configuration.embroidery,
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
  const { addItem, openCart } = useCartStore()

  const handleAddToCart = () => {
    if (!configuration.product || !configuration.fabric) return

    const item: CartItem = {
      id: `${configuration.product.id}-${Date.now()}`,
      productId: configuration.product.id,
      productName: configuration.product.name,
      configuration: {
        fabricName: configuration.fabric.name,
        fabricColor: configuration.fabric.color,
        embroidery: configuration.embroidery,
        accessories: configuration.accessories
      },
      price: totalPrice(),
      quantity: 1
    }

    addItem(item)
    openCart() // Ouvre le drawer automatiquement
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8]">
      {/* Layout principal */}
      <div className="pt-20">
        <div className="flex h-screen">
          {/* Gauche: Preview 3D */}
          <div className="flex w-1/2 flex-col border-r border-[#e8dcc8] bg-gradient-to-br from-[#faf9f6] to-[#f5f1e8]">
            <div className="relative flex-1">
              <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                <Scene3D
                  configuration={configuration}
                  autoRotate={autoRotate}
                />
              </Canvas>

              {/* Contrôles overlay */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
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
                  className="rounded-full p-2 transition-colors hover:bg-[#f5f1e8]"
                  title="Zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full p-2 transition-colors hover:bg-[#f5f1e8]"
                  title="Dézoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full p-2 transition-colors hover:bg-[#f5f1e8]"
                  title="Reset vue"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {configuration.product && configuration.fabric && (
                <div className="absolute top-6 left-6 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md">
                  <p className="mb-1 text-xs text-[#1a1a1a]/60">
                    Votre création
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    {configuration.product.name}
                  </p>
                  <p className="text-xs font-medium text-[#b76e79]">
                    {configuration.fabric.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Droite: Options */}
          <div className="w-1/2 overflow-y-auto bg-white">
            <div className="mx-auto max-w-3xl p-8">
              {/* Tabs */}
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#b76e79] to-[#d4a89a] text-white shadow-lg"
                          : "bg-[#f5f1e8] hover:bg-[#e8dcc8]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.complete && !isActive && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Produit */}
                {activeTab === "product" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                          Choisissez votre produit
                        </h2>
                        <p className="text-[#1a1a1a]/60">
                          Sélectionnez le produit à personnaliser
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                            Prix total
                          </p>
                          <p className="text-3xl font-bold text-[#b76e79]">
                            {totalPrice()}€
                          </p>
                        </div>
                        <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-gradient-to-r from-[#b76e79] to-[#d4a89a] px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {products.map((product) => {
                        const isSelected =
                          configuration.product?.id === product.id;
                        return (
                          <button
                            key={product.id}
                            onClick={() =>
                              setConfiguration((prev) => ({ ...prev, product }))
                            }
                            className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? "border-[#b76e79] bg-[#b76e79]/5 shadow-lg"
                                : "border-[#e8dcc8] hover:border-[#b76e79]/50"
                            }`}
                          >
                            <h3 className="mb-1 text-lg font-bold">
                              {product.name}
                            </h3>
                            <p className="mb-3 text-sm text-[#1a1a1a]/60">
                              {product.description}
                            </p>
                            <p className="text-2xl font-bold text-[#b76e79]">
                              {product.basePrice}€
                            </p>
                            {isSelected && (
                              <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79]">
                                <Check className="h-5 w-5 text-white" />
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                          Choisissez votre tissu
                        </h2>
                        <p className="text-[#1a1a1a]/60">
                          Changement visible en temps réel
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                            Prix total
                          </p>
                          <p className="text-3xl font-bold text-[#b76e79]">
                            {totalPrice()}€
                          </p>
                        </div>
                        <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-gradient-to-r from-[#b76e79] to-[#d4a89a] px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {fabrics.map((fabric) => {
                        const isSelected =
                          configuration.fabric?.id === fabric.id;
                        return (
                          <button
                            key={fabric.id}
                            onClick={() =>
                              setConfiguration((prev) => ({ ...prev, fabric }))
                            }
                            className={`overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? "shadow-2xl ring-4 ring-[#b76e79]"
                                : "hover:shadow-xl"
                            }`}
                          >
                            <div
                              className="aspect-square"
                              style={{ backgroundColor: fabric.baseColor }}
                            />
                            <div className="bg-white p-3">
                              <h4 className="mb-1 text-sm font-bold">
                                {fabric.name}
                              </h4>
                              <p className="text-lg font-bold text-[#b76e79]">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                          Broderie personnalisée
                        </h2>
                        <p className="text-[#1a1a1a]/60">
                          +15€ • Aperçu immédiat sur le produit
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                            Prix total
                          </p>
                          <p className="text-3xl font-bold text-[#b76e79]">
                            {totalPrice()}€
                          </p>
                        </div>
                        <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-gradient-to-r from-[#b76e79] to-[#d4a89a] px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Ajouter au panier
                        </button>
                      </div>
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
                          {configuration.embroidery.length}/15
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
                          Accessoires décoratifs
                        </h2>
                        <p className="text-[#1a1a1a]/60">
                          Finitions premium visibles en 3D
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs tracking-wider text-[#1a1a1a]/60 uppercase">
                            Prix total
                          </p>
                          <p className="text-3xl font-bold text-[#b76e79]">
                            {totalPrice()}€
                          </p>
                        </div>
                        <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-gradient-to-r from-[#b76e79] to-[#d4a89a] px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Ajouter au panier
                        </button>
                      </div>
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
                            className={`flex w-full items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-300 ${
                              isSelected
                                ? "border-[#b76e79] bg-[#b76e79]/5 shadow-lg"
                                : "border-[#e8dcc8] hover:border-[#b76e79]/50"
                            }`}
                          >
                            <span className="text-3xl">{acc.emoji}</span>
                            <div className="flex-1 text-left">
                              <h4 className="text-lg font-bold">{acc.name}</h4>
                              <p className="text-lg font-bold text-[#b76e79]">
                                +{acc.price}€
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b76e79]">
                                <Check className="h-5 w-5 text-white" />
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
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#b76e79]">
                        <Check className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold">
                        Création terminée !
                      </h2>
                      <p className="text-[#1a1a1a]/60">
                        Vérifiez votre configuration
                      </p>
                    </div>

                    <div className="space-y-3 border-y border-[#e8dcc8] py-4">
                      {configuration.product && (
                        <div className="flex justify-between">
                          <span className="text-[#1a1a1a]/70">
                            {configuration.product.name}
                          </span>
                          <span className="font-bold">
                            {configuration.product.basePrice}€
                          </span>
                        </div>
                      )}
                      {configuration.fabric && (
                        <div className="flex justify-between">
                          <span className="text-[#1a1a1a]/70">
                            {configuration.fabric.name}
                          </span>
                          <span className="font-bold">
                            +{configuration.fabric.price}€
                          </span>
                        </div>
                      )}
                      {configuration.embroidery && (
                        <div className="flex justify-between">
                          <span className="text-[#1a1a1a]/70">
                            Broderie "{configuration.embroidery}"
                          </span>
                          <span className="font-bold">+15€</span>
                        </div>
                      )}
                      {configuration.accessories.map((accId) => {
                        const acc = accessories.find((a) => a.id === accId);
                        return acc ? (
                          <div key={accId} className="flex justify-between">
                            <span className="text-[#1a1a1a]/70">
                              {acc.name}
                            </span>
                            <span className="font-bold">+{acc.price}€</span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 text-xl">
                      <span className="font-bold">Total</span>
                      <span className="text-3xl font-bold text-[#b76e79]">
                        {totalPrice()}€
                      </span>
                    </div>

                    <button
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b76e79] to-[#d4a89a] py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <ShoppingBag className="h-6 w-6" />
                      Ajouter au panier
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
