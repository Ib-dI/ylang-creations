"use client";

import { Input } from "@/components/ui/input";
import { useConfiguratorStore } from "@/lib/store/configurator-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Type } from "lucide-react";
import * as React from "react";

const fonts = [
  "Arial",
  "Times New Roman",
  "Courier",
  "Georgia",
  "Brush Script MT",
];
const embroideryColors = [
  { name: "Rose", hex: "#b76e79" },
  { name: "Or", hex: "#d4af37" },
  { name: "Argent", hex: "#c0c0c0" },
  { name: "Blanc", hex: "#ffffff" },
  { name: "Noir", hex: "#000000" },
  { name: "Bleu marine", hex: "#001f3f" },
];

export function StepPersonalization() {
  const { configuration, setEmbroidery } = useConfiguratorStore();

  const [embroideryText, setEmbroideryText] = React.useState(
    configuration.embroidery?.text || "",
  );
  const [selectedFont, setSelectedFont] = React.useState(
    configuration.embroidery?.font || fonts[0],
  );
  const [selectedColor, setSelectedColor] = React.useState(
    configuration.embroidery?.color || embroideryColors[0].hex,
  );

  // Update embroidery in store
  React.useEffect(() => {
    if (embroideryText.trim()) {
      setEmbroidery({
        text: embroideryText,
        font: selectedFont,
        color: selectedColor,
        position: "center",
      });
    } else {
      setEmbroidery(undefined);
    }
  }, [embroideryText, selectedFont, selectedColor]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-ylang-charcoal mb-4 text-3xl lg:text-4xl">
          Personnalisez votre création
        </h2>
        <p className="font-body text-ylang-charcoal/60 text-lg">
          Ajoutez votre touche personnelle avec la broderie
        </p>
      </div>

      {/* Embroidery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ylang-beige/30 rounded-2xl p-6 lg:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-ylang-rose/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <Type className="text-ylang-rose h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-ylang-charcoal text-xl font-semibold">
              Broderie personnalisée
            </h3>
            <p className="text-ylang-charcoal/60 text-sm">
              +15€ • Prénom, initiales ou message court
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="font-body text-ylang-charcoal mb-2 block text-sm font-medium">
              Texte à broder (max 15 caractères)
            </label>
            <Input
              type="text"
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value.slice(0, 15))}
              placeholder="Ex: Emma, M.D., ♥ Bébé"
              maxLength={15}
            />
            <p className="text-ylang-charcoal/40 mt-1 text-xs">
              {embroideryText.length}/15 caractères
            </p>
          </div>

          {embroideryText && (
            <>
              {/* Font Selection */}
              <div>
                <label className="font-body text-ylang-charcoal mb-3 block text-sm font-medium">
                  Police de broderie
                </label>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={cn(
                        "rounded-xl border-2 p-4 transition-all duration-300",
                        selectedFont === font
                          ? "border-ylang-rose bg-ylang-rose/5"
                          : "border-ylang-beige hover:border-ylang-rose/50",
                      )}
                    >
                      <span style={{ fontFamily: font }} className="text-lg">
                        Aa
                      </span>
                      <p className="text-ylang-charcoal/60 mt-1 text-xs">
                        {font.split(" ")[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="font-body text-ylang-charcoal mb-3 block text-sm font-medium">
                  Couleur de fil
                </label>
                <div className="flex flex-wrap gap-3">
                  {embroideryColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      className={cn(
                        "group relative",
                        selectedColor === color.hex &&
                          "ring-ylang-rose ring-2 ring-offset-2",
                      )}
                    >
                      <div
                        className="border-ylang-beige h-12 w-12 rounded-full border-2 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-ylang-charcoal/60 absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl bg-white p-6 text-center">
                <p className="text-ylang-charcoal/60 mb-3 text-sm">
                  Aperçu broderie :
                </p>
                <p
                  style={{
                    fontFamily: selectedFont,
                    color: selectedColor,
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {embroideryText}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Summary */}
      {embroideryText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-ylang-rose/10 rounded-xl p-6"
        >
          <h4 className="font-display text-ylang-charcoal mb-3 text-lg font-semibold">
            Options sélectionnées :
          </h4>
          <ul className="space-y-2">
            <li className="font-body text-ylang-charcoal flex items-center gap-2 text-sm">
              <span className="bg-ylang-rose h-2 w-2 rounded-full" />
              Broderie "{embroideryText}" (+15€)
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
