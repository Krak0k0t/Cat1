import * as THREE from 'three';

export interface NatureMaterialSet {
  rockMat: THREE.MeshStandardMaterial;
  mossMat: THREE.MeshStandardMaterial;
  grassMat: THREE.MeshStandardMaterial;
  grassGlowMat: THREE.MeshStandardMaterial;
  barkMat: THREE.MeshStandardMaterial;
  foliageOliveMat: THREE.MeshStandardMaterial;
  foliagePineMat: THREE.MeshStandardMaterial;
  foliageAutumnMat: THREE.MeshStandardMaterial;
  petalMat: THREE.MeshPhysicalMaterial;
  windUniforms: {
    uWindTime: { value: number };
    uWindStrength: { value: number };
  };
  dispose: () => void;
}

export interface RockInstanceSpec {
  x: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotY: number;
  rotZ?: number;
  colorHex?: string;
}

export interface MossPatchSpec {
  x: number;
  y: number;
  z: number;
  radius: number;
  rotY: number;
  colorHex?: string;
}

export interface GrassPatchSpec {
  x: number;
  y: number;
  z: number;
  height: number;
  scaleXZ?: number;
  rotY: number;
  colorHex?: string;
}

export type BiomeTreeKind = 'olive' | 'pine' | 'autumn_cypress';

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function fbm2(x: number, y: number): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    const ix = Math.floor(x * freq);
    const iy = Math.floor(y * freq);
    const fx = x * freq - ix;
    const fy = y * freq - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy);
    const b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1);
    const d = hash2(ix + 1, iy + 1);
    v += amp * (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy);
    freq *= 2.07;
    amp *= 0.5;
  }
  return v;
}

/**
 * Generates a real tangent-space normal map from a procedural height sampler.
 */
function createProceduralNormalTexture(
  size: number,
  maxAniso: number,
  repeatX: number,
  repeatY: number,
  strength: number,
  heightAt: (u: number, v: number) => number
): THREE.DataTexture {
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      heights[y * size + x] = heightAt(x / size, y / size);
    }
  }
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const dX = (heights[y * size + xp] - heights[y * size + xm]) * strength;
      const dY = (heights[yp * size + x] - heights[ym * size + x]) * strength;
      const len = Math.hypot(dX, dY, 1.0);
      const nx = -dX / len;
      const ny = -dY / len;
      const nz = 1.0 / len;
      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
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

