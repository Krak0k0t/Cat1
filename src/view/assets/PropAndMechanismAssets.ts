import * as THREE from 'three';

export interface PropMaterialSet {
  brushedBrassMat: THREE.MeshPhysicalMaterial;
  corrodedIronMat: THREE.MeshStandardMaterial;
  glazedCeramicMat: THREE.MeshPhysicalMaterial;
  emeraldCeramicMat: THREE.MeshPhysicalMaterial;
  velvetDrapeMat: THREE.MeshPhysicalMaterial;
  parchmentMat: THREE.MeshPhysicalMaterial;
  liquidGlassMat: THREE.MeshPhysicalMaterial;
  liquidAmberMat: THREE.MeshPhysicalMaterial;
  mushroomStemMat: THREE.MeshStandardMaterial;
  mushroomCapMat: THREE.MeshPhysicalMaterial;
  springCapMat: THREE.MeshPhysicalMaterial;
  dewOrbShellMat: THREE.MeshPhysicalMaterial;
  dispose: () => void;
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function createPropNormalMap(
  size: number,
  maxAniso: number,
  repeatX: number,
  repeatY: number,
  strength: number,
  fn: (u: number, v: number) => number
): THREE.DataTexture {
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      h[y * size + x] = fn(x / size, y / size);
    }
  }
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const dx = (h[y * size + xp] - h[y * size + xm]) * strength;
      const dy = (h[yp * size + x] - h[ym * size + x]) * strength;
      const len = Math.hypot(dx, dy, 1.0);
      const idx = (y * size + x) * 4;
      data[idx] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round(((1.0 / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.max(1, Math.min(8, maxAniso));
  tex.needsUpdate = true;
  return tex;
}

export function createPropAndMechanismMaterials(
  maxAniso: number,
  isSoftwareGl = false
): PropMaterialSet {
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];

  // 1. Anisotropic Brushed Brass
  const brassNormal = createPropNormalMap(128, maxAniso, 2, 2, 1.4, (u, v) => {
    return Math.sin(v * 240.0) * 0.25 + hash2(Math.floor(u * 4), Math.floor(v * 128)) * 0.25;
  });
  textures.push(brassNormal);

  const brushedBrassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D49B54'),
    normalMap: brassNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    metalness: 1.0,
    roughness: 0.26,
    anisotropy: 0.78,
    anisotropyRotation: 0.15,
    clearcoat: 0.32,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.4,
  });

  // 2. Corroded Iron (rust pitting via roughnessMap + normalMap)
  const rustAlbedo = document.createElement('canvas');
  const rustRough = document.createElement('canvas');
  rustAlbedo.width = rustRough.width = 128;
  rustAlbedo.height = rustRough.height = 128;
  {
    const ctxA = rustAlbedo.getContext('2d')!;
    const ctxR = rustRough.getContext('2d')!;
    ctxA.fillStyle = '#333C42';
    ctxA.fillRect(0, 0, 128, 128);
    ctxR.fillStyle = '#686868';
    ctxR.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 240; i++) {
      const px = hash2(i, 7) * 128;
      const py = hash2(i, 23) * 128;
      const r = 2 + hash2(i, 41) * 7;
      const isRust = hash2(i, 61) > 0.56;
      ctxA.fillStyle = isRust ? 'rgba(128, 62, 34, 0.48)' : 'rgba(72, 86, 94, 0.28)';
      ctxA.beginPath();
      ctxA.arc(px, py, r, 0, Math.PI * 2);
      ctxA.fill();
      ctxR.fillStyle = isRust ? '#D8D8D8' : '#4E4E4E';
      ctxR.beginPath();
      ctxR.arc(px, py, r, 0, Math.PI * 2);
      ctxR.fill();
    }
  }
  const rustMap = new THREE.CanvasTexture(rustAlbedo);
  rustMap.colorSpace = THREE.SRGBColorSpace;
  rustMap.wrapS = rustMap.wrapT = THREE.RepeatWrapping;
  const rustRoughMap = new THREE.CanvasTexture(rustRough);
  rustRoughMap.wrapS = rustRoughMap.wrapT = THREE.RepeatWrapping;
  const rustNormal = createPropNormalMap(128, maxAniso, 2, 2, 3.0, (u, v) =>
    hash2(Math.floor(u * 48), Math.floor(v * 48))
  );
  textures.push(rustMap, rustRoughMap, rustNormal);

  const corrodedIronMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: rustMap,
    roughnessMap: rustRoughMap,
    normalMap: rustNormal,
    normalScale: new THREE.Vector2(0.75, 0.75),
    metalness: 0.84,
    roughness: 0.52,
    envMapIntensity: 1.1,
  });

  // 3. Glazed Ceramics & Terracotta Amphorae
  const ceramicCanvas = document.createElement('canvas');
  ceramicCanvas.width = ceramicCanvas.height = 128;
  {
    const ctx = ceramicCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#D48A5A');
    grad.addColorStop(0.28, '#2C6D6B');
    grad.addColorStop(0.36, '#E8C587');
    grad.addColorStop(0.42, '#BA6442');
    grad.addColorStop(1, '#7D3C28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    // Decorative wave band
    ctx.strokeStyle = '#F5DFB0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 128; x += 8) {
      const y = 41 + Math.sin((x / 128) * Math.PI * 6) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const ceramicMap = new THREE.CanvasTexture(ceramicCanvas);
  ceramicMap.colorSpace = THREE.SRGBColorSpace;
  textures.push(ceramicMap);

  const glazedCeramicMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: ceramicMap,
    roughness: 0.34,
    metalness: 0.04,
    clearcoat: 0.92,
    clearcoatRoughness: 0.09,
    envMapIntensity: 1.25,
  });

  const emeraldCeramicMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2E8574'),
    roughness: 0.24,
    metalness: 0.06,
    clearcoat: 0.96,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.35,
  });

  // 4. Double-Sided Velvet Drape Cloth (sheen + folded normalMap)
  const clothNormal = createPropNormalMap(128, maxAniso, 2, 2, 2.2, (u, v) =>
    Math.sin(u * Math.PI * 10) * 0.5 + Math.cos(v * Math.PI * 4) * 0.15
  );
  textures.push(clothNormal);

  const velvetDrapeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#8A2D38'),
    normalMap: clothNormal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.85,
    sheenRoughness: 0.42,
    sheenColor: new THREE.Color('#FFB896'),
    side: THREE.DoubleSide,
  });

  // 5. Old Parchment Paper / Tomes
  const paperCanvas = document.createElement('canvas');
  paperCanvas.width = paperCanvas.height = 128;
  {
    const ctx = paperCanvas.getContext('2d')!;
    ctx.fillStyle = '#EAD8B4';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(130, 88, 52, 0.14)';
    ctx.fillRect(0, 0, 12, 128);
    ctx.fillRect(116, 0, 12, 128);
    ctx.strokeStyle = 'rgba(72, 48, 30, 0.42)';
    ctx.lineWidth = 2;
    for (let y = 20; y < 110; y += 12) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(106, y);
      ctx.stroke();
    }
  }
  const paperMap = new THREE.CanvasTexture(paperCanvas);
  paperMap.colorSpace = THREE.SRGBColorSpace;
  textures.push(paperMap);

  const parchmentMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: paperMap,
    roughness: 0.86,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.12,
    thickness: 0.08,
  });

  // 6. Optical Liquids & Glass Vessels
  const liquidGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DDF8F4'),
    roughness: 0.06,
    metalness: 0.02,
    transmission: isSoftwareGl ? 0 : 0.86,
    ior: 1.5,
    thickness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: isSoftwareGl,
    opacity: isSoftwareGl ? 0.44 : 1.0,
    envMapIntensity: 1.45,
  });

  const liquidAmberMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFAA3C'),
    emissive: new THREE.Color('#D97218'),
    emissiveIntensity: 0.32,
    roughness: 0.1,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.68,
    ior: 1.36,
    thickness: 0.45,
    transparent: isSoftwareGl,
    opacity: isSoftwareGl ? 0.78 : 1.0,
  });

  // 7. Bioluminescent Grotto Mushrooms & Spirit Dew-Drop Orbs
  const shroomCanvas = document.createElement('canvas');
  const shroomEmissiveCanvas = document.createElement('canvas');
  shroomCanvas.width = shroomEmissiveCanvas.width = 128;
  shroomCanvas.height = shroomEmissiveCanvas.height = 128;
  {
    const ctxC = shroomCanvas.getContext('2d')!;
    const ctxE = shroomEmissiveCanvas.getContext('2d')!;
    const grad = ctxC.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#0E5E54');
    grad.addColorStop(0.65, '#198C78');
    grad.addColorStop(1, '#44D6B2');
    ctxC.fillStyle = grad;
    ctxC.fillRect(0, 0, 128, 128);

    ctxE.fillStyle = '#0B3A33';
    ctxE.fillRect(0, 0, 128, 128);

    // Bioluminescent cap spots & radiating gill stripes
    for (let i = 0; i < 28; i++) {
      const sx = (hash2(i, 13) * 0.88 + 0.06) * 128;
      const sy = (hash2(i, 31) * 0.72 + 0.12) * 128;
      const sr = 3 + hash2(i, 47) * 5;
      ctxC.fillStyle = '#B8FFF0';
      ctxC.beginPath();
      ctxC.arc(sx, sy, sr, 0, Math.PI * 2);
      ctxC.fill();

      ctxE.fillStyle = '#75FFE0';
      ctxE.beginPath();
      ctxE.arc(sx, sy, sr * 1.15, 0, Math.PI * 2);
      ctxE.fill();
    }
  }
  const shroomMap = new THREE.CanvasTexture(shroomCanvas);
  shroomMap.colorSpace = THREE.SRGBColorSpace;
  const shroomEmissiveMap = new THREE.CanvasTexture(shroomEmissiveCanvas);
  shroomEmissiveMap.colorSpace = THREE.SRGBColorSpace;
  textures.push(shroomMap, shroomEmissiveMap);

  const mushroomStemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#77A89C'),
    emissive: new THREE.Color('#13453E'),
    emissiveIntensity: 0.25,
    roughness: 0.78,
    metalness: 0.02,
  });

  const mushroomCapMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: shroomMap,
    emissive: new THREE.Color('#2EE0B8'),
    emissiveMap: shroomEmissiveMap,
    emissiveIntensity: 0.32,
    roughness: 0.26,
    metalness: 0.04,
    clearcoat: 0.82,
    clearcoatRoughness: 0.14,
    transmission: isSoftwareGl ? 0 : 0.42,
    ior: 1.42,
    thickness: 0.55,
    transparent: isSoftwareGl,
    opacity: isSoftwareGl ? 0.94 : 1.0,
  });

  const springCapMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#8CFFEB'),
    map: shroomMap,
    emissive: new THREE.Color('#2BD4A6'),
    emissiveMap: shroomEmissiveMap,
    emissiveIntensity: 0.38,
    roughness: 0.2,
    metalness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    transmission: isSoftwareGl ? 0 : 0.36,
    ior: 1.44,
    thickness: 0.6,
    transparent: isSoftwareGl,
    opacity: isSoftwareGl ? 0.95 : 1.0,
  });

  const dewOrbShellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#A8F5E5'),
    emissive: new THREE.Color('#28BA98'),
    emissiveIntensity: 0.24,
    roughness: 0.06,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transmission: isSoftwareGl ? 0 : 0.78,
    ior: 1.33,
    thickness: 0.6,
    transparent: true,
    opacity: isSoftwareGl ? 0.58 : 0.96,
  });

  materials.push(
    brushedBrassMat,
    corrodedIronMat,
    glazedCeramicMat,
    emeraldCeramicMat,
    velvetDrapeMat,
    parchmentMat,
    liquidGlassMat,
    liquidAmberMat,
    mushroomStemMat,
    mushroomCapMat,
    springCapMat,
    dewOrbShellMat
  );

  return {
    brushedBrassMat,
    corrodedIronMat,
    glazedCeramicMat,
    emeraldCeramicMat,
    velvetDrapeMat,
    parchmentMat,
    liquidGlassMat,
    liquidAmberMat,
    mushroomStemMat,
    mushroomCapMat,
    springCapMat,
    dewOrbShellMat,
    dispose: () => {
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}

/**
 * Bioluminescent Grotto Mushroom (scenic glow cluster OR large elastic SpringPad trampoline).
 */
export function buildBioluminescentMushroom(
  scale: number,
  mats: PropMaterialSet,
  isSpringPad = false
): { group: THREE.Group; capMesh: THREE.Mesh; ringMesh?: THREE.Mesh; geos: THREE.BufferGeometry[] } {
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];

  const stemGeo = new THREE.CylinderGeometry(0.14 * scale, 0.24 * scale, 0.72 * scale, 10);
  const capGeo = new THREE.SphereGeometry(
    0.72 * scale,
    18,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.52
  );
  const gillGeo = new THREE.CircleGeometry(0.68 * scale, 16);
  gillGeo.rotateX(Math.PI * 0.5);
  geos.push(stemGeo, capGeo, gillGeo);

  const stem = new THREE.Mesh(stemGeo, mats.mushroomStemMat);
  stem.position.y = 0.36 * scale;
  stem.castShadow = true;
  group.add(stem);

  const capMesh = new THREE.Mesh(capGeo, isSpringPad ? mats.springCapMat : mats.mushroomCapMat);
  capMesh.position.y = 0.54 * scale;
  capMesh.scale.set(1.0, 0.56, 1.0);
  capMesh.castShadow = true;
  group.add(capMesh);

  const gills = new THREE.Mesh(gillGeo, mats.mushroomStemMat);
  gills.position.y = 0.54 * scale;
  group.add(gills);

  let ringMesh: THREE.Mesh | undefined;
  if (isSpringPad) {
    const ringGeo = new THREE.TorusGeometry(0.76 * scale, 0.055 * scale, 8, 24);
    ringGeo.rotateX(Math.PI * 0.5);
    geos.push(ringGeo);
    ringMesh = new THREE.Mesh(ringGeo, mats.brushedBrassMat);
    ringMesh.position.y = 0.52 * scale;
    group.add(ringMesh);
  } else {
    // Small twin baby sprout beside main mushroom
    const babyStem = new THREE.Mesh(stemGeo, mats.mushroomStemMat);
    babyStem.scale.setScalar(0.55);
    babyStem.position.set(0.45 * scale, 0.2 * scale, 0.25 * scale);
    babyStem.rotation.z = -0.25;
    const babyCap = new THREE.Mesh(capGeo, mats.mushroomCapMat);
    babyCap.scale.set(0.55, 0.34, 0.55);
    babyCap.position.set(0.51 * scale, 0.32 * scale, 0.25 * scale);
    group.add(babyStem, babyCap);
  }

  return { group, capMesh, ringMesh, geos };
}

