import * as THREE from 'three';
import type { BirdNpcState, DogNpcState, PersonNpcState } from '../systems/npcSystem';
import type { WorldMaterialSet } from './materials';

export interface PersonRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  rodGroup: THREE.Group | null;
  bobber: THREE.Mesh | null;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

export interface DogRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  earL: THREE.Mesh;
  earR: THREE.Mesh;
  tail: THREE.Group;
  legFL: THREE.Group;
  legFR: THREE.Group;
  legBL: THREE.Group;
  legBR: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

export interface BirdRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  wingL: THREE.Group;
  wingR: THREE.Group;
  shadow: THREE.Mesh;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

function makeNpcCanvasPair(
  size: number,
  repeatX: number,
  repeatY: number,
  painter: (albedo: CanvasRenderingContext2D, bump: CanvasRenderingContext2D, s: number) => void
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const cA = document.createElement('canvas');
  const cB = document.createElement('canvas');
  cA.width = cB.width = size;
  cA.height = cB.height = size;
  const ctxA = cA.getContext('2d')!;
  const ctxB = cB.getContext('2d')!;
  painter(ctxA, ctxB, size);
  const map = new THREE.CanvasTexture(cA);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(cB);
  map.wrapS = map.wrapT = bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  bumpMap.repeat.set(repeatX, repeatY);
  return { map, bumpMap };
}

