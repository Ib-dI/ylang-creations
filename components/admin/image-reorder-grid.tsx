"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface DropIndicatorProps {
  beforeId: string | null;
}

const DropIndicator = ({ beforeId }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column="images"
      className="bg-ylang-rose h-full w-1 shrink-0 rounded opacity-0 transition-opacity"
    />
  );
};

interface DraggableImageProps {
  id: string;
  url: string;
  onRemove: () => void;
  handleDragStart: (
    e: React.DragEvent,
    image: { id: string; url: string },
  ) => void;
}

export function DraggableImage({
  id,
  url,
  onRemove,
  handleDragStart,
}: DraggableImageProps) {
  return (
    <>
      <DropIndicator beforeId={id} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) =>
          handleDragStart(e as unknown as React.DragEvent, { id, url })
        }
        className="group hover:border-ylang-rose/50 relative h-28 w-28 shrink-0 cursor-grab overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg active:cursor-grabbing"
      >
        <img src={url} alt="Product" className="h-full w-full object-cover" />

        {/* Remove Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-red-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </>
  );
}

interface ImageReorderGridProps {
  images: (string | File)[];
  onReorder: (newImages: (string | File)[]) => void;
  onRemove: (url: string | File) => void;
  children?: React.ReactNode; // For the upload button
}

export function ImageReorderGrid({
  images,
  onReorder,
  onRemove,
  children,
}: ImageReorderGridProps) {
  const handleDragStart = (
    e: React.DragEvent,
    image: { id: string; url: string },
  ) => {
    e.dataTransfer.setData("imageId", image.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const imageId = e.dataTransfer.getData("imageId");

    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = (element as HTMLElement).dataset.before || "-1";

    if (before !== imageId) {
      let copy = [...images];

      const imageToTransfer = copy.find((img) => getImageId(img) === imageId);
      if (!imageToTransfer) return;

      copy = copy.filter((img) => getImageId(img) !== imageId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(imageToTransfer);
      } else {
        const insertAtIndex = copy.findIndex(
          (img) => getImageId(img) === before,
        );
        if (insertAtIndex === -1) return;

        copy.splice(insertAtIndex, 0, imageToTransfer);
      }

      onReorder(copy);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
  };

  const clearHighlights = (els?: Element[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      (i as HTMLElement).style.opacity = "0";
    });
  };

  const highlightIndicator = (e: React.DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    (el.element as HTMLElement).style.opacity = "1";
  };

  const getNearestIndicator = (e: React.DragEvent, indicators: Element[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientX - (box.left + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      },
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="images"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
  };

  const getImageId = (img: string | File): string => {
    return typeof img === "string" ? img : img.name;
  };

  const getImageUrl = (img: string | File): string => {
    return typeof img === "string" ? img : URL.createObjectURL(img);
  };

  return (
    <div className="space-y-4">
      {/* Draggable images row */}
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex min-h-28 flex-wrap gap-4 rounded-lg transition-colors"
      >
        {images.map((img) => (
          <DraggableImage
            key={getImageId(img)}
            id={getImageId(img)}
            url={getImageUrl(img)}
            onRemove={() => onRemove(img)}
            handleDragStart={handleDragStart}
          />
        ))}
        <DropIndicator beforeId={null} />
      </div>

      {/* Upload button - separate from drag zone */}
      {children}
    </div>
  );
}
