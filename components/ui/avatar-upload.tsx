"use client";

import { cn } from "@/lib/utils";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface AvatarUploadProps {
  value: string | null;
  onChange: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Format supporté : JPG, PNG, WEBP");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Max 5MB");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: disabled,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className={cn(
          "group relative cursor-pointer transition-opacity duration-300",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        <input {...getInputProps()} />

        {/* Avatar Container */}
        <div
          className={cn(
            "relative h-32 w-32 overflow-hidden rounded-full border-4 shadow-xl transition-[transform,border-color] duration-300",
            isDragActive ? "scale-105 border-gray-400" : "border-white",
            error ? "border-red-500" : "",
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Avatar"
              fill
              className="object-cover"
              onError={() => setPreview(null)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "var(--color-paper-2)" }}
            >
              <Camera
                className="h-12 w-12"
                style={{ color: "var(--color-ink-3)", opacity: 0.4 }}
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Status Indicator */}
        <div
          className="absolute right-0 bottom-0 rounded-full border-4 p-2 shadow-lg"
          style={{
            background: "var(--color-ink)",
            borderColor: "var(--color-paper)",
            color: "var(--color-paper)",
          }}
        >
          <Camera className="h-4 w-4" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="animate-in fade-in slide-in-from-top-1 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      <p className="text-muted-foreground max-w-[200px] text-center text-xs">
        Cliquez ou glissez une image pour modifier votre photo de profil
      </p>
    </div>
  );
}