export function createPersonRig(
  npc: PersonNpcState,
  mats: WorldMaterialSet,
  isSoftwareGl = false
): PersonRig {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const woolPair = makeNpcCanvasPair(96, 3, 3, (a, b, s) => {
    a.fillStyle = npc.coatColor;
    a.fillRect(0, 0, s, s);
    b.fillStyle = '#808080';
    b.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      a.fillStyle = y % 6 === 0 ? 'rgba(0,0,0,0.14)' : 'rgba(255,245,230,0.08)';
      a.fillRect(0, y, s, 1.5);
      b.fillStyle = y % 6 === 0 ? '#686868' : '#A4A4A4';
      b.fillRect(0, y, s, 1.5);
    }
    for (let x = 0; x < s; x += 3) {
      a.fillStyle = x % 6 === 0 ? 'rgba(0,0,0,0.09)' : 'rgba(255,250,240,0.06)';
      a.fillRect(x, 0, 1.5, s);
      b.fillStyle = x % 6 === 0 ? '#747474' : '#969696';
      b.fillRect(x, 0, 1.5, s);
    }
  });
  const apronColor = npc.role === 'vendor' ? '#C7B69A' : '#3C5954';
  const linenPair = makeNpcCanvasPair(96, 2, 2, (a, b, s) => {
    a.fillStyle = apronColor;
    a.fillRect(0, 0, s, s);
    b.fillStyle = '#808080';
    b.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 4) {
      a.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
      a.fillRect(0, y, s, 2);
      b.fillStyle = y % 8 === 0 ? '#9C9C9C' : '#6A6A6A';
      b.fillRect(0, y, s, 2);
    }
    // Woven hem border stripe
    a.fillStyle = 'rgba(218, 165, 86, 0.34)';
    a.fillRect(0, s - 10, s, 4);
  });
  textures.push(woolPair.map, woolPair.bumpMap, linenPair.map, linenPair.bumpMap);

  const coatMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: woolPair.map,
    bumpMap: woolPair.bumpMap,
    bumpScale: 0.016,
    roughness: 0.84,
    metalness: 0.04,
    sheen: 0.45,
    sheenRoughness: 0.72,
    sheenColor: new THREE.Color(npc.coatColor).lerp(new THREE.Color('#ffffff'), 0.35),
  });
  const trouserMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#233238'),
    bumpMap: woolPair.bumpMap,
    bumpScale: 0.012,
    roughness: 0.86,
    metalness: 0.04,
  });
  // Hair & Feather alpha card mask helper
  const hairAlphaCanvas = document.createElement('canvas');
  hairAlphaCanvas.width = hairAlphaCanvas.height = 64;
  {
    const ctx = hairAlphaCanvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    for (let x = 2; x < 62; x += 4) {
      const len = 36 + ((x * 13) % 24);
      const grad = ctx.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.7, '#B8B8B8');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, 3, len);
    }
  }
  const hairAlphaTex = new THREE.CanvasTexture(hairAlphaCanvas);
  textures.push(hairAlphaTex);

  const skinMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D5A687'),
    roughness: 0.56,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.64,
    sheenColor: new THREE.Color('#FF9E7D'),
    transmission: isSoftwareGl ? 0 : 0.14,
    thickness: 0.35,
  });
  const hairMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#352720'),
    bumpMap: woolPair.bumpMap,
    bumpScale: 0.018,
    roughness: 0.48,
    metalness: 0.05,
    anisotropy: 0.72,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
  });
  const hairCardMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#3F2E26'),
    alphaMap: hairAlphaTex,
    transparent: true,
    alphaTest: 0.2,
    roughness: 0.42,
    anisotropy: 0.78,
    side: THREE.DoubleSide,
  });
  const leatherMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2B201A'),
    roughness: 0.42,
    metalness: 0.06,
    clearcoat: 0.62,
    clearcoatRoughness: 0.28,
  });
  const apronMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: linenPair.map,
    bumpMap: linenPair.bumpMap,
    bumpScale: 0.012,
    roughness: 0.86,
    metalness: 0.02,
    sheen: 0.35,
    sheenRoughness: 0.75,
  });
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x161a1d,
    roughness: 0.08,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });
  materials.push(coatMat, trouserMat, skinMat, hairMat, hairCardMat, leatherMat, apronMat, eyeMat);

  // Articulated legs + rounded leather boots
  const thighGeo = new THREE.CapsuleGeometry(0.066, 0.3, 6, 10);
  const calfGeo = new THREE.CapsuleGeometry(0.056, 0.28, 6, 10);
  const bootGeo = new THREE.CapsuleGeometry(0.062, 0.11, 6, 8);
  bootGeo.rotateX(Math.PI * 0.5);
  geometries.push(thighGeo, calfGeo, bootGeo);

  const makeLeg = (sx: number): THREE.Group => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.088, 0.78, 0);
    const thigh = new THREE.Mesh(thighGeo, trouserMat);
    thigh.position.y = -0.19;
    thigh.castShadow = true;
    hip.add(thigh);

    const calf = new THREE.Mesh(calfGeo, trouserMat);
    calf.position.y = -0.49;
    calf.castShadow = true;
    hip.add(calf);

    const boot = new THREE.Mesh(bootGeo, mats.darkIron);
    boot.position.set(0, -0.71, 0.045);
    boot.scale.set(0.95, 0.82, 1.15);
    boot.castShadow = true;
    hip.add(boot);
    root.add(hip);
    return hip;
  };

  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  // Torso, coat, waist belt & scarf
  const torso = new THREE.Group();
  torso.position.set(0, 0.8, 0);
  root.add(torso);

  const chestGeo = new THREE.CylinderGeometry(0.185, 0.145, 0.54, 14);
  const beltGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.065, 14);
  const shoulderCapGeo = new THREE.SphereGeometry(0.054, 10, 8);
  const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.12, 10);
  geometries.push(chestGeo, beltGeo, shoulderCapGeo, neckGeo);

  const chest = new THREE.Mesh(chestGeo, coatMat);
  chest.position.y = 0.29;
  chest.scale.set(1.12, 1.0, 0.78);
  chest.castShadow = true;
  chest.receiveShadow = true;
  torso.add(chest);

  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.y = 0.08;
  belt.scale.set(1.12, 1.0, 0.82);
  torso.add(belt);

  const apronGeo = new THREE.BoxGeometry(0.28, 0.44, 0.035);
  geometries.push(apronGeo);
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.set(0, 0.16, 0.12);
  torso.add(apron);

  const scarfGeo = new THREE.TorusGeometry(0.115, 0.036, 8, 14);
  geometries.push(scarfGeo);
  const scarf = new THREE.Mesh(scarfGeo, apronMat);
  scarf.rotation.x = Math.PI * 0.5;
  scarf.position.y = 0.56;
  torso.add(scarf);

  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.59;
  torso.add(neck);

  // Head + hair + brimmed hat with leather band
  const head = new THREE.Group();
  head.position.set(0, 0.71, 0.01);
  torso.add(head);

  const skullGeo = new THREE.SphereGeometry(0.122, 14, 12);
  const hairGeo = new THREE.SphereGeometry(0.126, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const noseGeo = new THREE.ConeGeometry(0.02, 0.055, 6);
  const eyeGeo = new THREE.SphereGeometry(0.014, 8, 6);
  geometries.push(skullGeo, hairGeo, noseGeo, eyeGeo);

  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.scale.set(0.9, 1.08, 0.96);
  skull.castShadow = true;
  head.add(skull);

  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.rotation.x = -0.32;
  hair.position.set(0, 0.01, -0.015);
  head.add(hair);

  const strandCardGeo = new THREE.PlaneGeometry(0.14, 0.12);
  geometries.push(strandCardGeo);
  for (const sx of [-1, 1]) {
    const strand = new THREE.Mesh(strandCardGeo, hairCardMat);
    strand.position.set(sx * 0.11, 0.01, -0.02);
    strand.rotation.y = sx * Math.PI * 0.45;
    strand.rotation.z = sx * -0.14;
    head.add(strand);
  }
  const backStrand = new THREE.Mesh(strandCardGeo, hairCardMat);
  backStrand.position.set(0, -0.01, -0.12);
  head.add(backStrand);

  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.rotation.x = Math.PI * 0.5;
  nose.position.set(0, -0.008, 0.12);
  head.add(nose);

  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(sx * 0.042, 0.02, 0.106);
    head.add(eye);
  }

  const brimGeo = new THREE.CylinderGeometry(0.22, 0.235, 0.022, 16);
  const crownGeo = new THREE.CylinderGeometry(0.115, 0.13, 0.11, 14);
  const hatBandGeo = new THREE.TorusGeometry(0.126, 0.014, 6, 16);
  geometries.push(brimGeo, crownGeo, hatBandGeo);
  const hatMat = npc.role === 'fisherman' ? mats.woodCatwalk : mats.darkIron;
  const brim = new THREE.Mesh(brimGeo, hatMat);
  brim.position.y = 0.09;
  brim.rotation.x = -0.08;
  brim.castShadow = true;
  head.add(brim);

  const crown = new THREE.Mesh(crownGeo, hatMat);
  crown.position.set(0, 0.15, -0.01);
  crown.rotation.x = -0.08;
  head.add(crown);

  const hatBand = new THREE.Mesh(hatBandGeo, mats.brassTrim);
  hatBand.rotation.x = Math.PI * 0.5 - 0.08;
  hatBand.position.set(0, 0.106, -0.006);
  head.add(hatBand);

  // Articulated upper/lower arms with natural slight elbow bend
  const upperArmGeo = new THREE.CapsuleGeometry(0.05, 0.2, 6, 8);
  const forearmGeo = new THREE.CapsuleGeometry(0.042, 0.2, 6, 8);
  const handGeo = new THREE.SphereGeometry(0.042, 8, 8);
  geometries.push(upperArmGeo, forearmGeo, handGeo);

  const makeArm = (sx: number): THREE.Group => {
    const shoulder = new THREE.Group();
    shoulder.position.set(sx * 0.195, 0.505, 0);
    shoulder.rotation.z = sx * 0.06;

    const cap = new THREE.Mesh(shoulderCapGeo, coatMat);
    shoulder.add(cap);

    const upper = new THREE.Mesh(upperArmGeo, coatMat);
    upper.position.y = -0.12;
    upper.castShadow = true;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.24, 0);
    elbow.rotation.x = -0.26;
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(forearmGeo, coatMat);
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbow.add(forearm);

    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.y = -0.25;
    elbow.add(hand);

    torso.add(shoulder);
    return shoulder;
  };

  const armL = makeArm(-1);
  const armR = makeArm(1);

  // Optional articulated fishing rod held over the canal
  let rodGroup: THREE.Group | null = null;
  let bobber: THREE.Mesh | null = null;
  if (npc.holdingRod) {
    rodGroup = new THREE.Group();
    rodGroup.position.set(0, -0.44, 0.05);

    const rodGeo = new THREE.CylinderGeometry(0.011, 0.026, 2.35, 8);
    const reelGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.038, 10);
    const lineGeo = new THREE.CylinderGeometry(0.003, 0.003, 1.55, 4);
    const bobberGeo = new THREE.SphereGeometry(0.042, 10, 8);
    const bobberMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D94E34'),
      roughness: 0.35,
      metalness: 0.05,
    });
    geometries.push(rodGeo, reelGeo, lineGeo, bobberGeo);
    materials.push(bobberMat);

    const rod = new THREE.Mesh(rodGeo, mats.woodCatwalk);
    rod.rotation.x = Math.PI * 0.36;
    rod.position.set(0, 0.48, 1.02);
    rod.castShadow = true;
    rodGroup.add(rod);

    const reel = new THREE.Mesh(reelGeo, mats.brassTrim);
    reel.rotation.z = Math.PI * 0.5;
    reel.position.set(0.03, 0.14, 0.24);
    rodGroup.add(reel);

    const line = new THREE.Mesh(lineGeo, mats.darkIron);
    line.position.set(0, 0.19, 1.98);
    rodGroup.add(line);

    bobber = new THREE.Mesh(bobberGeo, bobberMat);
    bobber.position.set(0, -0.58, 1.98);
    rodGroup.add(bobber);

    armR.add(rodGroup);
  }

  // Soft contact shadow disc
  const shadowGeo = new THREE.CircleGeometry(0.36, 18);
  geometries.push(shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, mats.contactShadow);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.015;
  root.add(shadow);

  root.position.set(npc.x, npc.y, npc.z);
  root.rotation.y = npc.yaw;

  return {
    root,
    torso,
    head,
    armL,
    armR,
    legL,
    legR,
    rodGroup,
    bobber,
    geometries,
    materials,
    textures,
  };
}

