import * as THREE from 'three';
import type { ActId, ActSpec, BossId } from '../data/acts';
import type { WalkSurface, SolidCollider } from '../systems/parkour';
import type { WorldMaterialSet } from './materials';
import {
  buildCanalMooringPost,
  buildCanalQuayWall,
  buildCanalSkiff,
  buildClockworkGear,
  buildCopperPipeBridge,
  buildLanternPost,
  buildRooftopBuilding,
  buildStoneCanalBridge,
  getBuildingPhysics,
} from './worldProps';
import {
  buildBaitPail,
  buildCozyNestMesh,
  buildEchoBridgeMesh,
  buildFishBasket,
  buildFishCuttingBoard,
  buildMarcoLetterMesh,
  buildOwlSearchlightRig,
  collectStealableFishMeshes,
  type BaitPailVisual,
  type EchoBridgeVisual,
  type HarborPropAssets,
  type OwlSearchlightVisual,
} from './harborProps';
import {
  createDogNpc,
  createPerchedBirdNpc,
  createPersonNpc,
  createSoaringBirdNpc,
  type NpcWorldState,
} from '../systems/npcSystem';
import type { FishSpot } from '../systems/storySystem';
import type { HarborMechanicsState } from '../systems/harborMechanics';
import {
  createBiomeMechanicsState,
  type BiomeMechanicsState,
} from '../systems/biomeMechanics';
import {
  buildBiomeTreeLOD,
  buildInstancedGrassField,
  buildMossCarpetField,
  buildRockField,
  type GrassPatchSpec,
  type MossPatchSpec,
  type NatureMaterialSet,
  type RockInstanceSpec,
} from './assets/NatureAssets';
import {
  buildAmphoraClusterLOD,
  buildBioluminescentMushroom,
  buildSanctuaryShrineLOD,
  buildSpiritDewOrb,
  buildSpringCanopyPad,
  type PropMaterialSet,
} from './assets/PropAndMechanismAssets';

export interface BossRig {
  root: THREE.Group;
  body: THREE.Group;
  telegraphRing: THREE.Mesh;
  telegraphMat: THREE.MeshBasicMaterial;
  vulnAura: THREE.Mesh;
  vulnMat: THREE.MeshBasicMaterial;
  coreMat: THREE.MeshStandardMaterial;
  wingL?: THREE.Mesh;
  wingR?: THREE.Mesh;
  disposables: {
    geos: THREE.BufferGeometry[];
    mats: THREE.Material[];
    textures?: THREE.Texture[];
  };
}

export interface AnchorVisual {
  group: THREE.Group;
  ring: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
}

export interface FerryVisual {
  root: THREE.Group;
  lanternMat: THREE.MeshStandardMaterial;
  beaconRing: THREE.Mesh;
  beaconMat: THREE.MeshBasicMaterial;
}

export interface RaceRingVisual {
  group: THREE.Group;
  mat: THREE.MeshStandardMaterial;
}

export interface OrbVisualItem {
  orbId: string;
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  dropMesh: THREE.Mesh;
}

export interface SpringPadVisualItem {
  padId: string;
  group: THREE.Group;
  capMesh: THREE.Mesh;
  baseCapY: number;
}

export interface SecondaryActWorld {
  root: THREE.Group;
  surfaces: WalkSurface[];
  colliders: SolidCollider[];
  fishSpots: FishSpot[];
  fishMeshMap: Map<string, THREE.Object3D[]>;
  npcState: NpcWorldState;
  mechanics: HarborMechanicsState;
  biomeMechanics: BiomeMechanicsState;
  orbVisuals: OrbVisualItem[];
  springPadVisuals: SpringPadVisualItem[];
  echoVisuals: EchoBridgeVisual[];
  owlVisuals: OwlSearchlightVisual[];
  pailVisuals: BaitPailVisual[];
  letterVisuals: THREE.Group[];
  rotatingGears: Array<{ mesh: THREE.Object3D; speed: number }>;
  disposableGeos: THREE.BufferGeometry[];
  disposableMats: THREE.Material[];
}

function makeBossArmorTexture(baseHex: string, streakHex: string): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 96;
  const cA = document.createElement('canvas');
  const cR = document.createElement('canvas');
  cA.width = cR.width = size;
  cA.height = cR.height = size;
  const ctxA = cA.getContext('2d')!;
  const ctxR = cR.getContext('2d')!;

  ctxA.fillStyle = baseHex;
  ctxA.fillRect(0, 0, size, size);
  ctxR.fillStyle = '#686868';
  ctxR.fillRect(0, 0, size, size);

  // Subtle brushed armor seam lines and patina rivets
  ctxA.strokeStyle = streakHex;
  ctxA.lineWidth = 2;
  ctxR.strokeStyle = '#9C9C9C';
  ctxR.lineWidth = 2;
  for (let y = 16; y < size; y += 24) {
    ctxA.globalAlpha = 0.28;
    ctxA.beginPath();
    ctxA.moveTo(0, y);
    ctxA.lineTo(size, y);
    ctxA.stroke();

    ctxR.globalAlpha = 0.4;
    ctxR.beginPath();
    ctxR.moveTo(0, y);
    ctxR.lineTo(size, y);
    ctxR.stroke();
  }

  // Brass/iron rivet dots along panel seams
  for (let y = 20; y < size; y += 24) {
    for (let x = 12; x < size; x += 24) {
      ctxA.fillStyle = '#E6B86E';
      ctxA.globalAlpha = 0.22;
      ctxA.beginPath();
      ctxA.arc(x, y, 1.8, 0, Math.PI * 2);
      ctxA.fill();

      ctxR.fillStyle = '#383838';
      ctxR.globalAlpha = 0.55;
      ctxR.beginPath();
      ctxR.arc(x, y, 2.0, 0, Math.PI * 2);
      ctxR.fill();
    }
  }

  const map = new THREE.CanvasTexture(cA);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(cR);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);

  return { map, roughnessMap };
}

