"use client";

import { useEffect, useRef, useState } from "react";
import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";

interface EmbroideryZone {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
  nameSpacing?: number;
  multiNameEnabled?: boolean;
}

interface Props {
  texts: string[];
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function EmbroideryZoneOverlay({ texts, threadColor, zone, containerRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [lastCanvasH, setLastCanvasH] = useState(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!container || !wrapper) return;

      const containerW = container.getBoundingClientRect().width;
      const REFERENCE_WIDTH = 512;
      const newScale = Math.min(containerW / REFERENCE_WIDTH, 1);
      setScale(newScale);

      // Compensation basée sur le dernier canvas (ligne la plus basse du groupe)
      const canvases = wrapper.querySelectorAll<HTMLCanvasElement>("canvas");
      const lastCanvas = canvases.length > 0 ? canvases[canvases.length - 1] : null;
      if (lastCanvas) setLastCanvasH(lastCanvas.height);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [texts, zone, containerRef]);

  const PY_TOP = 12;
  const symmetricBase = 2 * PY_TOP + zone.fontSize;
  const actualDescender = lastCanvasH > symmetricBase ? lastCanvasH - symmetricBase : 0;
  const verticalCompensation = (actualDescender / 2) * scale;

  // Réduction du double padding entre les canvases empilés :
  // Chaque EmbroideryPreview a PY=12px en haut et en bas → 24px entre deux lignes.
  // On applique un margin-top négatif en px de référence (le wrapper scale() s'en charge visuellement).
  const lineGap = zone.nameSpacing ?? -(PY_TOP * 3);

  if (!texts.length) return null;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${zone.x * 100}%`,
        top: `${zone.y * 100}%`,
        transform: `translate(-50%, calc(-50% + ${verticalCompensation}px)) rotate(${zone.rotation}deg)`,
        overflow: "visible",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          transformOrigin: "center center",
          transform: `scale(${scale})`,
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {texts.map((text, i) => (
          <div
            key={i}
            style={{ marginTop: i > 0 ? lineGap : 0 }}
          >
            <EmbroideryPreview
              text={text}
              threadColor={threadColor}
              targetHeight={zone.fontSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