export function updatePersonVisual(rig: PersonRig, npc: PersonNpcState, elapsed: number): void {
  rig.root.position.set(npc.x, npc.y, npc.z);
  rig.root.rotation.y = npc.yaw;

  if (npc.walking) {
    const p = npc.gaitPhase;
    rig.legL.rotation.x = Math.sin(p) * 0.52;
    rig.legR.rotation.x = -Math.sin(p) * 0.52;
    rig.armL.rotation.x = -Math.sin(p) * 0.42;
    rig.armR.rotation.x = npc.holdingRod ? -0.58 : Math.sin(p) * 0.42;
    rig.torso.position.y = 0.82 + Math.abs(Math.sin(p)) * 0.035;
    rig.torso.rotation.x = 0.04;
    rig.head.rotation.y = Math.sin(elapsed * 0.9) * 0.08;
  } else {
    rig.legL.rotation.x *= 0.85;
    rig.legR.rotation.x *= 0.85;
    rig.armL.rotation.x *= 0.85;
    rig.torso.position.y = 0.82 + Math.sin(elapsed * 2.0 + npc.x) * 0.012;
    rig.torso.rotation.x = npc.holdingRod ? 0.06 : 0;

    if (npc.holdingRod) {
      rig.armR.rotation.x = -0.68 + Math.sin(elapsed * 1.4) * 0.04;
      if (rig.bobber) {
        rig.bobber.position.y = -0.58 + Math.sin(elapsed * 3.1 + npc.z) * 0.035;
      }
    } else {
      rig.armR.rotation.x *= 0.85;
    }
    rig.head.rotation.y = npc.lookAtCatTimer > 0 ? 0 : Math.sin(elapsed * 1.1 + npc.z) * 0.22;
  }
}