export function createBossRig(bossId: BossId, contactShadowMat: THREE.MeshBasicMaterial): BossRig {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const shadowGeo = new THREE.CircleGeometry(1.38, 28);
  geos.push(shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, contactShadowMat);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.02;
  root.add(shadow);

  const telegraphMat = new THREE.MeshBasicMaterial({
    color: '#FF3B1F',
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mats.push(telegraphMat);
  const teleGeo = new THREE.RingGeometry(0.6, 2.2, 32);
  geos.push(teleGeo);
  const telegraphRing = new THREE.Mesh(teleGeo, telegraphMat);
  telegraphRing.rotation.x = -Math.PI * 0.5;
  telegraphRing.position.y = 0.05;
  root.add(telegraphRing);

  const vulnMat = new THREE.MeshBasicMaterial({
    color: '#FFE066',
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mats.push(vulnMat);
  const vulnGeo = new THREE.RingGeometry(1.15, 1.55, 28);
  geos.push(vulnGeo);
  const vulnAura = new THREE.Mesh(vulnGeo, vulnMat);
  vulnAura.rotation.x = -Math.PI * 0.5;
  vulnAura.position.y = 0.07;
  root.add(vulnAura);

  const armorTex = makeBossArmorTexture(
    bossId === 'gufo_oro' ? '#D69F3A' : bossId === 'captain_ironsnout' ? '#4C5A68' : '#7A3E26',
    bossId === 'gufo_oro' ? '#5E3E16' : '#1D242B'
  );
  textures.push(armorTex.map, armorTex.roughnessMap);

  const coreMat = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    map: armorTex.map,
    roughnessMap: armorTex.roughnessMap,
    roughness: 0.36,
    metalness: bossId === 'gufo_oro' ? 0.76 : 0.44,
    clearcoat: 0.42,
    clearcoatRoughness: 0.24,
    emissive: new THREE.Color('#281408'),
    emissiveIntensity: 0.25,
  });
  const trimMat = new THREE.MeshPhysicalMaterial({
    color: '#E0AE56',
    roughness: 0.26,
    metalness: 0.82,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: '#232B32',
    roughness: 0.48,
    metalness: 0.62,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#FF542E',
    emissive: new THREE.Color('#E83412'),
    emissiveIntensity: 0.85,
    roughness: 0.16,
  });
  mats.push(coreMat, trimMat, darkIronMat, eyeMat);

  let wingL: THREE.Mesh | undefined;
  let wingR: THREE.Mesh | undefined;

  if (bossId === 'gufo_oro') {
    // Giant Clockwork Great Owl with slope-matched armor bands, domed sternum shield, feathered gorget, sculpted brow crests & multi-blade articulated wings
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.94, 1.88, 18);
    const beltLowerGeo = new THREE.CylinderGeometry(0.91, 0.935, 0.18, 18);
    const beltUpperGeo = new THREE.CylinderGeometry(0.868, 0.886, 0.14, 18);
    const gorgetGeo = new THREE.TorusGeometry(0.75, 0.085, 10, 24);
    const chestShieldGeo = new THREE.SphereGeometry(0.56, 14, 12);
    const heartCoreGeo = new THREE.OctahedronGeometry(0.24, 1);
    const heartBezelGeo = new THREE.TorusGeometry(0.32, 0.055, 8, 20);
    const headGeo = new THREE.SphereGeometry(0.68, 16, 14);
    const browGeo = new THREE.BoxGeometry(0.56, 0.12, 0.24);
    const earTuftGeo = new THREE.ConeGeometry(0.14, 0.48, 6);
    const beakGeo = new THREE.ConeGeometry(0.16, 0.34, 6);
    const ringOuterGeo = new THREE.TorusGeometry(1.12, 0.07, 10, 32);
    const ringInnerGeo = new THREE.TorusGeometry(0.78, 0.055, 8, 24);
    const wingHubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.36, 10);
    wingHubGeo.rotateX(Math.PI * 0.5);
    const wingBladeGeo = new THREE.BoxGeometry(1.55, 0.13, 0.4);
    const wingTipGeo = new THREE.BoxGeometry(0.72, 0.1, 0.26);
    const eyeBezelGeo = new THREE.TorusGeometry(0.19, 0.04, 8, 16);
    const eyeGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const talonGeo = new THREE.ConeGeometry(0.11, 0.42, 6);
    geos.push(
      torsoGeo,
      beltLowerGeo,
      beltUpperGeo,
      gorgetGeo,
      chestShieldGeo,
      heartCoreGeo,
      heartBezelGeo,
      headGeo,
      browGeo,
      earTuftGeo,
      beakGeo,
      ringOuterGeo,
      ringInnerGeo,
      wingHubGeo,
      wingBladeGeo,
      wingTipGeo,
      eyeBezelGeo,
      eyeGeo,
      talonGeo
    );

    const torso = new THREE.Mesh(torsoGeo, coreMat);
    torso.position.y = 1.56;
    torso.castShadow = true;
    body.add(torso);

    const beltLower = new THREE.Mesh(beltLowerGeo, darkIronMat);
    beltLower.position.y = 0.96;
    beltLower.castShadow = true;
    const beltUpper = new THREE.Mesh(beltUpperGeo, trimMat);
    beltUpper.position.y = 1.32;
    beltUpper.castShadow = true;
    const gorget = new THREE.Mesh(gorgetGeo, trimMat);
    gorget.position.y = 2.15;
    gorget.rotation.x = Math.PI * 0.5 + 0.12;
    gorget.castShadow = true;
    body.add(beltLower, beltUpper, gorget);

    const chestShield = new THREE.Mesh(chestShieldGeo, trimMat);
    chestShield.position.set(0, 1.64, 0.66);
    chestShield.scale.set(0.95, 1.12, 0.36);
    chestShield.castShadow = true;
    body.add(chestShield);

    const heartBezel = new THREE.Mesh(heartBezelGeo, darkIronMat);
    heartBezel.position.set(0, 1.64, 0.87);
    const heartCore = new THREE.Mesh(heartCoreGeo, eyeMat);
    heartCore.position.set(0, 1.64, 0.9);
    body.add(heartBezel, heartCore);

    const head = new THREE.Mesh(headGeo, coreMat);
    head.position.set(0, 2.55, 0.06);
    head.scale.set(1.06, 0.88, 0.96);
    head.castShadow = true;
    body.add(head);

    const beak = new THREE.Mesh(beakGeo, trimMat);
    beak.position.set(0, 2.38, 0.72);
    beak.rotation.x = Math.PI * 0.65;
    body.add(beak);

    for (const sx of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, trimMat);
      brow.position.set(sx * 0.28, 2.72, 0.56);
      brow.rotation.z = sx * -0.28;
      brow.rotation.y = sx * 0.16;
      body.add(brow);

      const tuft = new THREE.Mesh(earTuftGeo, darkIronMat);
      tuft.position.set(sx * 0.48, 3.04, 0.16);
      tuft.rotation.z = sx * -0.45;
      body.add(tuft);

      const eyeBezel = new THREE.Mesh(eyeBezelGeo, trimMat);
      eyeBezel.position.set(sx * 0.28, 2.55, 0.64);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(sx * 0.28, 2.55, 0.66);
      eye.scale.set(1, 1, 0.65);
      body.add(eyeBezel, eye);

      const talon = new THREE.Mesh(talonGeo, darkIronMat);
      talon.position.set(sx * 0.38, 0.55, 0.25);
      talon.rotation.x = Math.PI;
      body.add(talon);
    }

    const gearHaloOuter = new THREE.Mesh(ringOuterGeo, trimMat);
    gearHaloOuter.position.set(0, 1.98, -0.42);
    const gearHaloInner = new THREE.Mesh(ringInnerGeo, darkIronMat);
    gearHaloInner.position.set(0, 1.98, -0.34);
    body.add(gearHaloOuter, gearHaloInner);

    // Articulated multi-blade wings pivoted from shoulder hubs (helloScene animates wingL/R.rotation.z)
    wingL = new THREE.Mesh(wingHubGeo, darkIronMat);
    wingL.position.set(-0.88, 1.95, 0);
    wingL.castShadow = true;
    for (let f = 0; f < 4; f++) {
      const blade = new THREE.Mesh(f === 0 ? wingBladeGeo : wingTipGeo, f % 2 === 0 ? trimMat : coreMat);
      blade.position.set(-0.95 - f * 0.18, -f * 0.08, -0.14 + f * 0.16);
      blade.rotation.y = 0.24 - f * 0.16;
      blade.rotation.z = -0.06 * f;
      blade.castShadow = true;
      wingL.add(blade);
    }
    body.add(wingL);

    wingR = new THREE.Mesh(wingHubGeo, darkIronMat);
    wingR.position.set(0.88, 1.95, 0);
    wingR.castShadow = true;
    for (let f = 0; f < 4; f++) {
      const blade = new THREE.Mesh(f === 0 ? wingBladeGeo : wingTipGeo, f % 2 === 0 ? trimMat : coreMat);
      blade.position.set(0.95 + f * 0.18, -f * 0.08, -0.14 + f * 0.16);
      blade.rotation.y = -0.24 + f * 0.16;
      blade.rotation.z = 0.06 * f;
      blade.castShadow = true;
      wingR.add(blade);
    }
    body.add(wingR);
  } else {
    // Broad Armored Harbor Bulldog / Sluice Hound Boss with sloped cylindrical armor hull, pauldrons, steam stacks & mandible
    const hullGeo = new THREE.CylinderGeometry(0.62, 0.54, 1.56, 14);
    hullGeo.rotateX(Math.PI * 0.5);
    const chestDomeGeo = new THREE.SphereGeometry(0.62, 14, 12);
    const headGeo = new THREE.SphereGeometry(0.49, 14, 12);
    const snoutGeo = new THREE.BoxGeometry(0.62, 0.34, 0.54);
    const jawGeo = new THREE.BoxGeometry(0.56, 0.16, 0.44);
    const tuskGeo = new THREE.ConeGeometry(0.05, 0.2, 6);
    const collarGeo = new THREE.TorusGeometry(0.54, 0.1, 10, 22);
    const studGeo = new THREE.ConeGeometry(0.065, 0.18, 6);
    const pauldronGeo = new THREE.SphereGeometry(0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const stackGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.56, 8);
    const capCrownGeo = new THREE.CylinderGeometry(0.4, 0.46, 0.24, 14);
    const capVisorGeo = new THREE.CylinderGeometry(0.46, 0.48, 0.06, 14, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
    const legGeo = new THREE.CylinderGeometry(0.17, 0.13, 0.56, 10);
    const pawGeo = new THREE.BoxGeometry(0.26, 0.14, 0.34);
    const eyeBezelGeo = new THREE.TorusGeometry(0.11, 0.028, 6, 12);
    const eyeGeo = new THREE.SphereGeometry(0.09, 10, 10);
    geos.push(
      hullGeo,
      chestDomeGeo,
      headGeo,
      snoutGeo,
      jawGeo,
      tuskGeo,
      collarGeo,
      studGeo,
      pauldronGeo,
      stackGeo,
      capCrownGeo,
      capVisorGeo,
      legGeo,
      pawGeo,
      eyeBezelGeo,
      eyeGeo
    );

    const barrel = new THREE.Mesh(hullGeo, coreMat);
    barrel.position.set(0, 0.92, 0);
    barrel.scale.set(1.12, 0.94, 1.0);
    barrel.castShadow = true;
    body.add(barrel);

    const chestDome = new THREE.Mesh(chestDomeGeo, coreMat);
    chestDome.position.set(0, 0.92, 0.62);
    chestDome.scale.set(1.08, 0.92, 0.72);
    chestDome.castShadow = true;
    body.add(chestDome);

    for (const bz of [-0.36, 0.24]) {
      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.055, 8, 20), trimMat);
      geos.push(strap.geometry);
      strap.position.set(0, 0.92, bz);
      body.add(strap);
    }

    for (const sx of [-0.26, 0.26]) {
      const stack = new THREE.Mesh(stackGeo, trimMat);
      stack.position.set(sx, 1.56, -0.24);
      stack.rotation.x = -0.22;
      stack.castShadow = true;
      body.add(stack);

      const pauldron = new THREE.Mesh(pauldronGeo, trimMat);
      pauldron.position.set(sx * 2.1, 1.08, 0.52);
      pauldron.rotation.z = sx * -0.45;
      pauldron.castShadow = true;
      body.add(pauldron);
    }

    const head = new THREE.Mesh(headGeo, coreMat);
    head.position.set(0, 1.14, 1.05);
    head.scale.set(1.08, 0.92, 0.96);
    head.castShadow = true;
    body.add(head);

    const snout = new THREE.Mesh(snoutGeo, darkIronMat);
    snout.position.set(0, 1.02, 1.42);
    snout.castShadow = true;
    body.add(snout);

    const jaw = new THREE.Mesh(jawGeo, trimMat);
    jaw.position.set(0, 0.84, 1.48);
    body.add(jaw);

    for (const sx of [-1, 1]) {
      const tusk = new THREE.Mesh(tuskGeo, trimMat);
      tusk.position.set(sx * 0.2, 0.96, 1.66);
      tusk.rotation.x = 0.25;
      body.add(tusk);

      const eyeBezel = new THREE.Mesh(eyeBezelGeo, trimMat);
      eyeBezel.position.set(sx * 0.25, 1.24, 1.46);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(sx * 0.25, 1.24, 1.48);
      eye.scale.set(1, 1, 0.65);
      body.add(eyeBezel, eye);
    }

    const brassCollar = new THREE.Mesh(collarGeo, trimMat);
    brassCollar.position.set(0, 1.02, 0.76);
    body.add(brassCollar);

    for (let s = 0; s < 6; s++) {
      const ang = (s / 6) * Math.PI * 2;
      const stud = new THREE.Mesh(studGeo, darkIronMat);
      stud.position.set(Math.cos(ang) * 0.61, 1.02 + Math.sin(ang) * 0.61, 0.76);
      stud.rotation.z = ang - Math.PI * 0.5;
      body.add(stud);
    }

    const cap = new THREE.Mesh(capCrownGeo, trimMat);
    cap.position.set(0, 1.56, 1.05);
    const visor = new THREE.Mesh(capVisorGeo, darkIronMat);
    visor.position.set(0, 1.44, 1.15);
    body.add(cap, visor);

    const legCoords: Array<[number, number]> = [
      [-0.46, 0.56],
      [0.46, 0.56],
      [-0.46, -0.58],
      [0.46, -0.58],
    ];
    for (const [lx, lz] of legCoords) {
      const leg = new THREE.Mesh(legGeo, coreMat);
      leg.position.set(lx, 0.34, lz);
      leg.castShadow = true;
      const paw = new THREE.Mesh(pawGeo, darkIronMat);
      paw.position.set(lx, 0.07, lz + 0.06);
      paw.castShadow = true;
      body.add(leg, paw);
    }
  }

  return {
    root,
    body,
    telegraphRing,
    telegraphMat,
    vulnAura,
    vulnMat,
    coreMat,
    wingL,
    wingR,
    disposables: { geos, mats, textures },
  };
}

