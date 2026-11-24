export interface ViewportProfile {
  width: number;
  height: number;
  isCoarsePointer: boolean;
  isCompactViewport: boolean;
  isLandscapePhone: boolean;
  isPortraitPhone: boolean;
}

export function classifyViewport(
  width: number,
  height: number,
  isCoarsePointer: boolean
): ViewportProfile {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const isCompactViewport = safeW < 768 || safeH <= 520;
  const isLandscapePhone = isCompactViewport && safeW > safeH;
  const isPortraitPhone = isCompactViewport && safeH >= safeW;
  return {
    width: safeW,
    height: safeH,
    isCoarsePointer,
    isCompactViewport,
    isLandscapePhone,
    isPortraitPhone,
  };
}

export interface TitleCameraFraming {
  camPos: [number, number, number];
  lookAt: [number, number, number];
  catYaw: number;
}

/**
 * Computes title-screen camera position & lookAt target so the 3D cat hero sits
 * cleanly in the open bottom-left zone beneath the raised title/Start lockup,
 * while the right side holds the configuration card and harbor skyline.
 */
export function computeTitleCameraFraming(
  catPos: { x: number; y: number; z: number },
  aspect: number,
  fovDeg = 52,
  sway = 0,
  orbitTime = 0
): TitleCameraFraming {
  const safeAspect = Math.max(0.35, Number.isFinite(aspect) ? aspect : 16 / 9);
  const isPortrait = safeAspect < 1.0;

  // Desired screen-space NDC for cat chest/head center (left: -1..+1 right, bottom: -1..+1 top)
  const targetNdcX = isPortrait ? -0.34 : -0.52;
  const targetNdcY = isPortrait ? -0.64 : -0.52;

  const baseDistZ = isPortrait ? 3.55 : 2.70;
  const baseOffX = isPortrait ? 0.44 : 1.02;
  const baseOffY = isPortrait ? 1.06 : 0.90;

  // Gentle continuous orbital sway & breathing push-in around Pip (idle camera animation)
  const orbitAngle = Math.sin(orbitTime * 0.17) * 0.24 + sway * 0.22;
  const zoomFactor = 1.0 - Math.sin(orbitTime * 0.26) * 0.045;
  const cosO = Math.cos(orbitAngle);
  const sinO = Math.sin(orbitAngle);
  const rotOffX = (baseOffX * cosO + baseDistZ * sinO) * zoomFactor;
  const rotOffZ = (-baseOffX * sinO + baseDistZ * cosO) * zoomFactor;

  const camX = catPos.x + rotOffX;
  const camY = catPos.y + baseOffY + Math.sin(orbitTime * 0.31) * 0.06;
  const camZ = catPos.z + rotOffZ;

  // Cat chest center slightly above paws
  const heroX = catPos.x;
  const heroY = catPos.y + 0.25;
  const heroZ = catPos.z;

  const tanHalfV = Math.tan((fovDeg * Math.PI) / 360);
  const tanHalfH = tanHalfV * safeAspect;

  // Compute exact lookAt offset perpendicular to camera->hero view axis so hero stays anchored at (targetNdcX, targetNdcY)
  const fx = heroX - camX;
  const fy = heroY - camY;
  const fz = heroZ - camZ;
  const depth = Math.hypot(fx, fy, fz);
  const fLen = Math.max(0.0001, depth);
  const fnx = fx / fLen;
  const fnz = fz / fLen;
  // Camera right vector on horizontal plane = normalize(forward x worldUp)
  const rLen = Math.max(0.0001, Math.hypot(fnx, fnz));
  const rx = -fnz / rLen;
  const rz = fnx / rLen;

  const shiftRight = -targetNdcX * tanHalfH * depth;
  const shiftUp = -targetNdcY * tanHalfV * depth;
  const lookX = heroX + rx * shiftRight;
  const lookY = heroY + shiftUp;
  const lookZ = heroZ + rz * shiftRight;

  return {
    camPos: [camX, camY, camZ],
    lookAt: [lookX, lookY, lookZ],
    // Turn cat ~32 deg toward camera & harbor right so face, bell, scarf, and breed fur show cleanly
    catYaw: 0.56,
  };
}

