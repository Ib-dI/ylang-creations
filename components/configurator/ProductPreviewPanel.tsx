"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import { normalizeForFont } from "@/lib/embroidery/normalize";
import { getEmbroideryZoneForFont } from "@/lib/configurator/get-embroidery-zone-for-font";
import { blendFabricTexture, blendProductColor } from "@/lib/configurator/compose-product-canvas";
import type {
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurProduct,
} from "@/types/configurateur-page";

export interface ProductPreviewPanelHandle {
  /** Renders the current canvas (product + embroidery layers) to a PNG data URL, for the cart thumbnail. */
  captureThumbnail: () => Promise<string | undefined>;
}

interface ProductPreviewPanelProps {
  product: ConfigurateurProduct;
  fabric: ConfigurateurFabric;
  embroideries: string[];
  embroideryColor: string;
  embroideryFont: ConfigurateurEmbroideryFont | null;
  selectedColor: string | null;
  totalPriceCents: number;
}

const ProductPreviewPanel = forwardRef<ProductPreviewPanelHandle, ProductPreviewPanelProps>(
  function ProductPreviewPanel(
    { product, fabric, embroideries, embroideryColor, embroideryFont, selectedColor, totalPriceCents },
    ref,
  ) {
    const [isProcessing, setIsProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageCache = useRef<Record<string, HTMLImageElement>>({});
    const productContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        try {
          const container = productContainerRef.current;
          const zone = getEmbroideryZoneForFont(product, embroideryFont?.id);
          const embCanvases: HTMLCanvasElement[] =
            embroideries.some((e) => e) && zone && container
              ? (() => {
                  const allCanvases = container.querySelectorAll<HTMLCanvasElement>("canvas");
                  return allCanvases.length > 1 ? Array.from(allCanvases).slice(1) : [];
                })()
              : [];

          // Chaque canvas de broderie se redessine de façon asynchrone une fois
          // la police chargée (voir EmbroideryPreview) ; s'il est encore à sa
          // taille par défaut (1x1), on attend quelques frames pour éviter de
          // capturer une broderie vide/tronquée.
          const isReady = () => embCanvases.every((c) => c.offsetWidth > 1 && c.offsetHeight > 1);
          for (let attempt = 0; embCanvases.length > 0 && !isReady() && attempt < 20; attempt++) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }

          const compositeCanvas = document.createElement("canvas");
          compositeCanvas.width = canvas.width;
          compositeCanvas.height = canvas.height;
          const compositeCtx = compositeCanvas.getContext("2d");
          if (!compositeCtx) return undefined;
          compositeCtx.drawImage(canvas, 0, 0);

          if (embCanvases.length > 0 && container && zone) {
            const containerRect = container.getBoundingClientRect();
            // Le canvas produit préserve le ratio de l'image de base, donc un
            // seul facteur d'échelle (px CSS -> px canvas) suffit pour les deux axes.
            const scale = canvas.width / containerRect.width;
            const rotationRad = (zone.rotation * Math.PI) / 180;

            for (const embCanvas of embCanvases) {
              // Le bloc broderie est positionné via `left/top` + `transform:
              // translate(-50%,-50%) rotate(...)` (EmbroideryZoneOverlay). Les
              // offsetLeft/Top/Width/Height ignorent les transforms CSS, donc ils
              // donnent la géométrie *avant rotation* — on reproduit exactement
              // la même transformation ici plutôt que de se fier au rectangle
              // pivoté renvoyé par getBoundingClientRect (qui produisait le
              // décalage/déformation dans le panier).
              const rotatedWrapper = embCanvas.offsetParent as HTMLElement | null;
              if (!rotatedWrapper) continue;
              compositeCtx.save();
              compositeCtx.translate(rotatedWrapper.offsetLeft * scale, rotatedWrapper.offsetTop * scale);
              compositeCtx.rotate(rotationRad);
              compositeCtx.translate(
                -(rotatedWrapper.offsetWidth / 2) * scale,
                -(rotatedWrapper.offsetHeight / 2) * scale,
              );
              compositeCtx.drawImage(
                embCanvas,
                embCanvas.offsetLeft * scale,
                embCanvas.offsetTop * scale,
                embCanvas.offsetWidth * scale,
                embCanvas.offsetHeight * scale,
              );
              compositeCtx.restore();
            }
          }

          return compositeCanvas.toDataURL("image/png");
        } catch (e) {
          console.warn("Impossible de capturer le thumbnail", e);
          try {
            return canvas.toDataURL("image/png");
          } catch {
            return undefined;
          }
        }
      },
    }));

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      if (imageCache.current[src]) return Promise.resolve(imageCache.current[src]);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          imageCache.current[src] = img;
          resolve(img);
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    useEffect(() => {
      const renderCanvas = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        setIsProcessing(true);
        try {
          const baseImg = await loadImage(product.baseImage);
          let maskImg = null;
          try {
            maskImg = await loadImage(product.maskImage);
          } catch (e) {
            console.warn("No mask", e);
          }
          const fabricImg = await loadImage(fabric.image);

          canvas.width = baseImg.width;
          canvas.height = baseImg.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(baseImg, 0, 0);

          if (maskImg) {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext("2d");
            if (tempCtx) {
              tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
              const maskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
              const textureCanvas = document.createElement("canvas");
              textureCanvas.width = canvas.width;
              textureCanvas.height = canvas.height;
              const textureCtx = textureCanvas.getContext("2d");
              if (textureCtx) {
                textureCtx.drawImage(fabricImg, 0, 0, canvas.width, canvas.height);
                const textureData = textureCtx.getImageData(0, 0, canvas.width, canvas.height);
                const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const blended = blendFabricTexture(baseData.data, maskData.data, textureData.data);
                ctx.putImageData(new ImageData(blended, canvas.width, canvas.height), 0, 0);
              }
            }
          }

          if (product.colorMaskImage && selectedColor) {
            try {
              const colorMaskImg = await loadImage(product.colorMaskImage);
              const colorMaskCanvas = document.createElement("canvas");
              colorMaskCanvas.width = canvas.width;
              colorMaskCanvas.height = canvas.height;
              const colorMaskCtx = colorMaskCanvas.getContext("2d");
              if (colorMaskCtx) {
                colorMaskCtx.drawImage(colorMaskImg, 0, 0, canvas.width, canvas.height);
                const colorMaskData = colorMaskCtx.getImageData(0, 0, canvas.width, canvas.height);
                const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const blended = blendProductColor(currentData.data, colorMaskData.data, selectedColor);
                ctx.putImageData(new ImageData(blended, canvas.width, canvas.height), 0, 0);
              }
            } catch (e) {
              console.warn("Color mask error", e);
            }
          }
        } catch (err) {
          console.error("Canvas error", err);
        } finally {
          setIsProcessing(false);
        }
      };
      renderCanvas();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, fabric, embroideries, embroideryColor, selectedColor]);

    const zone = getEmbroideryZoneForFont(product, embroideryFont?.id);

    return (
      <div
        className="relative flex h-[50vh] flex-col items-center justify-center p-4 sm:p-6 lg:sticky lg:top-[90px] lg:h-[calc(100vh-90px)] lg:w-1/2 lg:p-8"
        style={{ background: "var(--color-paper-3)" }}
      >
        <div
          className="w-full max-w-180 p-6 lg:p-8"
          style={{
            background: "var(--color-paper)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
          }}
        >
          <div
            ref={productContainerRef}
            className={`relative mx-auto w-fit overflow-hidden transition-opacity duration-300 ${isProcessing ? "opacity-50" : "opacity-100"}`}
          >
            <canvas
              ref={canvasRef}
              className="block h-auto w-auto max-w-full lg:max-h-[calc(100vh-90px-8rem)]"
            />
            {embroideries.some((e) => e) && zone && embroideryFont && (
              <EmbroideryZoneOverlay
                texts={embroideries.filter(Boolean).map((t) => normalizeForFont(t, embroideryFont.id))}
                threadColor={embroideryColor}
                zone={zone}
                containerRef={productContainerRef}
                fontId={embroideryFont.id}
                fontFolder={`/fonts/${embroideryFont.folder}`}
                fontFormat={embroideryFont.format}
                supportsThreadColor={embroideryFont.supportsThreadColor}
              />
            )}
            {isProcessing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info overlay — desktop */}
        <div
          className="absolute top-6 left-6 hidden px-4 py-3 lg:block"
          style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
        >
          <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>
            Votre création
          </p>
          <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            {product.name}
          </p>
          <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
            {fabric.name}
          </p>
        </div>

        {/* Prix — mobile */}
        <div
          className="absolute top-6 right-6 px-4 py-3 lg:hidden"
          style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
        >
          <p className="type-overline mb-0.5" style={{ color: "var(--color-ink-3)" }}>Total</p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "var(--text-title)",
              color: "var(--color-accent)",
            }}
          >
            {totalPriceCents / 100} €
          </p>
        </div>
      </div>
    );
  },
);

export default ProductPreviewPanel;
