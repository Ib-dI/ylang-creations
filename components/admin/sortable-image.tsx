import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

interface SortableImageProps {
  id: string;
  url: string;
  onRemove: () => void;
}

export function SortableImage({ id, url, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-white transition-all active:cursor-grabbing",
        isDragging
          ? "border-ylang-rose z-10 scale-105 shadow-xl"
          : "hover:border-ylang-rose/50 border-gray-200",
      )}
    >
      <img src={url} alt="Product" className="h-full w-full object-cover" />

      {/* Remove Button */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