export function createNatureMaterials(
  maxAniso: number,
  isSoftwareGl = false
): NatureMaterialSet {
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];

  // 1. Stone / Cliff Rock PBR (Roughness 0.86, Normal Map, VertexColors slate->deep blue)
  const rockAlbedoCanvas = document.createElement('canvas');
  const rockRoughCanvas = document.createElement('canvas');
  rockAlbedoCanvas.width = rockRoughCanvas.width = 128;
  rockAlbedoCanvas.height = rockRoughCanvas.height = 128;
  {
    const ctxA = rockAlbedoCanvas.getContext('2d')!;
    const ctxR = rockRoughCanvas.getContext('2d')!;
    ctxA.fillStyle = '#B8C2C6';
    ctxA.fillRect(0, 0, 128, 128);
    ctxR.fillStyle = '#DCDCDC';
    ctxR.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 380; i++) {
      const px = hash2(i, 7) * 128;
      const py = hash2(i, 19) * 128;
      const r = 2 + hash2(i, 37) * 7;
      const n = hash2(i, 53);
      ctxA.fillStyle = n > 0.6 ? 'rgba(218, 228, 232, 0.22)' : 'rgba(64, 78, 88, 0.24)';
      ctxA.beginPath();
      ctxA.ellipse(px, py, r * 1.4, r * 0.7, n * Math.PI, 0, Math.PI * 2);
      ctxA.fill();
      const rv = Math.round(185 + n * 60);
      ctxR.fillStyle = `rgb(${rv},${rv},${rv})`;
      ctxR.fillRect(px - r * 0.5, py - r * 0.5, r, r);
    }
    // Mineral crack veins
    ctxA.strokeStyle = 'rgba(42, 54, 62, 0.35)';
    ctxA.lineWidth = 1.4;
    for (let k = 0; k < 14; k++) {
      const sx = hash2(k, 81) * 128;
      const sy = hash2(k, 97) * 128;
      ctxA.beginPath();
      ctxA.moveTo(sx, sy);
      ctxA.lineTo(sx + (hash2(k, 11) - 0.5) * 42, sy + (hash2(k, 23) - 0.5) * 28);
      ctxA.stroke();
    }
  }
  const rockMap = new THREE.CanvasTexture(rockAlbedoCanvas);
  rockMap.colorSpace = THREE.SRGBColorSpace;
  rockMap.wrapS = rockMap.wrapT = THREE.RepeatWrapping;
  rockMap.repeat.set(2, 2);
  rockMap.anisotropy = Math.max(1, Math.min(8, maxAniso));

  const rockRough = new THREE.CanvasTexture(rockRoughCanvas);
  rockRough.wrapS = rockRough.wrapT = THREE.RepeatWrapping;
  rockRough.repeat.set(2, 2);

  const rockNormal = createProceduralNormalTexture(128, maxAniso, 2, 2, 3.4, (u, v) =>
    fbm2(u * 9, v * 9)
  );
  textures.push(rockMap, rockRough, rockNormal);

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: rockMap,
    normalMap: rockNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: rockRough,
    roughness: 0.88,
    metalness: 0.04,
    vertexColors: true,
  });

  // 2. Layered Soft-Edged Moss Carpet (Alpha-feathered organic pad, roughness 1.0)
  const mossAlbedoCanvas = document.createElement('canvas');
  const mossAlphaCanvas = document.createElement('canvas');
  mossAlbedoCanvas.width = mossAlphaCanvas.width = 128;
  mossAlbedoCanvas.height = mossAlphaCanvas.height = 128;
  {
    const ctxA = mossAlbedoCanvas.getContext('2d')!;
    const ctxAl = mossAlphaCanvas.getContext('2d')!;
    ctxA.fillStyle = '#3B6F56';
    ctxA.fillRect(0, 0, 128, 128);

    // Feathered organic blotch alpha edge
    ctxAl.fillStyle = '#000000';
    ctxAl.fillRect(0, 0, 128, 128);
    const radGrad = ctxAl.createRadialGradient(64, 64, 18, 64, 64, 60);
    radGrad.addColorStop(0, '#FFFFFF');
    radGrad.addColorStop(0.65, '#C8C8C8');
    radGrad.addColorStop(1, '#000000');
    ctxAl.fillStyle = radGrad;
    ctxAl.fillRect(0, 0, 128, 128);

    for (let i = 0; i < 360; i++) {
      const px = hash2(i, 13) * 110 + 9;
      const py = hash2(i, 29) * 110 + 9;
      const r = 2 + hash2(i, 41) * 4.5;
      const n = hash2(i, 61);
      ctxA.fillStyle = n > 0.65 ? '#6EA875' : n > 0.32 ? '#3B785B' : '#1E4638';
      ctxA.beginPath();
      ctxA.arc(px, py, r, 0, Math.PI * 2);
      ctxA.fill();
      if (Math.hypot(px - 64, py - 64) > 36 && n > 0.45) {
        ctxAl.fillStyle = 'rgba(255,255,255,0.45)';
        ctxAl.beginPath();
        ctxAl.arc(px, py, r * 1.1, 0, Math.PI * 2);
        ctxAl.fill();
      }
    }
  }
  const mossMap = new THREE.CanvasTexture(mossAlbedoCanvas);
  mossMap.colorSpace = THREE.SRGBColorSpace;
  const mossAlpha = new THREE.CanvasTexture(mossAlphaCanvas);
  const mossNormal = createProceduralNormalTexture(128, maxAniso, 1, 1, 2.6, (u, v) =>
    fbm2(u * 16, v * 16)
  );
  textures.push(mossMap, mossAlpha, mossNormal);

  const mossMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: mossMap,
    alphaMap: mossAlpha,
    normalMap: mossNormal,
    normalScale: new THREE.Vector2(0.75, 0.75),
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    alphaTest: 0.25,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  // 3. Curved Wind-Swaying Grass Blade Textures (Base + Alpha + Emissive Tip Mask)
  const grassAlbedoCanvas = document.createElement('canvas');
  const grassEmissiveCanvas = document.createElement('canvas');
  grassAlbedoCanvas.width = grassEmissiveCanvas.width = 64;
  grassAlbedoCanvas.height = grassEmissiveCanvas.height = 128;
  {
    const ctxA = grassAlbedoCanvas.getContext('2d')!;
    const ctxE = grassEmissiveCanvas.getContext('2d')!;
    const gGrad = ctxA.createLinearGradient(0, 128, 0, 0);
    gGrad.addColorStop(0, '#2B4C38');
    gGrad.addColorStop(0.55, '#598D5B');
    gGrad.addColorStop(1, '#A9D68A');
    ctxA.fillStyle = gGrad;
    ctxA.fillRect(0, 0, 64, 128);

    // Vein striations
    ctxA.fillStyle = 'rgba(255, 255, 220, 0.16)';
    ctxA.fillRect(30, 0, 4, 128);

    // Soft glowing tip mask in emissiveMap (only top 28% glows)
    const eGrad = ctxE.createLinearGradient(0, 128, 0, 0);
    eGrad.addColorStop(0, '#000000');
    eGrad.addColorStop(0.68, '#080808');
    eGrad.addColorStop(1, '#FFFFFF');
    ctxE.fillStyle = eGrad;
    ctxE.fillRect(0, 0, 64, 128);
  }
  const grassMap = new THREE.CanvasTexture(grassAlbedoCanvas);
  grassMap.colorSpace = THREE.SRGBColorSpace;
  const grassEmissive = new THREE.CanvasTexture(grassEmissiveCanvas);
  grassEmissive.colorSpace = THREE.SRGBColorSpace;
  textures.push(grassMap, grassEmissive);

  const windUniforms = {
    uWindTime: { value: 0 },
    uWindStrength: { value: 0.16 },
  };

  const applyWindSwayShader = (mat: THREE.MeshStandardMaterial) => {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uWindTime = windUniforms.uWindTime;
      shader.uniforms.uWindStrength = windUniforms.uWindStrength;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uWindTime;
          uniform float uWindStrength;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float hFactor = clamp(position.y, 0.0, 1.4);
          vec4 instWorld = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            instWorld = instanceMatrix * instWorld;
          #endif
          float phase = instWorld.x * 0.55 + instWorld.z * 0.48 + uWindTime * 2.1;
          float gust = sin(phase) + 0.45 * sin(phase * 2.3 + 1.1);
          transformed.x += gust * hFactor * hFactor * uWindStrength;
          transformed.z += cos(phase * 0.85) * hFactor * hFactor * uWindStrength * 0.65;`
        );
    };
  };

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grassMap,
    emissive: new THREE.Color('#6BB860'),
    emissiveMap: grassEmissive,
    emissiveIntensity: 0.24,
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  applyWindSwayShader(grassMat);

  const grassGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C8F7EC'),
    map: grassMap,
    emissive: new THREE.Color('#2FC49C'),
    emissiveMap: grassEmissive,
    emissiveIntensity: 0.48,
    roughness: 0.58,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  applyWindSwayShader(grassGlowMat);

  // 4. Tree Bark (Roughness 0.7, vertical furrow Normal Map)
  const barkCanvas = document.createElement('canvas');
  barkCanvas.width = barkCanvas.height = 128;
  {
    const ctx = barkCanvas.getContext('2d')!;
    ctx.fillStyle = '#4B382C';
    ctx.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 128; x += 4) {
      const n = hash2(x, 3);
      ctx.fillStyle = n > 0.5 ? 'rgba(98, 76, 60, 0.38)' : 'rgba(28, 20, 14, 0.42)';
      ctx.fillRect(x, 0, 2 + (n > 0.7 ? 2 : 0), 128);
    }
    for (let k = 0; k < 48; k++) {
      const lx = hash2(k, 5) * 128;
      const ly = hash2(k, 17) * 128;
      ctx.fillStyle = 'rgba(130, 152, 118, 0.16)';
      ctx.fillRect(lx, ly, 4, 8);
    }
  }
  const barkMap = new THREE.CanvasTexture(barkCanvas);
  barkMap.colorSpace = THREE.SRGBColorSpace;
  barkMap.wrapS = barkMap.wrapT = THREE.RepeatWrapping;
  barkMap.repeat.set(2, 3);
  const barkNormal = createProceduralNormalTexture(128, maxAniso, 2, 3, 3.8, (u, v) =>
    fbm2(u * 22, v * 5)
  );
  textures.push(barkMap, barkNormal);

  const barkMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: barkMap,
    normalMap: barkNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.72,
    metalness: 0.02,
  });

  // 5. Foliage Crowns (Olive, Pine, Autumn Cypress)
  const foliageNormal = createProceduralNormalTexture(128, maxAniso, 2, 2, 2.2, (u, v) =>
    fbm2(u * 14, v * 14)
  );
  textures.push(foliageNormal);

  const makeFoliageMat = (baseHex: string, sheenHex: string) =>
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseHex),
      normalMap: foliageNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.78,
      metalness: 0.0,
      sheen: 0.45,
      sheenRoughness: 0.65,
      sheenColor: new THREE.Color(sheenHex),
    });

  const foliageOliveMat = makeFoliageMat('#467550', '#A8C996');
  const foliagePineMat = makeFoliageMat('#215545', '#6BB39B');
  const foliageAutumnMat = makeFoliageMat('#B8552E', '#FFAE52');

  const petalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFE2CC'),
    emissive: new THREE.Color('#784220'),
    emissiveIntensity: 0.16,
    roughness: 0.38,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.35,
    thickness: 0.15,
    transparent: isSoftwareGl,
    opacity: isSoftwareGl ? 0.88 : 1.0,
    side: THREE.DoubleSide,
  });

  materials.push(
    rockMat,
    mossMat,
    grassMat,
    grassGlowMat,
    barkMat,
    foliageOliveMat,
    foliagePineMat,
    foliageAutumnMat,
    petalMat
  );

  return {
    rockMat,
    mossMat,
    grassMat,
    grassGlowMat,
    barkMat,
    foliageOliveMat,
    foliagePineMat,
    foliageAutumnMat,
    petalMat,
    windUniforms,
    dispose: () => {
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}

/**
 * Creates a flattened noise-displaced boulder master geometry with slate->deep-blue vertex colors.
 */
function createDisplacedRockGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.0, 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTop = new THREE.Color('#6F828C');
  const cMid = new THREE.Color('#3C505C');
  const cBase = new THREE.Color('#182834');
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const n = fbm2(x * 1.8 + 4.1, z * 1.8 + y * 1.3 + 7.2);
    const disp = 0.72 + n * 0.56;
    x *= disp;
    z *= disp;
    // Flatten underside & upper terrace facet
    y = y < 0 ? y * 0.45 * disp : y * 0.68 * disp;
    pos.setXYZ(i, x, y, z);

    const hT = THREE.MathUtils.clamp((y + 0.45) / 1.1, 0, 1);
    if (hT < 0.45) {
      tmp.copy(cBase).lerp(cMid, hT / 0.45);
    } else {
      tmp.copy(cMid).lerp(cTop, (hT - 0.45) / 0.55);
    }
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Instanced Field of noise-displaced natural boulders & coastal/cavern rocks (<RockField />).
 */
export function buildRockField(
  specs: RockInstanceSpec[],
  mats: NatureMaterialSet,
  castShadow = true
): { mesh: THREE.InstancedMesh; geometry: THREE.BufferGeometry } {
  const geometry = createDisplacedRockGeometry();
  const mesh = new THREE.InstancedMesh(geometry, mats.rockMat, specs.length);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.rotY, s.rotZ ?? 0);
    dummy.scale.set(s.scaleX, s.scaleY, s.scaleZ);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    if (s.colorHex) {
      color.set(s.colorHex);
    } else {
      const tint = 0.85 + hash2(i, 41) * 0.3;
      color.setRGB(tint * 0.94, tint, tint * 1.04);
    }
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return { mesh, geometry };
}

/**
 * Instanced soft-edged Moss Carpets (<MossCarpetField />).
 */
export function buildMossCarpetField(
  specs: MossPatchSpec[],
  mats: NatureMaterialSet
): { mesh: THREE.InstancedMesh; geometry: THREE.BufferGeometry } {
  const geometry = new THREE.PlaneGeometry(2.0, 2.0, 2, 2);
  geometry.rotateX(-Math.PI * 0.5);
  // Subtle dome arch so moss hugs stone cleanly without z-fighting
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.min(1, Math.hypot(x, z));
    pos.setY(i, 0.025 + (1 - r * r) * 0.045);
  }
  geometry.computeVertexNormals();

  const mesh = new THREE.InstancedMesh(geometry, mats.mossMat, specs.length);
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.rotY, 0);
    dummy.scale.set(s.radius, 1.0, s.radius * (0.85 + hash2(i, 19) * 0.3));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (s.colorHex) {
      color.set(s.colorHex);
    } else {
      color.setHSL(0.41 + hash2(i, 7) * 0.06, 0.42, 0.44 + hash2(i, 11) * 0.14);
    }
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return { mesh, geometry };
}

/**
 * Curved 3-segment tapered cross-tuft grass blade master geometry.
 */
function createCurvedGrassTuftGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const bladeSpecs: Array<[number, number, number, number, number]> = [
    // angle, baseRadius, curveOut, heightMult, width
    [0.0, 0.04, 0.22, 1.0, 0.058],
    [1.05, 0.09, 0.28, 0.88, 0.052],
    [2.1, 0.06, 0.24, 1.08, 0.056],
    [3.2, 0.11, 0.3, 0.82, 0.048],
    [4.25, 0.05, 0.25, 0.95, 0.054],
    [5.35, 0.09, 0.29, 0.86, 0.05],
  ];
  const segs = 3;
  let vertOffset = 0;

  for (let b = 0; b < bladeSpecs.length; b++) {
    const [ang, baseR, curve, hMult, baseW] = bladeSpecs[b];
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const rootX = cos * baseR;
    const rootZ = sin * baseR;

    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const w = baseW * (1 - t * 0.88);
      const y = t * hMult;
      const bend = t * t * curve;
      const ox = rootX + cos * bend;
      const oz = rootZ + sin * bend;

      const lx = ox - sin * w;
      const lz = oz + cos * w;
      const rx = ox + sin * w;
      const rz = oz - cos * w;

      positions.push(lx, y, lz, rx, y, rz);
      uvs.push(0, t, 1, t);
      normals.push(cos * 0.4, 0.82, sin * 0.4, cos * 0.4, 0.82, sin * 0.4);
    }

    for (let s = 0; s < segs; s++) {
      const i0 = vertOffset + s * 2;
      const i1 = i0 + 1;
      const i2 = i0 + 2;
      const i3 = i0 + 3;
      indices.push(i0, i1, i2, i1, i3, i2);
    }
    vertOffset += (segs + 1) * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Instanced GPU wind-animated grass field (<InstancedGrassField />).
 */
export function buildInstancedGrassField(
  specs: GrassPatchSpec[],
  mats: NatureMaterialSet,
  bioluminescent = false
): { mesh: THREE.InstancedMesh; geometry: THREE.BufferGeometry } {
  const geometry = createCurvedGrassTuftGeometry();
  const mat = bioluminescent ? mats.grassGlowMat : mats.grassMat;
  const mesh = new THREE.InstancedMesh(geometry, mat, specs.length);
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.rotY, 0);
    const xz = s.scaleXZ ?? 1.0;
    dummy.scale.set(xz, s.height, xz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    if (s.colorHex) {
      color.set(s.colorHex);
    } else if (bioluminescent) {
      color.setHSL(0.45 + hash2(i, 31) * 0.08, 0.72, 0.62 + hash2(i, 17) * 0.16);
    } else {
      color.setHSL(0.28 + hash2(i, 23) * 0.07, 0.45, 0.56 + hash2(i, 13) * 0.18);
    }
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return { mesh, geometry };
}

/**
 * Builds a multi-tier LOD Mediterranean Olive / Coastal Pine / Autumn Cypress tree
 * using curved TubeGeometry bark trunk + branches & lush foliage clusters.
 */
export function buildBiomeTreeLOD(
  kind: BiomeTreeKind,
  mats: NatureMaterialSet,
  seedIdx = 0
): { lod: THREE.LOD; disposables: THREE.BufferGeometry[] } {
  const lod = new THREE.LOD();
  const disposables: THREE.BufferGeometry[] = [];
  const leafMat =
    kind === 'olive'
      ? mats.foliageOliveMat
      : kind === 'pine'
        ? mats.foliagePineMat
        : mats.foliageAutumnMat;

  const leanX = (hash2(seedIdx, 3) - 0.5) * 0.45;
  const leanZ = (hash2(seedIdx, 9) - 0.5) * 0.45;
  const h = kind === 'pine' ? 3.8 : kind === 'autumn_cypress' ? 4.2 : 3.1;

  // --- High Detail Level (distance < 32m) ---
  const hi = new THREE.Group();
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(leanX * 0.4, h * 0.38, leanZ * 0.4),
    new THREE.Vector3(leanX, h * 0.85, leanZ),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 8, 0.15, 7, false);
  disposables.push(trunkGeo);
  const trunk = new THREE.Mesh(trunkGeo, mats.barkMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  hi.add(trunk);

  const branchSpecs: Array<[number, number, number]> =
    kind === 'autumn_cypress'
      ? [
          [0.42, h * 0.46, 0.28],
          [-0.4, h * 0.54, -0.26],
          [0.24, h * 0.66, -0.34],
          [-0.26, h * 0.76, 0.32],
          [0.0, h * 0.88, 0.0],
        ]
      : [
          [0.75, h * 0.72, 0.35],
          [-0.72, h * 0.78, -0.32],
          [0.15, h * 0.92, -0.68],
          [-0.22, h * 0.96, 0.65],
        ];

  const canopyGeo = new THREE.DodecahedronGeometry(0.76, 1);
  disposables.push(canopyGeo);

  for (let i = 0; i < branchSpecs.length; i++) {
    const [bx, by, bz] = branchSpecs[i];
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(leanX * 0.5, h * 0.45, leanZ * 0.5),
      new THREE.Vector3((leanX + bx) * 0.55, by * 0.88, (leanZ + bz) * 0.55),
      new THREE.Vector3(leanX + bx, by, leanZ + bz),
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 5, 0.072, 6, false);
    disposables.push(bGeo);
    const branchMesh = new THREE.Mesh(bGeo, mats.barkMat);
    branchMesh.castShadow = true;
    hi.add(branchMesh);

    const cluster = new THREE.Mesh(canopyGeo, leafMat);
    cluster.position.set(leanX + bx, by + (kind === 'autumn_cypress' ? 0.32 : 0.22), leanZ + bz);
    const s = 0.82 + hash2(seedIdx + i, 29) * 0.36;
    const tierNarrow = kind === 'autumn_cypress' ? Math.max(0.55, 1.05 - i * 0.12) : 1.15;
    cluster.scale.set(
      kind === 'autumn_cypress' ? s * tierNarrow : s * 1.15,
      kind === 'autumn_cypress' ? s * 1.38 : s * 0.82,
      kind === 'autumn_cypress' ? s * tierNarrow : s * 1.15
    );
    cluster.rotation.y = i * 0.9 + seedIdx;
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    hi.add(cluster);
  }

  // Crown cap
  const crown = new THREE.Mesh(canopyGeo, leafMat);
  crown.position.set(leanX, h + (kind === 'autumn_cypress' ? 0.42 : 0.1), leanZ);
  crown.scale.set(
    kind === 'autumn_cypress' ? 0.58 : 1.25,
    kind === 'autumn_cypress' ? 1.52 : 0.88,
    kind === 'autumn_cypress' ? 0.58 : 1.25
  );
  crown.castShadow = true;
  hi.add(crown);

  // --- Low Detail LOD Level (distance >= 32m: 2 simple meshes, zero shadow) ---
  const lo = new THREE.Group();
  const loTrunkGeo = new THREE.CylinderGeometry(0.11, 0.16, h * 0.85, 6);
  const loLeafGeo = new THREE.IcosahedronGeometry(1.12, 0);
  disposables.push(loTrunkGeo, loLeafGeo);

  const loTrunk = new THREE.Mesh(loTrunkGeo, mats.barkMat);
  loTrunk.position.y = h * 0.42;
  const loCrown = new THREE.Mesh(loLeafGeo, leafMat);
  loCrown.position.set(leanX * 0.7, h * 0.92, leanZ * 0.7);
  if (kind !== 'autumn_cypress') loCrown.scale.set(1.15, 0.75, 1.15);
  lo.add(loTrunk, loCrown);

  lod.addLevel(hi, 0);
  lod.addLevel(lo, 32);
  return { lod, disposables };
}
