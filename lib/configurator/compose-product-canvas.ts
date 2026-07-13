// Pixel-level compositing for the Configurateur product preview: blending a
// fabric texture and a solid color tint onto the base product photo, driven
// by grayscale alpha masks. Pure functions over raw pixel buffers (no Canvas
// API) so the blend math is testable in plain Node — no browser, no jsdom.
//
// Callers own all Canvas 2D plumbing (drawImage/getImageData/putImageData);
// these functions only transform pixel data.

const MASK_ALPHA_THRESHOLD = 0.1;

function clamp255(n: number): number {
  return Math.min(255, n);
}

/**
 * Multiplies the fabric texture into the base image wherever the mask's red
 * channel indicates coverage (mask is a grayscale image, R=G=B=alpha).
 * `brightnessFactor` compensates for the darkening inherent to multiply blending.
 */
export function blendFabricTexture(
  base: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  texture: Uint8ClampedArray,
  brightnessFactor = 1.15,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(base.length);
  out.set(base);
  for (let i = 0; i < mask.length; i += 4) {
    const maskAlpha = mask[i] / 255;
    if (maskAlpha <= MASK_ALPHA_THRESHOLD) continue;
    const baseR = base[i], baseG = base[i + 1], baseB = base[i + 2];
    const texR = texture[i], texG = texture[i + 1], texB = texture[i + 2];
    const fR = clamp255((baseR * texR / 255) * brightnessFactor);
    const fG = clamp255((baseG * texG / 255) * brightnessFactor);
    const fB = clamp255((baseB * texB / 255) * brightnessFactor);
    out[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
    out[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
    out[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
  }
  return out;
}

/**
 * Multiplies a solid hex color into the base image wherever the color-mask's
 * red channel indicates coverage. Same masked-multiply shape as
 * blendFabricTexture, but against a constant color instead of a texture image.
 */
export function blendProductColor(
  base: Uint8ClampedArray,
  colorMask: Uint8ClampedArray,
  hexColor: string,
  brightnessFactor = 1.4,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(base.length);
  out.set(base);
  const colorR = parseInt(hexColor.slice(1, 3), 16);
  const colorG = parseInt(hexColor.slice(3, 5), 16);
  const colorB = parseInt(hexColor.slice(5, 7), 16);
  for (let i = 0; i < colorMask.length; i += 4) {
    const maskAlpha = colorMask[i] / 255;
    if (maskAlpha <= MASK_ALPHA_THRESHOLD) continue;
    const baseR = base[i], baseG = base[i + 1], baseB = base[i + 2];
    const fR = clamp255((baseR * colorR / 255) * brightnessFactor);
    const fG = clamp255((baseG * colorG / 255) * brightnessFactor);
    const fB = clamp255((baseB * colorB / 255) * brightnessFactor);
    out[i] = fR * maskAlpha + baseR * (1 - maskAlpha);
    out[i + 1] = fG * maskAlpha + baseG * (1 - maskAlpha);
    out[i + 2] = fB * maskAlpha + baseB * (1 - maskAlpha);
  }
  return out;
}
