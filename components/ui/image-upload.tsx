"use client";

import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  value: (string | File)[];
  onChange: (value: (string | File)[]) => void;
  onRemove: (value: string | File) => void;
  disabled?: boolean;
  showPreview?: boolean;
  compact?: boolean; // dropzone compact + preview pleine largeur
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  showPreview = true,
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      // Filter valid files
      const validFiles = acceptedFiles.filter((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError("Format non supporté (JPG, PNG, WEBP uniquement)");
          return false;
        }
        if (file.size > MAX_SIZE) {
          setError("Chaque image doit faire moins de 5MB");
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    },
    [onChange, value],
  );

  const handleRemove = (item: string | File) => {
    onRemove(item);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 5,
    disabled: disabled || isUploading,
  });

  return (
    <div className="space-y-3">
      {/* Preview */}
      {showPreview && value.length > 0 && (
        compact ? (
          // Mode compact : image pleine largeur, plus grande
          <div className="space-y-2">
            {value.map((item, index) => {
              const url =
                typeof item === "string" ? item : URL.createObjectURL(item);
              return (
                <div
                  key={index}
                  className="relative w-full overflow-hidden rounded-xl border border-[#ede8df] bg-white"
                  style={{ aspectRatio: "4/3" }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="absolute top-2 right-2 z-[1] rounded-full bg-red-500 p-1 text-white shadow-md transition-transform hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <Image
                    fill
                    src={url}
                    alt="Image produit"
                    className="object-contain p-1"
                    onLoad={() => {
                      if (typeof item !== "string") {
                        URL.revokeObjectURL(url);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {value.map((item, index) => {
              const url =
                typeof item === "string" ? item : URL.createObjectURL(item);
              return (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-xl border bg-white"
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Image
                    fill
                    src={url}
                    alt="Image produit"
                    className="object-cover"
                    onLoad={() => {
                      if (typeof item !== "string") {
                        URL.revokeObjectURL(url);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-ylang-rose flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
          compact ? "p-3 gap-1" : "p-8",
          isDragActive && "bg-ylang-rose/5",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps()} />
        {compact ? (
          <div className="flex items-center gap-2 text-ylang-charcoal/40">
            <Upload className="h-4 w-4 text-ylang-rose" />
            <span className="text-xs font-medium">Glisser ou cliquer</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Upload className="text-ylang-rose h-6 w-6" />
            <p className="text-sm font-medium">
              Cliquez ou glissez des images ici
            </p>
            <p className="text-muted-foreground text-xs">
              JPG, PNG, WEBP — max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
