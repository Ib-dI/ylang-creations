"use client";

import { useEffect, useRef, useState } from "react";
import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";

interface EmbroideryZone {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
}

interface Props {
  text: string;
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function EmbroideryZoneOverlay({ text, threadColor, zone, containerRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [canvasH, setCanvasH] = useState(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!container || !wrapper) return;

      const canvas = wrapper.querySelector("canvas");
      if (!canvas) return;

      const containerW = container.getBoundingClientRect().width;
      const maxPx = containerW * zone.maxWidth;
      const canvasW = canvas.width;

      const newScale = canvasW > maxPx ? maxPx / canvasW : 1;
      setScale(newScale);
      setCanvasH(canvas.height);
    };

    update();
    // Re-run when canvas redraws (MutationObserver on canvas size changes)
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [text, zone, containerRef]);

  // Géométrie du canvas (doit correspondre à EmbroideryPreview) :
  //   PY_TOP (12px) + fontSize + maxDescender + PY_TOP (12px)
  // Sans descender : canvas symétrique → centre canvas = centre lettre → aucune compensation
  // Avec descender d : le canvas grossit en bas de d px → son centre descend de d/2
  //   → il faut décaler l'élément VERS LE BAS de d/2 pour que la lettre reste fixe
  const PY_TOP = 12; // doit correspondre à PY dans EmbroideryPreview
  const symmetricBase = 2 * PY_TOP + zone.fontSize; // taille du canvas sans descender
  const actualDescender = canvasH > symmetricBase ? canvasH - symmetricBase : 0;
  // Décalage vers le bas (valeur positive = bas) pour compenser la croissance du canvas
  const verticalCompensation = (actualDescender / 2) * scale;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${zone.x * 100}%`,
        top: `${zone.y * 100}%`,
        // On descend légèrement quand il y a des descenders pour maintenir la position des lettres
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
        }}
      >
        <EmbroideryPreview
          text={text}
          threadColor={threadColor}
          targetHeight={zone.fontSize}
        />
      </div>
    </div>
  );
}