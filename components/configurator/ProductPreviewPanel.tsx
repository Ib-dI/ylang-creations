"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import { normalizeForFont } from "@/lib/embroidery/normalize";
import { getEmbroideryZoneForFont } from "@/lib/configurator/get-embroidery-zone-for-font";
import type {
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurProduct,
} from "@/types/configurateur-page";

export interface ProductPreviewPanelHandle {
  /** Renders the current canvas (product + embroidery layers) to a PNG data URL, for the cart thumbnail. */
  captureThumbnail: () => string | undefined;
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
      captureThumbnail: () => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        try {
          const compositeCanvas = document.createElement("canvas");
          compositeCanvas.width = canvas.width;
          compositeCanvas.height = canvas.height;
          const compositeCtx = compositeCanvas.getContext("2d");
          if (!compositeCtx) return undefined;
          compositeCtx.drawImage(canvas, 0, 0);
          if (
            embroideries.some((e) => e) &&
            getEmbroideryZoneForFont(product, embroideryFont?.id) &&
            productContainerRef.current
          ) {
            const container = productContainerRef.current;
            const allCanvases = container.querySelectorAll<HTMLCanvasElement>("canvas");
            const embCanvases = allCanvases.length > 1 ? Array.from(allCanvases).slice(1) : [];
            if (embCanvases.length > 0) {
              const containerRect = container.getBoundingClientRect();
              const scaleX = canvas.width / containerRect.width;
              const scaleY = canvas.height / containerRect.height;
              for (const embCanvas of embCanvases) {
                const embRect = embCanvas.getBoundingClientRect();
                compositeCtx.drawImage(
                  embCanvas,
                  (embRect.left - containerRect.left) * scaleX,
                  (embRect.top - containerRect.top) * scaleY,
                  embRect.width * scaleX,
                  embRect.height * scaleY,
                );
              }
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
                for (let i = 0; i < maskData.data.length; i += 4) {
                  const maskAlpha = maskData.data[i] / 255;
                  if (maskAlpha > 0.1) {
                    const baseR = baseData.data[i], baseG = baseData.data[i + 1], baseB = baseData.data[i + 2];
                    const texR = textureData.data[i], texG = textureData.data[i + 1], texB = textureData.data[i + 2];
                    const bf = 1.15;
                    const fR = Math.min(255, (baseR * texR / 255) * bf);
                    const fG = Math.min(255, (baseG * texG / 255) * bf);
                    const fB = Math.min(255, (baseB * texB / 255) * bf);
                    baseData.data[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
                    baseData.data[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
                    baseData.data[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
                  }
                }
                ctx.putImageData(baseData, 0, 0);
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
                const hex = selectedColor;
                const colorR = parseInt(hex.slice(1, 3), 16);
                const colorG = parseInt(hex.slice(3, 5), 16);
                const colorB = parseInt(hex.slice(5, 7), 16);
                for (let i = 0; i < colorMaskData.data.length; i += 4) {
                  const maskAlpha = colorMaskData.data[i] / 255;
                  if (maskAlpha > 0.1) {
                    const baseR = currentData.data[i], baseG = currentData.data[i + 1], baseB = currentData.data[i + 2];
                    const bf = 1.4;
                    const fR = Math.min(255, (baseR * colorR / 255) * bf);
                    const fG = Math.min(255, (baseG * colorG / 255) * bf);
                    const fB = Math.min(255, (baseB * colorB / 255) * bf);
                    currentData.data[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
                    currentData.data[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
                    currentData.data[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
                  }
                }
                ctx.putImageData(currentData, 0, 0);
              }
            } catch (e) {
              console.warn("Color mask error", e);
            }
          }
        } catch (err) {
          console.error("Canvas error", err);
        } finally {
          setIsProcessing(false);
          // DEBUG-TEMP: remove after diagnosing the baseline-offset regression.
          console.log("[ProductPreviewPanel]", {
            productId: product.id,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            containerW: productContainerRef.current?.getBoundingClientRect().width,
            containerH: productContainerRef.current?.getBoundingClientRect().height,
          });
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