/**
 * Floating Silk & Brass Spring Canopy Pad for Sky Sanctuary / Harbor vertical leaps.
 */
export function buildSpringCanopyPad(
  radius: number,
  mats: PropMaterialSet
): { group: THREE.Group; capMesh: THREE.Mesh; geos: THREE.BufferGeometry[] } {
  const group = new THREE.Group();
  const baseGeo = new THREE.CylinderGeometry(radius * 0.84, radius * 0.96, 0.14, 16);
  const rimGeo = new THREE.TorusGeometry(radius, 0.06, 8, 26);
  rimGeo.rotateX(Math.PI * 0.5);
  const capGeo = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, 0.1, 18);
  const geos = [baseGeo, rimGeo, capGeo];

  const base = new THREE.Mesh(baseGeo, mats.corrodedIronMat);
  base.position.y = 0.07;
  const rim = new THREE.Mesh(rimGeo, mats.brushedBrassMat);
  rim.position.y = 0.18;
  const capMesh = new THREE.Mesh(capGeo, mats.springCapMat);
  capMesh.position.y = 0.16;
  group.add(base, rim, capMesh);
  return { group, capMesh, geos };
}

/**
 * Glowing "Dew-Drop Spirit Orb" replacing flat beacons — nested luminous core inside refractive dew-drop shell + brass halo.
 */