export function createDogRig(npc: DogNpcState, mats: WorldMaterialSet): DogRig {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const dogFurPair = makeNpcCanvasPair(96, 2, 2, (a, b, s) => {
    a.fillStyle = npc.coatColor;
    a.fillRect(0, 0, s, s);
    b.fillStyle = '#808080';
    b.fillRect(0, 0, s, s);
    for (let i = 0; i < 620; i++) {
      const fx = (i * 37) % s;
      const fy = (i * 59) % s;
      a.fillStyle = i % 3 === 0 ? 'rgba(255, 240, 215, 0.14)' : 'rgba(24, 16, 10, 0.16)';
      a.fillRect(fx, fy, 1.5, 4 + (i % 4));
      const v = 96 + ((i * 23) % 98);
      b.fillStyle = `rgb(${v},${v},${v})`;
      b.fillRect(fx, fy, 1.5, 4);
    }
  });
  textures.push(dogFurPair.map, dogFurPair.bumpMap);

  const furMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: dogFurPair.map,
    bumpMap: dogFurPair.bumpMap,
    bumpScale: 0.015,
    roughness: 0.76,
    metalness: 0.02,
    sheen: 0.65,
    sheenRoughness: 0.62,
    sheenColor: new THREE.Color('#E8D3B5'),
  });
  const bellyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DECBB2'),
    bumpMap: dogFurPair.bumpMap,
    bumpScale: 0.01,
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.5,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8E3B2E'),
    roughness: 0.42,
    metalness: 0.12,
  });
  const dogEyeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2B180C'),
    roughness: 0.06,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });
  materials.push(furMat, bellyMat, collarMat, dogEyeMat);

  const body = new THREE.Group();
  body.position.set(0, 0.42, 0);
  root.add(body);

  const ribcageGeo = new THREE.SphereGeometry(0.165, 14, 12);
  const waistGeo = new THREE.CapsuleGeometry(0.115, 0.34, 8, 14);
  waistGeo.rotateX(Math.PI * 0.5);
  const hipMassGeo = new THREE.SphereGeometry(0.14, 12, 10);
  const chestGeo = new THREE.SphereGeometry(0.155, 12, 10);
  const neckGeo = new THREE.CylinderGeometry(0.09, 0.125, 0.22, 12);
  geometries.push(ribcageGeo, waistGeo, hipMassGeo, chestGeo, neckGeo);

  const spine = new THREE.Mesh(waistGeo, furMat);
  spine.scale.set(0.95, 0.92, 1.0);
  spine.castShadow = true;
  spine.receiveShadow = true;
  body.add(spine);

  const ribcage = new THREE.Mesh(ribcageGeo, furMat);
  ribcage.position.set(0, -0.01, 0.13);
  ribcage.scale.set(0.9, 1.08, 1.15);
  ribcage.castShadow = true;
  body.add(ribcage);

  const hindquarters = new THREE.Mesh(hipMassGeo, furMat);
  hindquarters.position.set(0, 0.01, -0.19);
  hindquarters.scale.set(0.92, 0.98, 1.08);
  hindquarters.castShadow = true;
  body.add(hindquarters);

  const chest = new THREE.Mesh(chestGeo, bellyMat);
  chest.position.set(0, -0.04, 0.22);
  chest.scale.set(0.8, 0.95, 0.85);
  body.add(chest);

  const neck = new THREE.Mesh(neckGeo, furMat);
  neck.position.set(0, 0.14, 0.24);
  neck.rotation.x = 0.42;
  neck.castShadow = true;
  body.add(neck);

  const collarGeo = new THREE.TorusGeometry(0.112, 0.022, 8, 16);
  const tagGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.012, 10);
  const studGeo = new THREE.SphereGeometry(0.013, 6, 6);
  geometries.push(collarGeo, tagGeo, studGeo);
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.set(0, 0.14, 0.25);
  collar.rotation.x = Math.PI * 0.34;
  body.add(collar);

  const collarTag = new THREE.Mesh(tagGeo, mats.brassTrim);
  collarTag.rotation.x = Math.PI * 0.5;
  collarTag.position.set(0, 0.06, 0.36);
  body.add(collarTag);

  for (let s = -2; s <= 2; s++) {
    if (s === 0) continue;
    const a = s * 0.65;
    const stud = new THREE.Mesh(studGeo, mats.brassTrim);
    stud.position.set(Math.sin(a) * 0.125, 0.14 + Math.cos(a) * 0.04, 0.25 + Math.cos(a) * 0.11);
    body.add(stud);
  }

  // Sculpted hound head + rounded snout + floppy hound ears
  const head = new THREE.Group();
  head.position.set(0, 0.25, 0.33);
  body.add(head);

  const skullGeo = new THREE.SphereGeometry(0.125, 14, 12);
  const snoutGeo = new THREE.CapsuleGeometry(0.048, 0.1, 6, 10);
  snoutGeo.rotateX(Math.PI * 0.5);
  const noseGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const earGeo = new THREE.CapsuleGeometry(0.036, 0.095, 6, 8);
  const eyeGeo = new THREE.SphereGeometry(0.02, 10, 8);
  geometries.push(skullGeo, snoutGeo, noseGeo, earGeo, eyeGeo);

  const skull = new THREE.Mesh(skullGeo, furMat);
  skull.scale.set(0.95, 0.96, 1.05);
  skull.castShadow = true;
  head.add(skull);

  const snout = new THREE.Mesh(snoutGeo, bellyMat);
  snout.position.set(0, -0.024, 0.13);
  snout.scale.set(1.05, 0.85, 1.0);
  head.add(snout);

  const nose = new THREE.Mesh(noseGeo, mats.darkIron);
  nose.position.set(0, -0.008, 0.22);
  head.add(nose);

  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, dogEyeMat);
    eye.position.set(sx * 0.056, 0.034, 0.104);
    head.add(eye);
  }

  const earL = new THREE.Mesh(earGeo, mats.darkIron);
  earL.position.set(-0.118, -0.02, -0.01);
  earL.scale.set(0.55, 1.0, 1.15);
  earL.rotation.z = 0.22;
  head.add(earL);

  const earR = new THREE.Mesh(earGeo, mats.darkIron);
  earR.position.set(0.118, -0.02, -0.01);
  earR.scale.set(0.55, 1.0, 1.15);
  earR.rotation.z = -0.22;
  head.add(earR);

  // 4 Articulated legs with upper shoulder/haunch & slim lower shank
  const legGeo = new THREE.CapsuleGeometry(0.04, 0.24, 6, 8);
  const pawGeo = new THREE.SphereGeometry(0.046, 8, 6);
  geometries.push(legGeo, pawGeo);

  const makeLeg = (x: number, z: number): THREE.Group => {
    const hip = new THREE.Group();
    hip.position.set(x, -0.06, z);
    const mesh = new THREE.Mesh(legGeo, furMat);
    mesh.position.y = -0.15;
    mesh.castShadow = true;
    hip.add(mesh);

    const paw = new THREE.Mesh(pawGeo, bellyMat);
    paw.position.set(0, -0.32, 0.022);
    paw.scale.set(0.95, 0.7, 1.28);
    hip.add(paw);
    body.add(hip);
    return hip;
  };

  const legFL = makeLeg(-0.088, 0.19);
  const legFR = makeLeg(0.088, 0.19);
  const legBL = makeLeg(-0.088, -0.21);
  const legBR = makeLeg(0.088, -0.21);

  // Wagging tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.08, -0.29);
  body.add(tail);
  const tailGeo = new THREE.CapsuleGeometry(0.026, 0.22, 6, 8);
  geometries.push(tailGeo);
  const tailMesh = new THREE.Mesh(tailGeo, furMat);
  tailMesh.position.set(0, 0.11, -0.05);
  tailMesh.rotation.x = -0.52;
  tail.add(tailMesh);

  const shadowGeo = new THREE.CircleGeometry(0.45, 18);
  geometries.push(shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, mats.contactShadow);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.015;
  root.add(shadow);

  root.position.set(npc.x, npc.y, npc.z);
  root.rotation.y = npc.yaw;

  return {
    root,
    body,
    head,
    earL,
    earR,
    tail,
    legFL,
    legFR,
    legBL,
    legBR,
    geometries,
    materials,
    textures,
  };
}

