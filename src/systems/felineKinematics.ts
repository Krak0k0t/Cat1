import type { CatState } from './parkour';

export interface FelinePose {
  legFL: number;
  shinFL: number;
  legFR: number;
  shinFR: number;
  legBL: number;
  shinBL: number;
  legBR: number;
  shinBR: number;
  bodyY: number;
  bodyPitch: number;
  chestRoll: number;
  spineArchY: number;
  spinRoll: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  tailBaseX: number;
  tailCurlX: number;
  earAirOffset: number;
  headCounterPitch: number;
  jointSmoothRate: number;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutQuad(t: number): number {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) * (1 - x);
}

export function easeInOutQuad(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) * 0.5;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const span = edge1 - edge0;
  if (Math.abs(span) < 1e-5) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / span, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Computes organic platformer feline joint rotations, squash & stretch proportions,
 * anticipation crouch, airborne leg tuck, delayed ear/tail drag, and landing bounce.
 *
 * Three.js joint sign convention (+Z forward, +Y up):
 *  - Negative rotation.x swings a downward limb FORWARD (+Z).
 *  - Positive rotation.x swings a downward limb BACKWARD (-Z).
 *  - Front legs fold ELBOW BACK: legF > 0, shinF < 0.
 *  - Hind legs fold KNEE FORWARD & HOCK BACK: legB < 0, shinB > 0.
 */
