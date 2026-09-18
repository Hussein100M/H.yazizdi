import * as THREE from "three";

/**
 * خلفية متدرّجة تُولَّد داخل المتصفح — لا ملف صورة ولا طلب شبكة.
 * التدرّج هو ما يفصل الكتلة البيضاء عن الخلفية، تماماً كما في صور الدليل.
 */
export function createGradientTexture(top: string, bottom: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, top);
    gradient.addColorStop(0.62, bottom);
    gradient.addColorStop(1, bottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 4, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** درجة أغمق قليلاً من لون الأفق — تُستخدم لأعلى التدرّج. */
export function darken(hex: string, amount: number): string {
  const color = new THREE.Color(hex);
  color.multiplyScalar(1 - amount);
  return `#${color.getHexString()}`;
}