export function buildSpiritDewOrb(
  mats: PropMaterialSet,
  coreColorHex = '#FFE07A'
): {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  dropMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  geos: THREE.BufferGeometry[];
  mats: THREE.Material[];
} {
  const group = new THREE.Group();
  const coreGeo = new THREE.OctahedronGeometry(0.16, 1);
  const dropGeo = new THREE.SphereGeometry(0.32, 16, 14);
  const ringGeo = new THREE.TorusGeometry(0.46, 0.025, 8, 24);

  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(coreColorHex),
    emissive: new THREE.Color(coreColorHex),
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });

  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  const dropMesh = new THREE.Mesh(dropGeo, mats.dewOrbShellMat);
  dropMesh.scale.set(0.88, 1.24, 0.88);
  const ringMesh = new THREE.Mesh(ringGeo, mats.brushedBrassMat);
  ringMesh.rotation.x = Math.PI * 0.35;

  group.add(coreMesh, dropMesh, ringMesh);
  return {
    group,
    coreMesh,
    dropMesh,
    ringMesh,
    geos: [coreGeo, dropGeo, ringGeo],
    mats: [coreMat],
  };
}

/**
 * Glazed Venetian Ceramic Amphora & Pot Cluster wrapped in THREE.LOD.
 */
export function buildAmphoraClusterLOD(mats: PropMaterialSet): {
  lod: THREE.LOD;
  disposables: THREE.BufferGeometry[];
} {
  const lod = new THREE.LOD();
  const pts = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.22, 0.02),
    new THREE.Vector2(0.3, 0.32),
    new THREE.Vector2(0.24, 0.58),
    new THREE.Vector2(0.11, 0.74),
    new THREE.Vector2(0.17, 0.84),
    new THREE.Vector2(0.14, 0.85),
  ];
  const amphoraGeo = new THREE.LatheGeometry(pts, 14);
  const smallJarGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.42, 12);
  const loGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.75, 7);

  const hi = new THREE.Group();
  const mainJar = new THREE.Mesh(amphoraGeo, mats.glazedCeramicMat);
  mainJar.castShadow = true;
  mainJar.receiveShadow = true;
  const sideJar = new THREE.Mesh(smallJarGeo, mats.emeraldCeramicMat);
  sideJar.position.set(0.36, 0.21, 0.18);
  sideJar.castShadow = true;
  hi.add(mainJar, sideJar);

  const lo = new THREE.Group();
  const loMesh = new THREE.Mesh(loGeo, mats.glazedCeramicMat);
  loMesh.position.y = 0.38;
  lo.add(loMesh);

  lod.addLevel(hi, 0);
  lod.addLevel(lo, 28);
  return { lod, disposables: [amphoraGeo, smallJarGeo, loGeo] };
}

