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
  fontId: string;
  fontFolder: string;
  fontFormat: "exp" | "pes";
  supportsThreadColor?: boolean;
}

export default function EmbroideryZoneOverlay({ texts, threadColor, zone, containerRef, fontId, fontFolder, fontFormat, supportsThreadColor = true }: Props) {
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
      const newScale = containerW / REFERENCE_WIDTH;
      setScale(newScale);

      // Compensation basée sur le dernier canvas (ligne la plus basse du groupe).
      // getBoundingClientRect (pas canvas.height) car le canvas est rendu au
      // devicePixelRatio — sa résolution interne n'est plus en px CSS.
      const canvases = wrapper.querySelectorAll<HTMLCanvasElement>("canvas");
      const lastCanvas = canvases.length > 0 ? canvases[canvases.length - 1] : null;
      if (lastCanvas) setLastCanvasH(lastCanvas.getBoundingClientRect().height);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [texts, zone, containerRef]);

  // Le canvas de chaque ligne est rendu directement à sa taille finale
  // (targetHeight = fontSize * scale) plutôt que dessiné petit puis agrandi en
  // CSS, pour rester net même quand scale dépasse 1 (grand cadre de preview).
  const PY_TOP = 12;
  const effectiveFontSize = zone.fontSize * scale;
  const symmetricBase = 2 * PY_TOP + effectiveFontSize;
  const actualDescender = lastCanvasH > symmetricBase ? lastCanvasH - symmetricBase : 0;
  const verticalCompensation = actualDescender / 2;

  // Réduction du double padding entre les canvases empilés :
  // Chaque EmbroideryPreview a PY=12px fixe en haut et en bas, indépendant de
  // targetHeight. nameSpacing est calibré en unités de référence (scale=1),
  // donc on le projette en pixels réels via scale.
  const lineGap = (zone.nameSpacing ?? -(PY_TOP * 3)) * scale;

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
              targetHeight={effectiveFontSize}
              fontId={fontId}
              fontFolder={fontFolder}
              fontFormat={fontFormat}
              supportsThreadColor={supportsThreadColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