export function createArenaAnchorVisual(mats: WorldMaterialSet): AnchorVisual {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#F4A949',
    emissive: new THREE.Color('#D97D1E'),
    emissiveIntensity: 0.55,
    roughness: 0.24,
    metalness: 0.78,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.62, 0.28, 12), mats.darkIron);
  base.position.y = 0.14;
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.22, 12), mats.brassTrim);
  plinth.position.y = 0.38;
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 0.54, 14), mat);
  bell.position.y = 0.78;
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), mat);
  crown.position.y = 1.18;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.055, 8, 24), mat);
  ring.rotation.x = Math.PI * 0.5;
  ring.position.y = 0.78;
  group.add(base, plinth, bell, crown, ring);
  return { group, ring, mat };
}

export function createFerryGondolaVisual(mats: WorldMaterialSet): FerryVisual {
  const root = new THREE.Group();
  const hull = buildCanalSkiff(mats);
  hull.scale.setScalar(1.35);
  root.add(hull);

  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#FFD57E',
    emissive: new THREE.Color('#DF8E2E'),
    emissiveIntensity: 0.78,
    roughness: 0.2,
  });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.85, 8), mats.brassTrim);
  mast.position.set(0, 1.0, 0.95);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), lanternMat);
  orb.position.set(0, 1.98, 0.95);
  root.add(mast, orb);

  const beaconMat = new THREE.MeshBasicMaterial({
    color: '#4CE0B3',
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 28), beaconMat);
  beaconRing.rotation.x = -Math.PI * 0.5;
  beaconRing.position.y = 0.08;
  root.add(beaconRing);

  return { root, lanternMat, beaconRing, beaconMat };
}

export function createRaceRingVisual(index: number): RaceRingVisual {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#F4A949',
    emissive: new THREE.Color('#C97218'),
    emissiveIntensity: 0.58,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 0.45,
  });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.085, 10, 28), mat);
  group.add(torus);
  const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.03, 6, 24), mat);
  group.add(innerRim);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), mat);
  gem.position.y = 1.12 + (index % 2) * 0.02;
  group.add(gem);
  return { group, mat };
}

