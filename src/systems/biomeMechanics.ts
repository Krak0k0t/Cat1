import type { CatState } from './parkour';

export interface SpiritOrb {
  id: string;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  respawnTimer: number;
  colorHex?: string;
}

export interface SpringPad {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  impulseVy: number;
  forwardBoost?: number;
  cooldownTimer: number;
  bounceAnimTimer: number;
}

export interface BiomeMechanicsState {
  orbs: SpiritOrb[];
  springPads: SpringPad[];
  collectedOrbsTotal: number;
}

export interface BiomeStepResult {
  orbsCollectedNow: number;
  bouncedPadId: string | null;
  dashRefreshed: boolean;
}

export function createBiomeMechanicsState(
  orbs: Array<{ id: string; x: number; y: number; z: number; colorHex?: string }> = [],
  springPads: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    radius?: number;
    impulseVy?: number;
    forwardBoost?: number;
  }> = []
): BiomeMechanicsState {
  return {
    orbs: orbs.map((o) => ({
      id: o.id,
      x: o.x,
      y: o.y,
      z: o.z,
      collected: false,
      respawnTimer: 0,
      colorHex: o.colorHex,
    })),
    springPads: springPads.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      z: p.z,
      radius: p.radius ?? 1.25,
      impulseVy: p.impulseVy ?? 10.6,
      forwardBoost: p.forwardBoost ?? 2.4,
      cooldownTimer: 0,
      bounceAnimTimer: 0,
    })),
    collectedOrbsTotal: 0,
  };
}

/**
 * Pure simulation step for Spirit Dew-Drop Orbs (dash-reset + bonus Golden Fish)
 * and Bouncy Mushroom / Canopy Spring Pads across all campaign biomes.
 */
export function stepBiomeMechanics(
  state: BiomeMechanicsState,
  cat: CatState,
  dt: number
): BiomeStepResult {
  let orbsCollectedNow = 0;
  let bouncedPadId: string | null = null;
  let dashRefreshed = false;

  // 1. Spirit Dew-Drop Orbs (refill Dash immediately & award parkour flow + fish token)
  for (let i = 0; i < state.orbs.length; i++) {
    const orb = state.orbs[i];
    if (orb.collected) {
      if (orb.respawnTimer > 0) {
        orb.respawnTimer = Math.max(0, orb.respawnTimer - dt);
        if (orb.respawnTimer === 0) {
          orb.collected = false;
        }
      }
      continue;
    }

    const dx = cat.x - orb.x;
    const dy = cat.y + 0.35 - orb.y;
    const dz = cat.z - orb.z;
    if (dx * dx + dy * dy + dz * dz <= 1.32 * 1.32) {
      orb.collected = true;
      orb.respawnTimer = 18.0;
      state.collectedOrbsTotal++;
      orbsCollectedNow++;
      if (cat.dashCooldown > 0) {
        cat.dashCooldown = 0;
        dashRefreshed = true;
      }
      cat.airJumpsRemaining = Math.max(cat.airJumpsRemaining, cat.maxAirJumps);
      cat.parkourChain = Math.min(8, cat.parkourChain + 1);
      cat.parkourFlowTimer = Math.max(cat.parkourFlowTimer, 2.8);
    }
  }

  // 2. Bouncy Bioluminescent Mushroom Caps & Spring Canopies
  for (let i = 0; i < state.springPads.length; i++) {
    const pad = state.springPads[i];
    if (pad.cooldownTimer > 0) {
      pad.cooldownTimer = Math.max(0, pad.cooldownTimer - dt);
    }
    if (pad.bounceAnimTimer > 0) {
      pad.bounceAnimTimer = Math.max(0, pad.bounceAnimTimer - dt);
    }
    if (pad.cooldownTimer > 0) continue;

    const dx = cat.x - pad.x;
    const dz = cat.z - pad.z;
    const dy = cat.y - pad.y;
    const horizDistSq = dx * dx + dz * dz;
    if (horizDistSq <= pad.radius * pad.radius && dy >= -0.42 && dy <= 0.65 && cat.vy <= 2.2) {
      pad.cooldownTimer = 0.35;
      pad.bounceAnimTimer = 0.45;
      bouncedPadId = pad.id;

      cat.grounded = false;
      cat.swimming = false;
      cat.hopActive = false;
      cat.surfaceId = null;
      cat.y = pad.y + 0.14;
      cat.vy = pad.impulseVy;
      if (pad.forwardBoost && pad.forwardBoost > 0) {
        const horiz = Math.hypot(cat.vx, cat.vz);
        if (horiz > 0.2) {
          cat.vx += (cat.vx / horiz) * pad.forwardBoost;
          cat.vz += (cat.vz / horiz) * pad.forwardBoost;
        }
      }
      cat.dashCooldown = 0;
      cat.airJumpsRemaining = Math.max(cat.airJumpsRemaining, cat.maxAirJumps);
      cat.jumpAnimTimer = 0.38;
      cat.parkourChain = Math.min(8, cat.parkourChain + 1);
      cat.parkourFlowTimer = Math.max(cat.parkourFlowTimer, 2.8);
      dashRefreshed = true;
    }
  }

  return { orbsCollectedNow, bouncedPadId, dashRefreshed };
}
