"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EASE_OUT } from "@/lib/motion-tokens";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type {
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
} from "@/types/configurateur-page";

interface FabricStepProps {
  categories: ConfigurateurFabricCategory[];
  fabrics: ConfigurateurFabric[];
  selectedFabricId: string | undefined;
  onSelectFabric: (fabric: ConfigurateurFabric) => void;
}

interface FabricCategorySectionProps {
  title: string;
  description: string;
  prefix: string;
  fabrics: ConfigurateurFabric[];
  selectedFabricId: string | undefined;
  onSelectFabric: (fabric: ConfigurateurFabric) => void;
}

interface FabricGridItemProps {
  fabric: ConfigurateurFabric;
  isSelected: boolean;
  onSelect: () => void;
}

interface SeeAllDialogProps {
  title: string;
  description: string;
  fabrics: ConfigurateurFabric[];
  selectedFabricId: string | undefined;
  onSelectFabric: (fabric: ConfigurateurFabric) => void;
}

function FabricGridItem({ fabric, isSelected, onSelect }: FabricGridItemProps) {
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden transition-[border-color,transform] duration-200 active:scale-[0.97]"
      style={{
        border: isSelected
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
        outline: "none",
      }}
    >
      <div
        className="aspect-square w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url('${fabric.image}')` }}
      />
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center"
            style={{ background: "var(--color-accent)" }}
          >
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function SeeAllDialog({
  title,
  description,
  fabrics,
  selectedFabricId,
  onSelectFabric,
}: SeeAllDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="font-body text-xs transition-opacity hover:opacity-70"
          style={{
            color: "var(--color-ink-3)",
            borderBottom: "1px solid var(--color-accent)",
          }}
        >
          Voir tout →
        </button>
      </DialogTrigger>

      <DialogContent
        className="z-50 max-h-[90vh] max-w-5xl overflow-hidden p-0"
        style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
      >
        <div
          className="sticky top-0 z-20 px-8 py-6"
          style={{
            background: "var(--color-paper)",
            borderBottom: "var(--rule-hair)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "var(--text-title)",
                color: "var(--color-ink)",
              }}
            >
              {title}
            </DialogTitle>
            <DialogDescription
              className="font-body text-sm"
              style={{ color: "var(--color-ink-3)" }}
            >
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="overflow-y-auto px-8 py-8"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {fabrics.map((fabric) => (
              <FabricGridItem
                key={fabric.id}
                fabric={fabric}
                isSelected={selectedFabricId === fabric.id}
                onSelect={() => onSelectFabric(fabric)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FabricCategorySection({
  title,
  description,
  prefix,
  fabrics,
  selectedFabricId,
  onSelectFabric,
}: FabricCategorySectionProps) {
  const categoryFabrics = fabrics.filter((f) =>
    f.category ? f.category === prefix : f.id.startsWith(prefix),
  );
  const displayedFabrics = categoryFabrics.slice(0, 8);
  const hasMore = categoryFabrics.length > 8;

  return (
    <div className="py-6" style={{ borderTop: "var(--rule-soft)" }}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1.125rem",
              color: "var(--color-ink)",
            }}
          >
            {title}
          </h3>
          <p
            className="font-body mt-1 text-xs"
            style={{ color: "var(--color-ink-3)" }}
          >
            {description}
          </p>
        </div>
        {hasMore && (
          <SeeAllDialog
            title={title}
            description={`${title} · ${categoryFabrics.length} variantes`}
            fabrics={categoryFabrics}
            selectedFabricId={selectedFabricId}
            onSelectFabric={onSelectFabric}
          />
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
        {displayedFabrics.map((fabric) => (
          <FabricGridItem
            key={fabric.id}
            fabric={fabric}
            isSelected={selectedFabricId === fabric.id}
            onSelect={() => onSelectFabric(fabric)}
          />
        ))}
      </div>
    </div>
  );
}

export default function FabricStep({
  categories,
  fabrics,
  selectedFabricId,
  onSelectFabric,
}: FabricStepProps) {
  return (
    <>
      <div>
        <p
          className="type-overline mb-2"
          style={{ color: "var(--color-accent)" }}
        >
          Étape 02
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
          }}
        >
          Choisissez votre tissu
        </h2>
        <p
          className="font-body mt-1 text-sm"
          style={{ color: "var(--color-ink-3)" }}
        >
          Visible en temps réel · Collection premium
        </p>
      </div>

      <div>
        {categories.map((category) => (
          <FabricCategorySection
            key={category.id}
            title={category.title}
            description={category.description}
            prefix={category.id}
            fabrics={fabrics}
            selectedFabricId={selectedFabricId}
            onSelectFabric={onSelectFabric}
          />
        ))}
      </div>
    </>
  );
}