export function buildSecondaryActWorld(
  actId: Exclude<ActId, 'harbor'>,
  act: ActSpec,
  mats: WorldMaterialSet,
  propAssets: HarborPropAssets,
  natureMats: NatureMaterialSet,
  propMats: PropMaterialSet
): SecondaryActWorld {
  const root = new THREE.Group();
  const surfaces: WalkSurface[] = [];
  const colliders: SolidCollider[] = [];
  const fishSpots: FishSpot[] = [];
  const fishMeshMap = new Map<string, THREE.Object3D[]>();
  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];
  const rotatingGears: Array<{ mesh: THREE.Object3D; speed: number }> = [];
  const orbVisuals: OrbVisualItem[] = [];
  const springPadVisuals: SpringPadVisualItem[] = [];
  const orbDefs: Array<{ id: string; x: number; y: number; z: number; colorHex?: string }> = [];
  const springDefs: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    radius?: number;
    impulseVy?: number;
    forwardBoost?: number;
  }> = [];

  const mechanics: HarborMechanicsState = {
    echoLedges: [],
    waterwheels: [],
    owls: [],
    baitPails: [],
    decoyFish: [],
    flareSpots: [],
    letters: [],
    nests: [],
    stealthGraceTimer: 0,
    nextDecoySeq: 1,
  };

  const echoVisuals: EchoBridgeVisual[] = [];
  const owlVisuals: OwlSearchlightVisual[] = [];
  const pailVisuals: BaitPailVisual[] = [];
  const letterVisuals: THREE.Group[] = [];

  const scaleBoxUVs = (geo: THREE.BoxGeometry, w: number, h: number, d: number, tilePerMeter = 0.24) => {
    const uv = geo.attributes.uv;
    const norm = geo.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      const nx = Math.abs(norm.getX(i));
      const ny = Math.abs(norm.getY(i));
      const u = uv.getX(i);
      const v = uv.getY(i);
      if (ny > 0.5) {
        uv.setXY(i, u * w * tilePerMeter, v * d * tilePerMeter);
      } else if (nx > 0.5) {
        uv.setXY(i, u * d * tilePerMeter, v * h * tilePerMeter);
      } else {
        uv.setXY(i, u * w * tilePerMeter, v * h * tilePerMeter);
      }
    }
    uv.needsUpdate = true;
  };

  const addBiomeTerrace = (
    id: string,
    x: number,
    z: number,
    w: number,
    d: number,
    topY: number,
    wallMat: THREE.Material,
    trimMat: THREE.Material
  ) => {
    const tGroup = new THREE.Group();
    const plinthH = topY + 0.55;
    const baseGeo = new THREE.BoxGeometry(w, plinthH, d);
    scaleBoxUVs(baseGeo, w, plinthH, d, 0.26);
    const deckGeo = new THREE.BoxGeometry(w + 0.16, 0.16, d + 0.16);
    scaleBoxUVs(deckGeo, w + 0.16, 0.16, d + 0.16, 0.3);
    disposableGeos.push(baseGeo, deckGeo);

    const base = new THREE.Mesh(baseGeo, wallMat);
    base.position.y = topY - plinthH * 0.5 - 0.08;
    base.castShadow = true;
    base.receiveShadow = true;

    const deck = new THREE.Mesh(deckGeo, wallMat);
    deck.position.y = topY - 0.08;
    deck.receiveShadow = true;
    tGroup.add(base, deck);

    // Thin decorative perimeter trim rails instead of stretching trim across the whole walking floor
    const railH = 0.18;
    const railT = 0.24;
    const fbGeo = new THREE.BoxGeometry(w + 0.28, railH, railT);
    const lrGeo = new THREE.BoxGeometry(railT, railH, d - 0.1);
    disposableGeos.push(fbGeo, lrGeo);
    for (const sz of [-1, 1]) {
      const r = new THREE.Mesh(fbGeo, trimMat);
      r.position.set(0, topY - 0.07, sz * (d * 0.5 + 0.04));
      tGroup.add(r);
    }
    for (const sx of [-1, 1]) {
      const r = new THREE.Mesh(lrGeo, trimMat);
      r.position.set(sx * (w * 0.5 + 0.04), topY - 0.07, 0);
      tGroup.add(r);
    }

    tGroup.position.set(x, 0, z);
    root.add(tGroup);

    surfaces.push({
      id,
      minX: x - w * 0.5 - 0.12,
      maxX: x + w * 0.5 + 0.12,
      minZ: z - d * 0.5 - 0.12,
      maxZ: z + d * 0.5 + 0.12,
      topY,
      kind: 'roof',
    });
    colliders.push({
      id: `${id}_col`,
      minX: x - w * 0.5,
      maxX: x + w * 0.5,
      minZ: z - d * 0.5,
      maxZ: z + d * 0.5,
      minY: -1.0,
      maxY: Math.max(0.1, topY - 0.12),
    });
  };

  const addQuayPlatform = (id: string, x: number, z: number, w: number, d: number, topY: number) => {
    if (actId === 'cistern') {
      addBiomeTerrace(id, x, z, w, d, topY, mats.biomeStoneGrotto, mats.verdigrisRoof);
      return;
    }
    if (actId === 'spire') {
      addBiomeTerrace(id, x, z, w, d, topY, mats.biomeSandstoneSpire, mats.brassTrim);
      return;
    }
    const q = buildCanalQuayWall(w, d, topY, mats);
    q.position.set(x, 0, z);
    root.add(q);
    surfaces.push({
      id,
      minX: x - w * 0.5 - 0.12,
      maxX: x + w * 0.5 + 0.12,
      minZ: z - d * 0.5 - 0.12,
      maxZ: z + d * 0.5 + 0.12,
      topY,
      kind: 'roof',
    });
    colliders.push({
      id: `${id}_col`,
      minX: x - w * 0.5,
      maxX: x + w * 0.5,
      minZ: z - d * 0.5,
      maxZ: z + d * 0.5,
      minY: -1.0,
      maxY: Math.max(0.1, topY - 0.12),
    });
  };

  const addBuilding = (id: string, x: number, z: number, w: number, d: number, y: number, rail = true) => {
    const mesh = buildRooftopBuilding(w, d, y, mats, true, rail, true);
    mesh.position.set(x, 0, z);
    root.add(mesh);
    const phys = getBuildingPhysics(id, x, z, w, d, y, true);
    surfaces.push({
      id,
      minX: x - w * 0.5 - 0.12,
      maxX: x + w * 0.5 + 0.12,
      minZ: z - d * 0.5 - 0.12,
      maxZ: z + d * 0.5 + 0.12,
      topY: y,
      kind: 'roof',
    });
    if (phys.gableSurface) surfaces.push(phys.gableSurface);
    colliders.push(...phys.colliders);
  };

  const addPipe = (id: string, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
    root.add(buildCopperPipeBridge(x1, y1, z1, x2, y2, z2, mats));
    const axis = Math.abs(z2 - z1) >= Math.abs(x2 - x1) ? 'z' : 'x';
    surfaces.push({
      id,
      minX: Math.min(x1, x2) - 0.65,
      maxX: Math.max(x1, x2) + 0.65,
      minZ: Math.min(z1, z2) - 0.65,
      maxZ: Math.max(z1, z2) + 0.65,
      topY: (y1 + y2) * 0.5,
      kind: 'pipe',
      ramp:
        axis === 'z'
          ? { axis: 'z', startCoord: z1, endCoord: z2, startY: y1, endY: y2 }
          : { axis: 'x', startCoord: x1, endCoord: x2, startY: y1, endY: y2 },
    });
  };

  const addEcho = (id: string, x: number, y: number, z: number, w = 4.6, d = 3.2) => {
    mechanics.echoLedges.push({ id, surfaceId: id, x, y, z, revealTimer: 0 });
    surfaces.push({
      id,
      minX: x - w * 0.5,
      maxX: x + w * 0.5,
      minZ: z - d * 0.5,
      maxZ: z + d * 0.5,
      topY: y,
      kind: 'hidden_echo',
      visible: false,
    });
    const vis = buildEchoBridgeMesh(w, d, mats, propAssets);
    vis.group.position.set(x, y, z);
    root.add(vis.group);
    echoVisuals.push(vis);
  };

  const addFishBoard = (id: string, x: number, y: number, z: number, label: string) => {
    const bg = buildFishCuttingBoard(mats, propAssets, true);
    bg.position.set(x, y, z);
    root.add(bg);
    const meshes = collectStealableFishMeshes(bg);
    fishMeshMap.set(id, meshes);
    fishSpots.push({ id, label, x, y, z, remainingFish: meshes.length, maxFish: meshes.length });
  };

  const addBasket = (id: string, x: number, y: number, z: number, label: string) => {
    const b = buildFishBasket(mats, propAssets);
    b.position.set(x, y, z);
    root.add(b);
    const meshes = collectStealableFishMeshes(b);
    fishMeshMap.set(id, meshes);
    fishSpots.push({ id, label, x, y, z, remainingFish: meshes.length, maxFish: meshes.length });
  };

  const npcState: NpcWorldState = { people: [], dogs: [], birds: [] };

  const addStepCrate = (id: string, x: number, baseY: number, z: number, height = 1.25) => {
    const stepGeo = new THREE.BoxGeometry(1.7, height, 1.7);
    const step = new THREE.Mesh(stepGeo, mats.woodCatwalk);
    step.position.set(x, baseY + height * 0.5, z);
    step.castShadow = true;
    step.receiveShadow = true;
    root.add(step);
    disposableGeos.push(stepGeo);
    surfaces.push({
      id,
      minX: x - 0.88,
      maxX: x + 0.88,
      minZ: z - 0.88,
      maxZ: z + 0.88,
      topY: baseY + height,
      kind: 'roof',
    });
    colliders.push({
      id: `${id}_col`,
      minX: x - 0.82,
      maxX: x + 0.82,
      minZ: z - 0.82,
      maxZ: z + 0.82,
      minY: baseY,
      maxY: baseY + height - 0.06,
    });
  };

  if (actId === 'cistern') {
    // Subterranean Vaulted Mill Cistern: emerald glowing canal, stone piers, catwalk arches, boss arena
    addQuayPlatform('cistern_entry_quay', 0, 24, 14, 12, 2.2);
    addQuayPlatform('cistern_boss_arena', 0, -10, 24, 24, 1.4);
    addQuayPlatform('cistern_ferry_dock', 0, -38, 12, 12, 4.2);

    addBuilding('cistern_west_mill', -16, 6, 8, 22, 2.6, true);
    addBuilding('cistern_east_mill', 16, 6, 8, 22, 2.6, true);
    addBuilding('cistern_west_vault', -14, -18, 8, 14, 4.2, true);
    addBuilding('cistern_east_vault', 14, -18, 8, 14, 4.2, true);

    // Intermediate step crates from boss arena (1.4) toward side vaults (4.2) & catwalks
    addStepCrate('cistern_step_w1', -9.2, 1.4, -15.0, 1.4);
    addStepCrate('cistern_step_e1', 9.2, 1.4, -15.0, 1.4);

    // Grand stone arch & copper pipe connectors
    const bridgeEntry = buildStoneCanalBridge(12, 2.0, 3.4, mats);
    bridgeEntry.position.set(0, 0, 9.0);
    bridgeEntry.rotation.y = Math.PI * 0.5;
    root.add(bridgeEntry);
    surfaces.push({
      id: 'cistern_entry_bridge',
      minX: -1.8,
      maxX: 1.8,
      minZ: 2.0,
      maxZ: 18.0,
      topY: 1.8,
      kind: 'bridge',
    });
    colliders.push({
      id: 'cistern_entry_bridge_deck',
      minX: -1.7,
      maxX: 1.7,
      minZ: 3.0,
      maxZ: 15.0,
      minY: 1.48,
      maxY: 1.74,
    });

    addPipe('cistern_pipe_w', -9.0, 2.2, 20.0, -13.0, 2.6, 15.0);
    addPipe('cistern_pipe_e', 9.0, 2.2, 20.0, 13.0, 2.6, 15.0);
    addPipe('cistern_pipe_nw', -14.0, 4.2, -25.0, -4.5, 4.2, -33.0);
    addPipe('cistern_pipe_ne', 14.0, 4.2, -25.0, 4.5, 4.2, -33.0);
    addPipe('cistern_boss_exit_ramp', 0, 1.4, -22.0, 0, 4.2, -32.0);

    addEcho('cistern_echo_w', -15.0, 3.6, -7.0);
    addEcho('cistern_echo_e', 15.0, 3.6, -7.0);
    addEcho('cistern_echo_mid', 0, 4.2, -27.0);

    // Overhead stone cavern arch pillars & emerald lantern sconces
    const archGeo = new THREE.TorusGeometry(22, 1.8, 10, 28, Math.PI);
    disposableGeos.push(archGeo);
    for (const az of [18, 2, -14, -30]) {
      const arch = new THREE.Mesh(archGeo, mats.biomeStoneGrotto);
      arch.position.set(0, 1.0, az);
      root.add(arch);
    }

    // BIOME OVERHAUL: Emerald Bioluminescent Grotto Rocks, Moss Carpets, Glowing Spore Grass, Mushrooms & Shrines
    const grottoRocks: RockInstanceSpec[] = [
      { x: -12, y: 0.4, z: 22, scaleX: 3.4, scaleY: 3.2, scaleZ: 3.1, rotY: 0.4, colorHex: '#31545C' },
      { x: 12, y: 0.4, z: 22, scaleX: 3.2, scaleY: 2.9, scaleZ: 3.4, rotY: 1.9, colorHex: '#2B4C56' },
      { x: -25, y: 0.6, z: -4, scaleX: 4.8, scaleY: 5.2, scaleZ: 4.6, rotY: 0.8, colorHex: '#223B46' },
      { x: 25, y: 0.6, z: -4, scaleX: 4.8, scaleY: 5.0, scaleZ: 4.6, rotY: 2.3, colorHex: '#24404A' },
      { x: -24, y: 0.6, z: -22, scaleX: 4.5, scaleY: 5.5, scaleZ: 4.2, rotY: 1.2, colorHex: '#1F3640' },
      { x: 24, y: 0.6, z: -22, scaleX: 4.5, scaleY: 5.4, scaleZ: 4.2, rotY: 2.9, colorHex: '#1F3640' },
      { x: -11, y: 0.5, z: -38, scaleX: 3.8, scaleY: 4.6, scaleZ: 3.4, rotY: 0.5, colorHex: '#2A4A52' },
      { x: 11, y: 0.5, z: -38, scaleX: 3.8, scaleY: 4.8, scaleZ: 3.4, rotY: 1.7, colorHex: '#2A4A52' },
      { x: -6.2, y: 1.4, z: -3.2, scaleX: 1.2, scaleY: 0.85, scaleZ: 1.1, rotY: 0.2 },
      { x: 6.4, y: 1.4, z: -16.5, scaleX: 1.15, scaleY: 0.8, scaleZ: 1.25, rotY: 1.1 },
    ];
    const rockInst = buildRockField(grottoRocks, natureMats);
    disposableGeos.push(rockInst.geometry);
    root.add(rockInst.mesh);

    const grottoMoss: MossPatchSpec[] = [
      { x: -3.5, y: 2.2, z: 24.5, radius: 1.9, rotY: 0.3 },
      { x: 3.4, y: 2.2, z: 21.0, radius: 2.1, rotY: 1.7 },
      { x: -7.5, y: 1.4, z: -12.0, radius: 2.4, rotY: 0.8 },
      { x: 7.5, y: 1.4, z: -8.5, radius: 2.6, rotY: 2.2 },
      { x: -4.2, y: 1.4, z: -19.2, radius: 2.2, rotY: 1.1 },
      { x: 4.2, y: 1.4, z: -19.2, radius: 2.2, rotY: 2.9 },
      { x: -15.5, y: 2.6, z: 7.5, radius: 2.0, rotY: 0.5 },
      { x: 15.5, y: 2.6, z: 7.5, radius: 2.0, rotY: 1.4 },
      { x: -2.8, y: 4.2, z: -35.5, radius: 1.8, rotY: 2.0 },
      { x: 2.8, y: 4.2, z: -35.5, radius: 1.8, rotY: 0.9 },
    ];
    const mossInst = buildMossCarpetField(grottoMoss, natureMats);
    disposableGeos.push(mossInst.geometry);
    root.add(mossInst.mesh);

    const grottoGrass: GrassPatchSpec[] = [];
    const grottoClusters: Array<[number, number, number, number]> = [
      [-4.8, 2.2, 22.8, 8],
      [4.8, 2.2, 22.8, 8],
      [-7.6, 1.4, -12.0, 10],
      [7.6, 1.4, -8.5, 10],
      [-5.2, 1.4, -18.5, 9],
      [5.2, 1.4, -18.5, 9],
      [-3.5, 4.2, -36.0, 8],
      [3.5, 4.2, -36.0, 8],
    ];
    for (let c = 0; c < grottoClusters.length; c++) {
      const [cx, cy, cz, count] = grottoClusters[c];
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + c * 0.7;
        const rad = 0.25 + ((k * 31) % 7) * 0.14;
        grottoGrass.push({
          x: cx + Math.cos(ang) * rad,
          y: cy,
          z: cz + Math.sin(ang) * rad,
          height: 0.42 + ((k * 17) % 4) * 0.1,
          scaleXZ: 0.95 + (k % 3) * 0.14,
          rotY: ang + c,
        });
      }
    }
    const grassInst = buildInstancedGrassField(grottoGrass, natureMats, true);
    disposableGeos.push(grassInst.geometry);
    root.add(grassInst.mesh);

    // Scenic Bioluminescent Mushrooms & Bouncy Mushroom SpringPads
    for (const [mx, my, mz, sc] of [
      [-5.6, 2.2, 21.0, 0.85],
      [5.6, 2.2, 21.0, 0.82],
      [-11.2, 1.4, -0.5, 0.95],
      [11.2, 1.4, -0.5, 0.9],
      [-4.8, 4.2, -39.5, 0.9],
      [4.8, 4.2, -39.5, 0.9],
    ]) {
      const m = buildBioluminescentMushroom(sc, propMats, false);
      disposableGeos.push(...m.geos);
      m.group.position.set(mx, my, mz);
      root.add(m.group);
    }

    const grottoSprings = [
      { id: 'cistern_shroom_w', x: -10.2, y: 1.4, z: -13.0, radius: 1.35, impulseVy: 11.4, forwardBoost: 2.2 },
      { id: 'cistern_shroom_e', x: 10.2, y: 1.4, z: -13.0, radius: 1.35, impulseVy: 11.4, forwardBoost: 2.2 },
      { id: 'cistern_shroom_exit', x: 0.0, y: 1.4, z: -21.0, radius: 1.4, impulseVy: 11.8, forwardBoost: 3.0 },
    ];
    for (const sp of grottoSprings) {
      springDefs.push(sp);
      const mush = buildBioluminescentMushroom(1.45, propMats, true);
      disposableGeos.push(...mush.geos);
      mush.group.position.set(sp.x, sp.y - 0.18, sp.z);
      mush.group.userData.noBatch = true;
      root.add(mush.group);
      springPadVisuals.push({
        padId: sp.id,
        group: mush.group,
        capMesh: mush.capMesh,
        baseCapY: mush.capMesh.position.y,
      });
    }

    // Sanctuary Shrines with Velvet Drapes, Parchment Tomes, Amber Glass & Glazed Ceramics (LOD)
    for (const [sx, sy, sz, ry] of [
      [-5.2, 2.2, 27.2, 0.35],
      [5.2, 4.2, -41.5, -0.35],
    ]) {
      const shrine = buildSanctuaryShrineLOD(propMats);
      disposableGeos.push(...shrine.disposables);
      shrine.lod.position.set(sx, sy, sz);
      shrine.lod.rotation.y = ry;
      shrine.lod.userData.noBatch = true;
      root.add(shrine.lod);
    }

    // Spirit Dew-Drop Orbs across cavern paths
    orbDefs.push(
      { id: 'cistern_orb_1', x: 0, y: 2.8, z: 11.0, colorHex: '#48FFD0' },
      { id: 'cistern_orb_2', x: -16.0, y: 3.6, z: 6.0, colorHex: '#48FFD0' },
      { id: 'cistern_orb_3', x: 16.0, y: 3.6, z: 6.0, colorHex: '#48FFD0' },
      { id: 'cistern_orb_4', x: -14.0, y: 5.2, z: -14.0, colorHex: '#7EFFB2' },
      { id: 'cistern_orb_5', x: 14.0, y: 5.2, z: -14.0, colorHex: '#7EFFB2' },
      { id: 'cistern_orb_6', x: 0, y: 5.4, z: -29.0, colorHex: '#FFE07A' }
    );

    // Giant bronze rotating sluice gears along walls
    for (const [gx, gy, gz, spd] of [
      [-21, 5.2, -10, 0.25],
      [21, 5.2, -10, -0.25],
      [0, 8.5, -45, 0.18],
    ] as const) {
      const g = buildClockworkGear(4.2, 18, 0.55, mats);
      g.position.set(gx, gy, gz);
      if (Math.abs(gx) > 5) g.rotation.y = Math.PI * 0.5;
      root.add(g);
      rotatingGears.push({ mesh: g, speed: spd });
    }

    for (const [lx, ly, lz] of [
      [-4.2, 2.2, 22],
      [4.2, 2.2, 22],
      [-10.5, 1.4, -4],
      [10.5, 1.4, -4],
      [-4.2, 4.2, -35],
      [4.2, 4.2, -35],
    ]) {
      const l = buildLanternPost(mats, true);
      l.position.set(lx, ly, lz);
      root.add(l);
    }

    // Fish, Bait Pails, Nests, Letters, Owls, People, Dogs
    addFishBoard('cistern_fish_1', -3.5, 2.2, 22.0, 'свежей подземной форели');
    addFishBoard('cistern_fish_2', -15.5, 2.6, 2.0, 'вяленого угря');
    addBasket('cistern_fish_3', 15.5, 2.6, 4.0, 'корзины шлюзового улова');
    addBasket('cistern_fish_4', 4.5, 1.4, -17.5, 'армейского пайка');

    mechanics.baitPails.push(
      { id: 'cistern_pail_1', x: -5.5, y: 1.4, z: -2.5, tipped: false, respawnTimer: 0 },
      { id: 'cistern_pail_2', x: 5.5, y: 1.4, z: -14.5, tipped: false, respawnTimer: 0 }
    );
    mechanics.nests.push(
      { id: 'cistern_nest_1', label: 'Сухая ниша у шлюза', x: 3.2, y: 2.2, z: 26.5 },
      { id: 'cistern_nest_2', label: 'Тёплый войлок у свода', x: -13.5, y: 4.2, z: -18.0 }
    );
    mechanics.letters.push(
      {
        id: 'cistern_l1',
        title: 'Записка Марко · Подземный шлюз',
        text: '«Под каналами скрыты древние мельничные своды. Отбивай звон [E] у якорей, чтобы сбить броню стража!»',
        x: -16.0,
        y: 2.6,
        z: 10.0,
        collected: false,
      },
      {
        id: 'cistern_l2',
        title: 'Записка Марко · Эхо подземелья',
        text: '«Туман под землёй держит звук дольше — хрустальные мосты выводят прямо к подъёмнику Шпиля.»',
        x: 14.0,
        y: 4.2,
        z: -16.0,
        collected: false,
      },
      {
        id: 'cistern_l3',
        title: 'Записка Марко · Ключ от лифта',
        text: '«Капитан Железнорыл боится громкого колокольного звона и ударного когтя!»',
        x: 3.0,
        y: 4.2,
        z: -36.5,
        collected: false,
      }
    );

    mechanics.owls.push({
      id: 'cistern_owl_1',
      pivotX: 0,
      pivotY: 6.2,
      pivotZ: -20.0,
      baseYaw: 0,
      sweepAngle: 0,
      sweepSpan: 0.9,
      sweepSpeed: 0.72,
      phase: 0.5,
      groundY: 1.4,
      spotDist: 5.5,
      spotRadius: 2.2,
      spotX: 0,
      spotZ: -14.5,
      suspicion: 0,
      catInBeam: false,
      stealthSynced: false,
    });

    npcState.people.push(
      createPersonNpc('cistern_keeper', 'fisherman', '#3D6A62', [{ x: -2.8, y: 2.2, z: 22.8, pauseSec: 3.0 }], true, 0.2),
      createPersonNpc('cistern_engineer', 'stroller', '#A3663B', [{ x: 15.0, y: 2.6, z: 9.0, pauseSec: 2.5 }, { x: 15.0, y: 2.6, z: -1.0, pauseSec: 2.5 }], false, -1.2)
    );
    npcState.dogs.push(
      createDogNpc(
        'cistern_dog_1',
        '#6E513A',
        [
          { x: -15.5, y: 2.6, z: 10.0, pauseSec: 1.4 },
          { x: -15.5, y: 2.6, z: -2.0, pauseSec: 1.4 },
        ],
        { minX: -19.5, maxX: -12.5, minZ: -4.5, maxZ: 16.0 }
      ),
      createDogNpc(
        'cistern_dog_2',
        '#4C4A47',
        [
          { x: 15.5, y: 2.6, z: 12.0, pauseSec: 1.4 },
          { x: 15.5, y: 2.6, z: 0.0, pauseSec: 1.4 },
        ],
        { minX: 12.5, maxX: 19.5, minZ: -4.5, maxZ: 16.0 }
      )
    );
    npcState.birds.push(
      createPerchedBirdNpc('cistern_pigeon_1', 'pigeon', 2.4, 2.2, 20.5, 2.2),
      createPerchedBirdNpc('cistern_pigeon_2', 'pigeon', -12.8, 4.2, -16.0, 0.4)
    );
  } else {
    // ACT III: Grand Clockwork Belfry & Floating Twilight Festival Barges (Vertical Ascent)
    addQuayPlatform('spire_entry_barge', 0, 26, 12, 10, 2.0);
    addBuilding('spire_step_east', 12, 18, 8, 8, 3.6, true);
    addBuilding('spire_step_mid', 0, 8, 10, 9, 5.4, true);
    addBuilding('spire_step_west', -12, 0, 8, 9, 7.4, true);
    addBuilding('spire_belfry_ledge', -9, -10, 7, 7, 9.4, true);
    addQuayPlatform('spire_summit_arena', 0, -18, 22, 22, 11.2);

    // Ascending wooden/clockwork step-crates for multi-step climbs even without double jump
    addStepCrate('spire_crate_1', 9.0, 3.6, 15.0, 1.0);
    addStepCrate('spire_crate_2', -3.6, 5.4, 5.0, 1.1);
    addStepCrate('spire_crate_3', -10.5, 7.4, -3.5, 1.1);
    addStepCrate('spire_crate_4', -7.0, 9.4, -12.0, 1.0);

    // Ascending copper walkways connecting floating barges & clockwork spire terraces
    addPipe('spire_pipe_1', 3.5, 2.0, 22.0, 9.0, 3.6, 19.0);
    addPipe('spire_pipe_2', 9.0, 3.6, 15.0, 4.5, 5.4, 11.0);
    addPipe('spire_pipe_3', -4.5, 5.4, 6.0, -9.0, 7.4, 3.5);
    addPipe('spire_pipe_4', -11.0, 7.4, -4.0, -9.5, 9.4, -7.0);
    addPipe('spire_pipe_5', -7.0, 9.4, -12.0, -4.5, 11.2, -15.0);

    addEcho('spire_echo_direct_1', 0, 4.2, 16.5);
    addEcho('spire_echo_direct_2', 0, 8.2, -2.5);
    addEcho('spire_echo_summit', 9.0, 10.6, -9.0);

    // BIOME OVERHAUL: Crimson-Gold Clockwork Sky Sanctuary (Sandstone Cliffs, Autumn Trees, Golden Sky Meadow, Shrines & Spring Canopies)
    const spireRocks: RockInstanceSpec[] = [
      { x: -9.5, y: 0.4, z: 25, scaleX: 2.6, scaleY: 2.8, scaleZ: 2.4, rotY: 0.6, colorHex: '#9C7C60' },
      { x: 9.5, y: 0.4, z: 25, scaleX: 2.8, scaleY: 3.1, scaleZ: 2.5, rotY: 2.1, colorHex: '#8E6F56' },
      { x: -16.0, y: 1.0, z: -2.0, scaleX: 3.4, scaleY: 5.5, scaleZ: 3.2, rotY: 1.4, colorHex: '#7A6252' },
      { x: 16.0, y: 1.0, z: 16.0, scaleX: 3.0, scaleY: 3.4, scaleZ: 3.0, rotY: 0.3, colorHex: '#8C6E58' },
      { x: -14.0, y: 6.5, z: -18.0, scaleX: 3.6, scaleY: 4.8, scaleZ: 3.4, rotY: 2.5, colorHex: '#7D6555' },
      { x: 14.0, y: 6.5, z: -18.0, scaleX: 3.6, scaleY: 4.8, scaleZ: 3.4, rotY: 0.9, colorHex: '#7D6555' },
    ];
    const spireRockField = buildRockField(spireRocks, natureMats);
    disposableGeos.push(spireRockField.geometry);
    root.add(spireRockField.mesh);

    const spireGrass: GrassPatchSpec[] = [];
    const spireClusters: Array<[number, number, number, number]> = [
      [-4.2, 2.0, 28.0, 9],
      [4.2, 2.0, 28.0, 9],
      [-4.4, 2.0, 22.8, 8],
      [4.4, 2.0, 22.8, 8],
      [14.2, 3.6, 19.8, 9],
      [-8.5, 11.2, -25.2, 10],
      [8.5, 11.2, -25.2, 10],
    ];
    for (let c = 0; c < spireClusters.length; c++) {
      const [cx, cy, cz, count] = spireClusters[c];
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + c * 0.5;
        const rad = 0.28 + ((k * 23) % 6) * 0.14;
        spireGrass.push({
          x: cx + Math.cos(ang) * rad,
          y: cy,
          z: cz + Math.sin(ang) * rad,
          height: 0.4 + ((k * 13) % 4) * 0.1,
          scaleXZ: 0.95 + (k % 3) * 0.12,
          rotY: ang,
          colorHex: k % 3 === 0 ? '#D99B4E' : '#7FA663',
        });
      }
    }
    const spireGrassField = buildInstancedGrassField(spireGrass, natureMats, false);
    disposableGeos.push(spireGrassField.geometry);
    root.add(spireGrassField.mesh);

    // Autumn Cypress & Olive LOD Trees framing the ascending Sanctuary terraces
    const spireTrees: Array<[number, number, number, 'autumn_cypress' | 'olive', number]> = [
      [-4.6, 2.0, 29.2, 'autumn_cypress', 1],
      [4.6, 2.0, 29.2, 'autumn_cypress', 2],
      [14.5, 3.6, 20.5, 'olive', 3],
      [-14.5, 7.4, 2.5, 'autumn_cypress', 4],
      [-9.5, 11.2, -26.5, 'autumn_cypress', 5],
      [9.5, 11.2, -26.5, 'olive', 6],
    ];
    for (const [tx, ty, tz, kind, seedIdx] of spireTrees) {
      const t = buildBiomeTreeLOD(kind, natureMats, seedIdx);
      disposableGeos.push(...t.disposables);
      t.lod.position.set(tx, ty, tz);
      t.lod.userData.noBatch = true;
      root.add(t.lod);
    }

    // Sky Sanctuary LOD Shrines & Glazed Ceramic Amphorae
    for (const [sx, sy, sz, ry] of [
      [-4.6, 2.0, 22.5, 0.4],
      [-8.5, 11.2, -23.0, 0.6],
    ]) {
      const shrine = buildSanctuaryShrineLOD(propMats);
      disposableGeos.push(...shrine.disposables);
      shrine.lod.position.set(sx, sy, sz);
      shrine.lod.rotation.y = ry;
      shrine.lod.userData.noBatch = true;
      root.add(shrine.lod);
    }
    for (const [ax, ay, az] of [
      [4.8, 2.0, 22.5],
      [14.2, 3.6, 15.2],
      [9.2, 11.2, -24.5],
    ]) {
      const amph = buildAmphoraClusterLOD(propMats);
      disposableGeos.push(...amph.disposables);
      amph.lod.position.set(ax, ay, az);
      amph.lod.userData.noBatch = true;
      root.add(amph.lod);
    }

    // Silk-Brass Spring Canopies for thrilling vertical leaps up the belfry
    const spireSprings = [
      { id: 'spire_canopy_1', x: 6.4, y: 3.6, z: 14.5, radius: 1.35, impulseVy: 11.2, forwardBoost: 2.5 },
      { id: 'spire_canopy_2', x: -10.8, y: 7.4, z: 2.2, radius: 1.35, impulseVy: 11.6, forwardBoost: 2.6 },
    ];
    for (const sp of spireSprings) {
      springDefs.push(sp);
      const canopy = buildSpringCanopyPad(sp.radius, propMats);
      disposableGeos.push(...canopy.geos);
      canopy.group.position.set(sp.x, sp.y, sp.z);
      canopy.group.userData.noBatch = true;
      root.add(canopy.group);
      springPadVisuals.push({
        padId: sp.id,
        group: canopy.group,
        capMesh: canopy.capMesh,
        baseCapY: canopy.capMesh.position.y,
      });
    }

    // Golden Spirit Dew-Drop Orbs across the Clockwork Spire ascent
    orbDefs.push(
      { id: 'spire_orb_1', x: 6.2, y: 3.8, z: 20.5, colorHex: '#FFE07A' },
      { id: 'spire_orb_2', x: 6.5, y: 6.4, z: 12.5, colorHex: '#FFB64C' },
      { id: 'spire_orb_3', x: -6.5, y: 7.4, z: 4.5, colorHex: '#FFE07A' },
      { id: 'spire_orb_4', x: -10.0, y: 10.2, z: -6.0, colorHex: '#48FFD0' },
      { id: 'spire_orb_5', x: -6.5, y: 12.2, z: -13.5, colorHex: '#FFE07A' },
      { id: 'spire_orb_6', x: 8.5, y: 12.2, z: -18.0, colorHex: '#FFB64C' }
    );

    // Giant majestic golden clockwork rings rotating around the Summit Carillon
    for (const [gx, gy, gz, rad, spd] of [
      [0, 14.5, -31, 6.8, 0.22],
      [-14, 10.0, -18, 4.2, -0.32],
      [14, 10.0, -18, 4.2, 0.32],
    ] as const) {
      const g = buildClockworkGear(rad, 22, 0.65, mats);
      g.position.set(gx, gy, gz);
      if (Math.abs(gx) > 5) g.rotation.y = Math.PI * 0.5;
      root.add(g);
      rotatingGears.push({ mesh: g, speed: spd });
    }

    for (const [lx, ly, lz] of [
      [-4.0, 2.0, 24],
      [4.0, 2.0, 24],
      [0.0, 5.4, 10],
      [-10.0, 7.4, 2],
      [-8.5, 11.2, -11],
      [8.5, 11.2, -11],
      [0.0, 11.2, -27],
    ]) {
      const l = buildLanternPost(mats, true);
      l.position.set(lx, ly, lz);
      root.add(l);
    }

    const skiff = buildCanalSkiff(mats);
    skiff.position.set(-7.5, 0.05, 22.0);
    root.add(skiff);

    addFishBoard('spire_fish_1', -3.0, 2.0, 23.0, 'звёздной скумбрии');
    addFishBoard('spire_fish_2', 11.5, 3.6, 17.0, 'копчёного леща');
    addBasket('spire_fish_3', -1.5, 5.4, 8.5, 'корзины звонаря');
    addBasket('spire_fish_4', 7.5, 11.2, -14.5, 'золотых анчоусов вершины');

    mechanics.baitPails.push(
      { id: 'spire_pail_1', x: 2.5, y: 5.4, z: 7.0, tipped: false, respawnTimer: 0 },
      { id: 'spire_pail_2', x: -6.5, y: 11.2, z: -18.0, tipped: false, respawnTimer: 0 }
    );
    mechanics.nests.push(
      { id: 'spire_nest_1', label: 'Тёплый гамак у причала', x: 3.5, y: 2.0, z: 27.5 },
      { id: 'spire_nest_2', label: 'Шёлковая подушка курантов', x: -7.5, y: 11.2, z: -24.5 }
    );
    mechanics.letters.push(
      {
        id: 'spire_l1',
        title: 'Записка Марко · Небесный подъём',
        text: '«Последняя башня уходит в звёздное небо. Используй воздушный двойной прыжок и эхо-мосты!»',
        x: 12.0,
        y: 3.6,
        z: 18.0,
        collected: false,
      },
      {
        id: 'spire_l2',
        title: 'Записка Марко · Великий Филин',
        text: '«Механический Филин боится Вспышки Зари [4] и звона на Небесных Якорях!»',
        x: -12.0,
        y: 7.4,
        z: 0.0,
        collected: false,
      },
      {
        id: 'spire_l3',
        title: 'Записка Марко · Сердце курантов',
        text: '«Когда замолкнет Золотой Филин, весь рассвет над Венецией станет твоим!»',
        x: 6.0,
        y: 11.2,
        z: -24.0,
        collected: false,
      }
    );

    mechanics.owls.push({
      id: 'spire_owl_mid',
      pivotX: 0,
      pivotY: 9.2,
      pivotZ: 4.0,
      baseYaw: 0,
      sweepAngle: 0,
      sweepSpan: 0.85,
      sweepSpeed: 0.88,
      phase: 1.2,
      groundY: 5.4,
      spotDist: 4.0,
      spotRadius: 2.0,
      spotX: 0,
      spotZ: 8.0,
      suspicion: 0,
      catInBeam: false,
      stealthSynced: false,
    });

    npcState.people.push(
      createPersonNpc('spire_clockmaker', 'stroller', '#C58A48', [{ x: -2.2, y: 2.0, z: 24.5, pauseSec: 3.0 }], false, 0.3)
    );
    npcState.dogs.push(
      createDogNpc(
        'spire_dog_mid',
        '#8E5B3A',
        [
          { x: -3.2, y: 5.4, z: 8.0, pauseSec: 1.6 },
          { x: 3.2, y: 5.4, z: 8.0, pauseSec: 1.6 },
        ],
        { minX: -4.8, maxX: 4.8, minZ: 4.0, maxZ: 12.0 }
      )
    );
    npcState.birds.push(
      createSoaringBirdNpc('spire_gull_1', 0, -14, 16.5, 18, 0.36, 0),
      createSoaringBirdNpc('spire_gull_2', 0, -14, 18.0, 22, -0.3, 2.2),
      createPerchedBirdNpc('spire_pigeon_1', 'pigeon', 3.0, 2.0, 23.0, 2.4)
    );
  }

  for (const l of mechanics.letters) {
    const lv = buildMarcoLetterMesh(mats, propAssets);
    lv.position.set(l.x, l.y + 0.42, l.z);
    root.add(lv);
    letterVisuals.push(lv);
  }

  for (const pail of mechanics.baitPails) {
    const pv = buildBaitPail(mats, propAssets);
    pv.root.position.set(pail.x, pail.y, pail.z);
    root.add(pv.root);
    pailVisuals.push(pv);
  }

  for (const nest of mechanics.nests) {
    const nv = buildCozyNestMesh(mats, propAssets);
    nv.position.set(nest.x, nest.y, nest.z);
    root.add(nv);
  }

  for (const owl of mechanics.owls) {
    const postH = Math.max(1.2, owl.pivotY - owl.groundY);
    const oVis = buildOwlSearchlightRig(mats, propAssets, postH);
    oVis.pivot.position.set(owl.pivotX, owl.pivotY, owl.pivotZ);
    oVis.stanchion.position.set(owl.pivotX, owl.pivotY - postH * 0.5 - 0.12, owl.pivotZ);
    oVis.collar.position.set(owl.pivotX, owl.pivotY - 0.22, owl.pivotZ);
    oVis.spotRing.position.set(owl.spotX, owl.groundY + 0.04, owl.spotZ);
    root.add(oVis.root);
    owlVisuals.push(oVis);
  }

  // Instantiate Dew-Drop Spirit Orbs & pure BiomeMechanics state
  for (const od of orbDefs) {
    const ov = buildSpiritDewOrb(propMats, od.colorHex);
    disposableGeos.push(...ov.geos);
    disposableMats.push(...ov.mats);
    ov.group.position.set(od.x, od.y, od.z);
    ov.group.userData.noBatch = true;
    root.add(ov.group);
    orbVisuals.push({
      orbId: od.id,
      group: ov.group,
      ringMesh: ov.ringMesh,
      dropMesh: ov.dropMesh,
    });
  }
  const biomeMechanics = createBiomeMechanicsState(orbDefs, springDefs);

  // Mooring posts around ferry/spawn for scenic grounding
  root.add(buildCanalMooringPost(act.ferry.x - 2.6, act.ferry.z + 1.8, 1.6, mats));
  root.add(buildCanalMooringPost(act.ferry.x + 2.6, act.ferry.z + 1.8, 1.6, mats));

  return {
    root,
    surfaces,
    colliders,
    fishSpots,
    fishMeshMap,
    npcState,
    mechanics,
    biomeMechanics,
    orbVisuals,
    springPadVisuals,
    echoVisuals,
    owlVisuals,
    pailVisuals,
    letterVisuals,
    rotatingGears,
    disposableGeos,
    disposableMats,
  };
}