export function updateDogVisual(rig: DogRig, npc: DogNpcState, elapsed: number): void {
  rig.root.position.set(npc.x, npc.y, npc.z);
  rig.root.rotation.y = npc.yaw;

  if (npc.behavior === 'chase') {
    const p = npc.gaitPhase;
    rig.legFL.rotation.x = Math.sin(p) * 0.78;
    rig.legFR.rotation.x = Math.sin(p + 0.45) * 0.78;
    rig.legBL.rotation.x = -Math.sin(p) * 0.78;
    rig.legBR.rotation.x = -Math.sin(p + 0.45) * 0.78;
    rig.body.position.y = 0.42 + Math.abs(Math.sin(p)) * 0.055;
    rig.body.rotation.x = Math.cos(p) * 0.08;
    rig.head.rotation.x = -0.18 + Math.sin(elapsed * 12.0) * 0.1;
  } else if (npc.behavior === 'patrol') {
    const p = npc.gaitPhase;
    rig.legFL.rotation.x = Math.sin(p) * 0.58;
    rig.legBR.rotation.x = Math.sin(p + 0.3) * 0.58;
    rig.legFR.rotation.x = -Math.sin(p) * 0.58;
    rig.legBL.rotation.x = -Math.sin(p + 0.3) * 0.58;
    rig.body.position.y = 0.42 + Math.abs(Math.sin(p)) * 0.03;
    rig.body.rotation.x = 0;
    rig.head.rotation.x = 0.05;
  } else {
    rig.legFL.rotation.x *= 0.82;
    rig.legFR.rotation.x *= 0.82;
    rig.legBL.rotation.x *= 0.82;
    rig.legBR.rotation.x *= 0.82;
    rig.body.position.y = 0.42 + Math.sin(elapsed * 3.0) * 0.008;
    rig.body.rotation.x = 0;
    rig.head.rotation.x =
      npc.behavior === 'sniff' ? 0.38 + Math.sin(elapsed * 7.0) * 0.08 : -0.14 + Math.sin(elapsed * 8.0) * 0.06;
  }

  rig.tail.rotation.z = Math.sin(npc.tailPhase) * (npc.behavior === 'alert' || npc.behavior === 'chase' ? 0.52 : 0.28);
  const earPerk = npc.behavior === 'chase' ? -0.25 : npc.behavior === 'alert' ? 0.35 : 0;
  rig.earL.rotation.x = earPerk;
  rig.earR.rotation.x = earPerk;
}