/**
 * Ornate Sanctuary / Study Shrine Altar combining Velvet Tapestry Drape, Glazed Ceramics,
 * Aged Parchment Tome, Translucent Liquid Flask & Brushed Brass Halo wrapped in THREE.LOD.
 */
export function buildSanctuaryShrineLOD(mats: PropMaterialSet): {
  lod: THREE.LOD;
  disposables: THREE.BufferGeometry[];
} {
  const lod = new THREE.LOD();
  const plinthGeo = new THREE.BoxGeometry(1.5, 0.65, 1.0);
  const clothGeo = new THREE.BoxGeometry(1.54, 0.18, 1.04);
  const bookGeo = new THREE.BoxGeometry(0.46, 0.07, 0.34);
  const bottleGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.36, 12);
  const neckGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.14, 10);
  const bowlGeo = new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
  const archGeo = new THREE.TorusGeometry(0.68, 0.055, 8, 24, Math.PI);
  const loBoxGeo = new THREE.BoxGeometry(1.5, 1.4, 1.0);

  const hi = new THREE.Group();
  const plinth = new THREE.Mesh(plinthGeo, mats.corrodedIronMat);
  plinth.position.y = 0.325;
  plinth.castShadow = true;
  plinth.receiveShadow = true;

  const drape = new THREE.Mesh(clothGeo, mats.velvetDrapeMat);
  drape.position.y = 0.62;
  drape.castShadow = true;

  const tome = new THREE.Mesh(bookGeo, mats.parchmentMat);
  tome.position.set(-0.34, 0.74, 0.06);
  tome.rotation.y = 0.24;

  const flask = new THREE.Mesh(bottleGeo, mats.liquidGlassMat);
  flask.position.set(0.38, 0.88, -0.05);
  const liquid = new THREE.Mesh(bottleGeo, mats.liquidAmberMat);
  liquid.position.set(0.38, 0.84, -0.05);
  liquid.scale.set(0.76, 0.64, 0.76);
  const neck = new THREE.Mesh(neckGeo, mats.liquidGlassMat);
  neck.position.set(0.38, 1.12, -0.05);

  const bowl = new THREE.Mesh(bowlGeo, mats.emeraldCeramicMat);
  bowl.position.set(0.05, 0.82, 0.18);

  const arch = new THREE.Mesh(archGeo, mats.brushedBrassMat);
  arch.position.set(0, 0.7, -0.35);

  hi.add(plinth, drape, tome, flask, liquid, neck, bowl, arch);

  const lo = new THREE.Group();
  const loBlock = new THREE.Mesh(loBoxGeo, mats.corrodedIronMat);
  loBlock.position.y = 0.7;
  lo.add(loBlock);

  lod.addLevel(hi, 0);
  lod.addLevel(lo, 34);
  return {
    lod,
    disposables: [plinthGeo, clothGeo, bookGeo, bottleGeo, neckGeo, bowlGeo, archGeo, loBoxGeo],
  };
}