export function computeFelinePose(
  cat: Pick<
    CatState,
    | 'sleeping'
    | 'swimming'
    | 'crouching'
    | 'sprinting'
    | 'grounded'
    | 'hopActive'
    | 'hopElapsed'
    | 'hopDuration'
    | 'vy'
    | 'gaitPhase'
    | 'dashTimer'
    | 'gliding'
    | 'airTime'
    | 'jumpAnimTimer'
    | 'jumpPrepTimer'
    | 'jumpPrepDuration'
    | 'landTimer'
    | 'landingElapsed'
    | 'landImpact'
    | 'airSpinTimer'
  >,
  horizSpeed: number,
  elapsed: number
): FelinePose {
  const moving =
    horizSpeed > 0.25 && cat.grounded && !cat.hopActive && !cat.sleeping && cat.jumpPrepTimer <= 0;

  let legFL = 0.09;
  let shinFL = -0.17;
  let legFR = 0.09;
  let shinFR = -0.17;
  let legBL = -0.22;
  let shinBL = 0.40;
  let legBR = -0.22;
  let shinBR = 0.40;
  let bodyY = cat.sleeping ? 0.14 : cat.crouching ? 0.215 : 0.335;
  let bodyPitch = 0;
  let chestRoll = 0;
  let spineArchY = 0;
  let spinRoll = 0;
  let scaleX = 1.0;
  let scaleY = 1.0;
  let scaleZ = 1.0;
  let tailBaseX = -0.58;
  let tailCurlX = 0.34;
  let earAirOffset = 0;
  let headCounterPitch = 0;
  let jointSmoothRate = 16;

  if (cat.sleeping) {
    legFL = 1.25;
    shinFL = -1.65;
    legFR = 1.25;
    shinFR = -1.65;
    legBL = -1.15;
    shinBL = 1.55;
    legBR = -1.15;
    shinBR = 1.55;
    chestRoll = 0.14;
    bodyPitch = 0.08;
    scaleX = 1.08;
    scaleY = 0.86;
    scaleZ = 0.92;
    tailBaseX = -1.35;
    tailCurlX = 0.2;
    jointSmoothRate = 10;
  } else if (cat.swimming) {
    const p = cat.gaitPhase * 1.15;
    bodyY = 0.30 + Math.sin(elapsed * 4.2) * 0.018;
    bodyPitch = -0.15 + Math.sin(elapsed * 3.8) * 0.04;
    legFL = -0.32 + Math.sin(p) * 0.56;
    shinFL = -0.42 - Math.max(0, Math.cos(p)) * 0.48;
    legFR = -0.32 - Math.sin(p) * 0.56;
    shinFR = -0.42 - Math.max(0, -Math.cos(p)) * 0.48;
    legBL = 0.28 - Math.sin(p) * 0.44;
    shinBL = 0.24 + Math.max(0, -Math.cos(p)) * 0.45;
    legBR = 0.28 + Math.sin(p) * 0.44;
    shinBR = 0.24 + Math.max(0, Math.cos(p)) * 0.45;
    chestRoll = Math.sin(p) * 0.055;
    tailBaseX = -0.45 + Math.sin(elapsed * 3.1) * 0.08;
    jointSmoothRate = 18;
  } else if (cat.dashTimer > 0) {
    legFL = -0.26;
    shinFL = -0.78;
    legFR = -0.18;
    shinFR = -0.72;
    legBL = 0.98;
    shinBL = 0.22;
    legBR = 0.90;
    shinBR = 0.20;
    bodyPitch = 0.07;
    bodyY = 0.295;
    scaleX = 0.90;
    scaleY = 0.92;
    scaleZ = 1.18;
    tailBaseX = -1.42;
    tailCurlX = 0.08;
    jointSmoothRate = 24;
  } else if (cat.jumpPrepTimer > 0 && cat.grounded) {
    // 1. ANTICIPATION PHASE (0.10s deep coiled crouch before push-off)
    const prepDur = Math.max(0.05, cat.jumpPrepDuration || 0.10);
    const prepNorm = clamp(1 - cat.jumpPrepTimer / prepDur, 0, 1);
    const coilEase = Math.sin(easeInOutQuad(Math.min(1, prepNorm * 1.15)) * Math.PI * 0.5);

    scaleY = lerp(1.0, 0.85, coilEase);
    scaleX = lerp(1.0, 1.15, coilEase);
    scaleZ = lerp(1.0, 1.08, coilEase);

    legFL = lerp(legFL, 0.68, coilEase);
    shinFL = lerp(shinFL, -1.38, coilEase);
    legFR = lerp(legFR, 0.64, coilEase);
    shinFR = lerp(shinFR, -1.32, coilEase);
    legBL = lerp(legBL, -0.98, coilEase);
    shinBL = lerp(shinBL, 1.56, coilEase);
    legBR = lerp(legBR, -0.94, coilEase);
    shinBR = lerp(shinBR, 1.50, coilEase);

    bodyY = lerp(0.335, 0.222, coilEase);
    bodyPitch = 0.14 * coilEase;
    headCounterPitch = -0.16 * coilEase;
    tailBaseX = lerp(-0.58, -1.25, coilEase);
    tailCurlX = lerp(0.34, -0.18, coilEase);
    earAirOffset = -0.22 * coilEase;
    jointSmoothRate = 36;
  } else if (cat.gliding) {
    const flutter = Math.sin(elapsed * 14.0) * 0.06;
    legFL = -0.16 + flutter;
    shinFL = -0.68;
    legFR = -0.16 - flutter;
    shinFR = -0.68;
    legBL = -0.45 - flutter;
    shinBL = 1.02;
    legBR = -0.45 + flutter;
    shinBR = 1.02;
    chestRoll = Math.sin(elapsed * 5.2) * 0.09;
    bodyPitch = 0.05;
    bodyY = 0.31;
    scaleX = 1.08;
    scaleY = 0.94;
    scaleZ = 1.04;
    tailBaseX = -0.35;
    tailCurlX = 0.36;
    earAirOffset = 0.24;
    jointSmoothRate = 16;
  } else if (cat.hopActive || !cat.grounded) {
    // 2. AIRBORNE PHASE: Tucked bent limbs beneath belly + stretchY = 1.10 / stretchX = 0.90
    //    + speed-driven ear & tail lag (press down on ascent, float upward on descent)
    const hopT = cat.hopActive
      ? clamp(cat.hopElapsed / Math.max(0.05, cat.hopDuration), 0, 1)
      : -1;

    const launchBlend =
      hopT >= 0
        ? 1 - easeInOutQuad(clamp(hopT / 0.34, 0, 1))
        : 1 - easeInOutQuad(clamp(cat.jumpAnimTimer / 0.22, 0, 1));

    const descendBlend =
      hopT >= 0
        ? easeInOutQuad(clamp((hopT - 0.50) / 0.46, 0, 1))
        : smoothstep(0.6, -3.8, cat.vy);

    const apexGather = clamp((1 - launchBlend) * (1 - descendBlend * 0.8), 0, 1);

    // Body vertical speed stretch (peaks cleanly at stretchY = 1.10, stretchX = 0.90)
    const speedNorm = clamp(Math.abs(cat.vy) / 6.5, 0.28, 1.0);
    const stretchCurve = Math.sin(easeOutQuad(speedNorm) * Math.PI * 0.5);
    scaleY = lerp(1.02, 1.10, stretchCurve);
    scaleX = lerp(0.98, 0.90, stretchCurve);
    scaleZ = lerp(1.0, 0.96, stretchCurve);

    // Bent limbs tucked tightly beneath belly during climb & apex, bent spring reach on descent
    const fHipLaunchL = 0.60;
    const fShinLaunchL = -1.48;
    const fHipLaunchR = 0.50;
    const fShinLaunchR = -1.38;

    const fHipApex = 0.54;
    const fShinApex = -1.58;

    const fHipDescendL = -0.20;
    const fShinDescendL = -0.82;
    const fHipDescendR = -0.12;
    const fShinDescendR = -0.74;

    const bHipLaunchL = 0.44;
    const bShinLaunchL = 0.62;
    const bHipLaunchR = 0.38;
    const bShinLaunchR = 0.56;

    const bHipApex = -0.94;
    const bShinApex = 1.54;

    const bHipDescendL = -0.72;
    const bShinDescendL = 1.26;
    const bHipDescendR = -0.64;
    const bShinDescendR = 1.18;

    legFL = lerp(lerp(fHipApex, fHipLaunchL, launchBlend), fHipDescendL, descendBlend);
    shinFL = lerp(lerp(fShinApex, fShinLaunchL, launchBlend), fShinDescendL, descendBlend);
    legFR = lerp(lerp(fHipApex - 0.08, fHipLaunchR, launchBlend), fHipDescendR, descendBlend);
    shinFR = lerp(lerp(fShinApex + 0.08, fShinLaunchR, launchBlend), fShinDescendR, descendBlend);

    legBL = lerp(lerp(bHipApex, bHipLaunchL, launchBlend), bHipDescendL, descendBlend);
    shinBL = lerp(lerp(bShinApex, bShinLaunchL, launchBlend), bShinDescendL, descendBlend);
    legBR = lerp(lerp(bHipApex + 0.08, bHipLaunchR, launchBlend), bHipDescendR, descendBlend);
    shinBR = lerp(lerp(bShinApex - 0.06, bShinLaunchR, launchBlend), bShinDescendR, descendBlend);

    spineArchY = apexGather * 0.048 - descendBlend * 0.015;
    bodyY = 0.345 + spineArchY;

    const rawVyPitch = clamp(-cat.vy * 0.05, -0.34, 0.24);
    bodyPitch =
      hopT >= 0
        ? lerp(-0.28, 0.16, easeInOutQuad(clamp((hopT - 0.12) / 0.78, 0, 1)))
        : lerp(rawVyPitch, 0.14, descendBlend * 0.45);
    headCounterPitch = -bodyPitch * 0.65;

    // Velocity-reactive tail & ears: press DOWN on ascent (vy > 0), stretch UP on descent (vy < 0)
    const riseDrag = clamp(cat.vy / 7.5, 0, 1);
    const fallDrag = clamp(-cat.vy / 7.5, 0, 1);
    tailBaseX = -0.78 - riseDrag * 0.88 + fallDrag * 0.56;
    tailCurlX = 0.08 - riseDrag * 0.44 + fallDrag * 0.06;
    earAirOffset = -riseDrag * 0.58 + fallDrag * 0.36;

    if (cat.airSpinTimer > 0) {
      const spinNorm = 1 - clamp(cat.airSpinTimer / 0.32, 0, 1);
      spinRoll = easeInOutQuad(spinNorm) * Math.PI * 2;
      shinFL = lerp(shinFL, -1.64, 0.45);
      shinFR = lerp(shinFR, -1.60, 0.45);
      legBL = lerp(legBL, -0.94, 0.45);
      shinBL = lerp(shinBL, 1.54, 0.45);
    }

    jointSmoothRate = 24;
  } else if (moving && cat.sprinting) {
    const p = cat.gaitPhase * 1.18;
    const frontPhase = p;
    const hindPhase = p + Math.PI * 0.82;
    legFL = 0.16 + Math.sin(frontPhase) * 0.68;
    shinFL = -0.30 - Math.max(0, Math.cos(frontPhase)) * 0.72;
    legFR = 0.16 + Math.sin(frontPhase + 0.42) * 0.68;
    shinFR = -0.30 - Math.max(0, Math.cos(frontPhase + 0.42)) * 0.72;
    legBL = -0.24 + Math.sin(hindPhase) * 0.74;
    shinBL = 0.44 + Math.max(0, -Math.cos(hindPhase)) * 0.68;
    legBR = -0.24 + Math.sin(hindPhase + 0.38) * 0.74;
    shinBR = 0.44 + Math.max(0, -Math.cos(hindPhase + 0.38)) * 0.68;
    bodyY += Math.abs(Math.sin(p)) * 0.055;
    bodyPitch = Math.cos(p) * 0.12;
    tailBaseX = -1.25;
    tailCurlX = 0.22;
    jointSmoothRate = 20;
  } else if (moving) {
    const p = cat.gaitPhase;
    const strideAmp = Math.min(0.60, horizSpeed * 0.095);
    const crouchFrontFold = cat.crouching ? 0.46 : 0;
    const crouchHindFold = cat.crouching ? 0.58 : 0;

    legFL = 0.14 + crouchFrontFold + Math.sin(p) * strideAmp;
    shinFL = -0.26 - crouchFrontFold * 1.45 - Math.max(0, Math.cos(p)) * 0.62;
    legFR = 0.14 + crouchFrontFold - Math.sin(p) * strideAmp;
    shinFR = -0.26 - crouchFrontFold * 1.45 - Math.max(0, -Math.cos(p)) * 0.62;

    legBR = -0.24 - crouchHindFold + Math.sin(p + 0.38) * strideAmp;
    shinBR = 0.42 + crouchHindFold * 1.38 + Math.max(0, -Math.cos(p + 0.38)) * 0.56;
    legBL = -0.24 - crouchHindFold - Math.sin(p + 0.38) * strideAmp;
    shinBL = 0.42 + crouchHindFold * 1.38 + Math.max(0, Math.cos(p + 0.38)) * 0.56;

    bodyY += Math.abs(Math.sin(p)) * (cat.crouching ? 0.012 : 0.024);
    bodyPitch = cat.crouching ? 0.07 : 0.02;
    chestRoll = Math.sin(p) * 0.045;
    tailBaseX = cat.crouching ? -1.05 : -0.62;
    jointSmoothRate = 18;
  } else {
    if (cat.crouching) {
      legFL = 0.64;
      shinFL = -1.14;
      legFR = 0.62;
      shinFR = -1.10;
      legBL = -0.94;
      shinBL = 1.42;
      legBR = -0.92;
      shinBR = 1.38;
      bodyPitch = 0.06;
      headCounterPitch = -0.08;
      tailBaseX = -1.05;
    } else {
      legFL = 0.10;
      shinFL = -0.18;
      legFR = 0.08;
      shinFR = -0.16;
      legBL = -0.24;
      shinBL = 0.44;
      legBR = -0.22;
      shinBR = 0.40;
      bodyY += Math.sin(elapsed * 2.3) * 0.008;
    }
    jointSmoothRate = 14;
  }

  // 3. LANDING IMPACT & 0.1s REBOUND BOUNCE:
  //    t = 0.00 -> 0.045s: snap-ease into squashY = 0.65, squashX = 1.35 & maximum knee spring compression
  //    t = 0.045 -> 0.145s (+0.1s): rebound smoothly upward (+10% stretchY = 1.10)
  //    t = 0.145 -> 0.28s: ease gracefully back into Idle (1.0)
  if (cat.grounded && !cat.sleeping && !cat.swimming && cat.landTimer > 0 && cat.jumpPrepTimer <= 0) {
    const t = clamp(cat.landingElapsed, 0, 0.28);
    const impactScale = clamp(0.65 + cat.landImpact * 0.35, 0.65, 1.0);
    const squashPeakY = lerp(0.69, 0.65, impactScale);
    const squashPeakX = lerp(1.28, 1.35, impactScale);
    const bouncePeakY = lerp(1.08, 1.10, impactScale);
    const bouncePeakX = lerp(0.93, 0.91, impactScale);

    let springFlex = 0;
    if (t <= 0.045) {
      // Immediate cushioned touchdown deepening rapidly to full 0.65 / 1.35 squash
      const u = lerp(0.62, 1.0, easeOutQuad(t / 0.045));
      scaleY = lerp(1.0, squashPeakY, u);
      scaleX = lerp(1.0, squashPeakX, u);
      scaleZ = lerp(1.0, 1.22, u);
      springFlex = u;
    } else if (t <= 0.145) {
      // Elastic rebound 0.10s after squash: stretches +10% taller than norm (1.10)
      const u = easeInOutQuad((t - 0.045) / 0.10);
      scaleY = lerp(squashPeakY, bouncePeakY, u);
      scaleX = lerp(squashPeakX, bouncePeakX, u);
      scaleZ = lerp(1.22, 0.95, u);
      springFlex = 1 - u * 1.12;
    } else {
      // Smooth settle from +10% rebound back to Idle (1.0)
      const u = easeInOutQuad((t - 0.145) / 0.135);
      scaleY = lerp(bouncePeakY, 1.0, u);
      scaleX = lerp(bouncePeakX, 1.0, u);
      scaleZ = lerp(0.95, 1.0, u);
      springFlex = lerp(-0.12, 0, u);
    }

    const absorb = clamp(springFlex, 0, 1) * (moving ? 0.64 : 1.0);
    const rebound = clamp(-springFlex, 0, 0.25);

    legFL = lerp(legFL, 0.86, absorb) - rebound * 0.16;
    shinFL = lerp(shinFL, -1.56, absorb) + rebound * 0.24;
    legFR = lerp(legFR, 0.80, absorb) - rebound * 0.14;
    shinFR = lerp(shinFR, -1.48, absorb) + rebound * 0.22;

    legBL = lerp(legBL, -1.08, absorb) + rebound * 0.22;
    shinBL = lerp(shinBL, 1.68, absorb) - rebound * 0.28;
    legBR = lerp(legBR, -1.00, absorb) + rebound * 0.20;
    shinBR = lerp(shinBR, 1.60, absorb) - rebound * 0.26;

    bodyY = bodyY - absorb * (cat.crouching ? 0.06 : 0.15) + rebound * 0.11;
    bodyPitch += absorb * 0.13 - rebound * 0.08;
    headCounterPitch -= absorb * 0.16;
    tailBaseX = lerp(tailBaseX, -0.22, absorb * 0.78);
    tailCurlX = lerp(tailCurlX, 0.56, absorb * 0.8);
    earAirOffset = lerp(0.24, -0.14, clamp(t / 0.14, 0, 1));
    jointSmoothRate = 38;
  }

  return {
    legFL,
    shinFL,
    legFR,
    shinFR,
    legBL,
    shinBL,
    legBR,
    shinBR,
    bodyY,
    bodyPitch,
    chestRoll,
    spineArchY,
    spinRoll,
    scaleX,
    scaleY,
    scaleZ,
    tailBaseX,
    tailCurlX,
    earAirOffset,
    headCounterPitch,
    jointSmoothRate,
  };
}