export function createBirdRig(npc: BirdNpcState, mats: WorldMaterialSet): BirdRig {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const isGull = npc.species === 'gull';
  const baseHex = isGull ? '#E5E9EA' : '#6F7D82';
  const featherPair = makeNpcCanvasPair(96, 2, 2, (a, b, s) => {
    a.fillStyle = baseHex;
    a.fillRect(0, 0, s, s);
    b.fillStyle = '#808080';
    b.fillRect(0, 0, s, s);
    for (let row = 0; row < 10; row++) {
      const y = (row / 10) * s;
      const off = (row % 2) * 8;
      for (let col = -1; col < 7; col++) {
        const x = (col / 6) * s + off;
        a.strokeStyle = isGull ? 'rgba(130, 148, 156, 0.28)' : 'rgba(42, 52, 58, 0.34)';
        a.lineWidth = 1.5;
        a.beginPath();
        a.arc(x, y, s / 10, 0.15 * Math.PI, 0.85 * Math.PI);
        a.stroke();

        b.strokeStyle = '#B8B8B8';
        b.lineWidth = 1.6;
        b.beginPath();
        b.arc(x, y, s / 10, 0.15 * Math.PI, 0.85 * Math.PI);
        b.stroke();
      }
    }
  });
  textures.push(featherPair.map, featherPair.bumpMap);

  const featherAlphaCanvas = document.createElement('canvas');
  featherAlphaCanvas.width = featherAlphaCanvas.height = 64;
  {
    const ctx = featherAlphaCanvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    for (let f = 0; f < 5; f++) {
      const fx = 8 + f * 12;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(fx, 28, 5, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const featherAlphaTex = new THREE.CanvasTexture(featherAlphaCanvas);
  textures.push(featherAlphaTex);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: featherPair.map,
    bumpMap: featherPair.bumpMap,
    bumpScale: 0.014,
    roughness: 0.64,
    metalness: 0.04,
    sheen: 0.78,
    sheenRoughness: 0.44,
    sheenColor: new THREE.Color(isGull ? '#D8F0F8' : '#7EE0BE'),
  });
  const wingTipMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(isGull ? '#36444A' : '#3C4448'),
    bumpMap: featherPair.bumpMap,
    bumpScale: 0.012,
    roughness: 0.68,
    metalness: 0.04,
    sheen: 0.72,
    sheenColor: new THREE.Color(isGull ? '#B6D0DC' : '#65B89E'),
  });
  const featherCardMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(isGull ? '#465860' : '#4E6668'),
    alphaMap: featherAlphaTex,
    transparent: true,
    alphaTest: 0.25,
    side: THREE.DoubleSide,
    roughness: 0.58,
    sheen: 0.85,
    sheenColor: new THREE.Color('#9FE8D4'),
  });
  const beakMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isGull ? '#E09A34' : '#8C6244'),
    roughness: 0.38,
    metalness: 0.05,
  });
  const birdEyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0e10,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });
  materials.push(bodyMat, wingTipMat, featherCardMat, beakMat, birdEyeMat);

  const scale = isGull ? 1.15 : 0.88;
  const body = new THREE.Group();
  body.scale.setScalar(scale);
  body.position.y = 0.14;
  root.add(body);

  const torsoGeo = new THREE.CapsuleGeometry(0.075, 0.16, 6, 10);
  torsoGeo.rotateX(Math.PI * 0.42);
  const tailGeo = new THREE.BoxGeometry(0.11, 0.018, 0.12);
  geometries.push(torsoGeo, tailGeo);

  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.castShadow = true;
  body.add(torso);

  const tail = new THREE.Mesh(tailGeo, wingTipMat);
  tail.position.set(0, -0.01, -0.15);
  tail.rotation.x = 0.22;
  body.add(tail);

  // Head + beak + glossy bead eyes
  const head = new THREE.Group();
  head.position.set(0, 0.075, 0.125);
  body.add(head);

  const headGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const beakGeo = new THREE.ConeGeometry(0.018, 0.075, 6);
  const birdEyeGeo = new THREE.SphereGeometry(0.011, 8, 6);
  const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 4);
  geometries.push(headGeo, beakGeo, birdEyeGeo, legGeo);

  const skull = new THREE.Mesh(headGeo, bodyMat);
  head.add(skull);

  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.rotation.x = Math.PI * 0.5;
  beak.position.set(0, -0.005, 0.072);
  head.add(beak);

  for (const sx of [-1, 1]) {
    const bEye = new THREE.Mesh(birdEyeGeo, birdEyeMat);
    bEye.position.set(sx * 0.036, 0.014, 0.038);
    head.add(bEye);
  }

  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(legGeo, beakMat);
    leg.position.set(sx * 0.032, -0.085, 0);
    body.add(leg);
  }

  // Hinged wings
  const innerWingGeo = new THREE.BoxGeometry(0.2, 0.016, 0.12);
  const outerWingGeo = new THREE.BoxGeometry(0.16, 0.012, 0.09);
  const featherTipGeo = new THREE.PlaneGeometry(0.14, 0.11);
  featherTipGeo.rotateX(-Math.PI * 0.5);
  geometries.push(innerWingGeo, outerWingGeo, featherTipGeo);

  const makeWing = (side: number): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.06, 0.04, 0.02);

    const inner = new THREE.Mesh(innerWingGeo, bodyMat);
    inner.position.set(side * 0.1, 0, -0.01);
    pivot.add(inner);

    const outer = new THREE.Mesh(outerWingGeo, wingTipMat);
    outer.position.set(side * 0.26, 0, -0.03);
    outer.rotation.y = side * -0.16;
    pivot.add(outer);

    const fCard = new THREE.Mesh(featherTipGeo, featherCardMat);
    fCard.position.set(side * 0.36, 0.002, -0.04);
    fCard.rotation.y = side * -0.22;
    pivot.add(fCard);

    body.add(pivot);
    return pivot;
  };

  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  const shadowGeo = new THREE.CircleGeometry(0.18, 12);
  geometries.push(shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, mats.contactShadow);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.012;
  root.add(shadow);

  root.position.set(npc.x, npc.y, npc.z);
  root.rotation.y = npc.yaw;

  return {
    root,
    body,
    head,
    wingL,
    wingR,
    shadow,
    geometries,
    materials,
    textures,
  };
}

export function updateBirdVisual(rig: BirdRig, npc: BirdNpcState): void {
  rig.root.position.set(npc.x, npc.y, npc.z);
  rig.root.rotation.y = npc.yaw;

  if (npc.mode === 'perched') {
    rig.body.rotation.x = 0;
    rig.wingL.rotation.z = 1.15;
    rig.wingR.rotation.z = -1.15;
    rig.wingL.rotation.x = 0.25;
    rig.wingR.rotation.x = 0.25;
    const peck = Math.max(0, Math.sin(npc.peckPhase) - 0.55) * 1.1;
    rig.head.rotation.x = peck * 0.85;
    rig.head.rotation.y = npc.headTurn ?? 0;
    rig.shadow.visible = true;
  } else {
    rig.body.rotation.x = npc.pitch;
    const flap = Math.sin(npc.wingPhase) * (npc.mode === 'soaring' ? 0.42 : 0.72);
    rig.wingL.rotation.z = flap;
    rig.wingR.rotation.z = -flap;
    rig.wingL.rotation.x = 0;
    rig.wingR.rotation.x = 0;
    rig.head.rotation.x = 0;
    rig.head.rotation.y = 0;
    rig.shadow.visible = false;
  }
}
