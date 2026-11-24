import * as THREE from 'three';

export const PALETTE = {
  slateDark: '#1D2C31',
  slateMasonry: '#26353B',
  verdigris: '#3F7D70',
  brass: '#8F5E46',
  mist: '#9EB4AD',
  fogTeal: '#1A2E33',
  pipFur: '#C8662B',
  pipDark: '#241915',
  amberChime: '#F4A949',
  dangerBeam: '#FF5733',
  dawnKey: '#FFC98B',
  hemiSky: '#75A3AD',
  hemiGround: '#132024',
} as const;

export interface WorldMaterialSet {
  slateRoof: THREE.MeshStandardMaterial;
  masonryWall: THREE.MeshStandardMaterial;
  verdigrisRoof: THREE.MeshStandardMaterial;
  brassTrim: THREE.MeshPhysicalMaterial;
  darkIron: THREE.MeshStandardMaterial;
  woodCatwalk: THREE.MeshPhysicalMaterial;
  windowGlass: THREE.MeshPhysicalMaterial;
  lanternGlow: THREE.MeshStandardMaterial;
  echoLedge: THREE.MeshStandardMaterial;
  mossFoliage: THREE.MeshStandardMaterial;
  terracottaPot: THREE.MeshStandardMaterial;
  biomeStoneGrotto: THREE.MeshStandardMaterial;
  biomeSandstoneSpire: THREE.MeshStandardMaterial;
  interiorPlaster: THREE.MeshStandardMaterial;
  interiorRug: THREE.MeshStandardMaterial;
  interiorCushion: THREE.MeshPhysicalMaterial;
  hearthGlow: THREE.MeshStandardMaterial;
  awningFabric: THREE.MeshPhysicalMaterial;
  waterSurface: THREE.MeshPhysicalMaterial;
  waterUniforms: {
    uTime: { value: number };
    uWaterQuality: { value: number };
    uEnableGlints: { value: number };
    uRainIntensity: { value: number };
    uSunDir: { value: THREE.Vector3 };
    uSkyReflectTint: { value: THREE.Color };
  };
  causticsUniforms: {
    uTime: { value: number };
    uCausticsStrength: { value: number };
  };
  beamMaterial: THREE.ShaderMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  moteTexture: THREE.CanvasTexture;
  steamTexture: THREE.CanvasTexture;
  dispose: () => void;
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 4): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return v;
}

function createCanvasPair(
  size: number,
  repeatX: number,
  repeatY: number,
  maxAniso: number,
  painter: (
    albedo: CanvasRenderingContext2D,
    bump: CanvasRenderingContext2D,
    rough: CanvasRenderingContext2D,
    size: number
  ) => void
): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const cA = document.createElement('canvas');
  const cB = document.createElement('canvas');
  const cR = document.createElement('canvas');
  cA.width = cB.width = cR.width = size;
  cA.height = cB.height = cR.height = size;

  painter(cA.getContext('2d')!, cB.getContext('2d')!, cR.getContext('2d')!, size);

  const setup = (canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.max(1, Math.min(8, maxAniso));
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  return {
    map: setup(cA, true),
    bumpMap: setup(cB, false),
    roughnessMap: setup(cR, false),
  };
}

function makeContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(8, 15, 18, 0.78)');
  grad.addColorStop(0.55, 'rgba(8, 15, 18, 0.36)');
  grad.addColorStop(1, 'rgba(8, 15, 18, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSoftMoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 228, 185, 1.0)');
  grad.addColorStop(0.35, 'rgba(244, 169, 73, 0.55)');
  grad.addColorStop(1, 'rgba(244, 169, 73, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSteamWispTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(205, 224, 220, 0.72)');
  grad.addColorStop(0.45, 'rgba(158, 180, 173, 0.34)');
  grad.addColorStop(1, 'rgba(158, 180, 173, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


/**
 * Generates an atmospheric Copper Dawn HDR-like environment cube map using PMREMGenerator
 * so every metallic brass gear, wet slate puddle, and cat eye reflects warm amber dawn + cool teal mist.
 */
export function createDawnEnvironment(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();

  const skyGeo = new THREE.SphereGeometry(20, 32, 20);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
        // Deep emerald-teal canal nadir bounce -> misty copper-rose horizon -> cool twilight indigo zenith
        vec3 canalNadir = vec3(0.03, 0.08, 0.10);
        vec3 canalBounce = vec3(0.08, 0.22, 0.24);
        vec3 horizon = vec3(0.24, 0.34, 0.34);
        vec3 midSky = vec3(0.11, 0.23, 0.28);
        vec3 zenith = vec3(0.04, 0.09, 0.14);

        vec3 col = mix(canalNadir, canalBounce, smoothstep(0.08, 0.44, h));
        col = mix(col, horizon, smoothstep(0.42, 0.52, h));
        col = mix(col, midSky, smoothstep(0.52, 0.72, h));
        col = mix(col, zenith, smoothstep(0.72, 0.98, h));

        // Warm golden dawn sun + wide atmospheric horizon band
        vec3 sunDir = normalize(vec3(0.68, 0.36, 0.63));
        float sunDot = max(0.0, dot(d, sunDir));
        col += vec3(3.4, 2.15, 1.15) * pow(sunDot, 26.0);
        col += vec3(1.15, 0.64, 0.28) * pow(sunDot, 4.5) * 0.78;

        // Warm harbor lantern rim band near horizon
        float horizonBand = exp(-pow((d.y - 0.04) * 7.5, 2.0));
        col += vec3(0.32, 0.19, 0.09) * horizonBand * (0.45 + 0.55 * sunDot);

        // Cool cyan-slate mist bounce opposite sun
        vec3 fillDir = normalize(vec3(-0.7, 0.28, -0.6));
        float fillDot = max(0.0, dot(d, fillDir));
        col += vec3(0.22, 0.44, 0.50) * pow(fillDot, 2.6);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skySphere = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(skySphere);

  const envTarget = pmrem.fromScene(envScene, 0.02);
  skyGeo.dispose();
  skyMat.dispose();
  pmrem.dispose();
  return envTarget;
}

export interface SkyDaylightUpdate {
  time: number;
  duskFactor: number;
  horizonColor: THREE.Color;
  midColor: THREE.Color;
  topColor: THREE.Color;
  sunDir: readonly [number, number, number];
  sunGlowColor: THREE.Color;
}

export function createDawnSkyDome(): {
  mesh: THREE.Mesh;
  setEcoMode: (eco: boolean) => void;
  setDaylight: (opts: SkyDaylightUpdate) => void;
  dispose: () => void;
} {
  const geo = new THREE.SphereGeometry(480, 36, 26);
  const uniforms = {
    uEcoMode: { value: 0 },
    uTime: { value: 0 },
    uDuskFactor: { value: 0.14 },
    uHorizonColor: { value: new THREE.Color('#2A484E') },
    uMidColor: { value: new THREE.Color('#203F48') },
    uTopColor: { value: new THREE.Color('#0E1E24') },
    uSunDir: { value: new THREE.Vector3(0.64, 0.30, 0.71).normalize() },
    uSunGlowColor: { value: new THREE.Color('#FFC98B') },
  };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uEcoMode;
      uniform float uTime;
      uniform float uDuskFactor;
      uniform vec3 uHorizonColor;
      uniform vec3 uMidColor;
      uniform vec3 uTopColor;
      uniform vec3 uSunDir;
      uniform vec3 uSunGlowColor;
      varying vec3 vWorldDir;
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float cloudFbm(vec2 p) {
        return noise(p) * 0.55 + noise(p * 2.13 + vec2(4.2, 1.7)) * 0.30 + noise(p * 4.4 - vec2(1.3, 6.5)) * 0.15;
      }
      void main() {
        vec3 d = normalize(vWorldDir);
        float y = d.y;
        if (uEcoMode > 0.5) {
          vec3 ecoLow = mix(uHorizonColor * 1.45, vec3(0.24, 0.41, 0.47), 0.35);
          vec3 ecoHigh = mix(uMidColor * 1.55, vec3(0.42, 0.58, 0.64), 0.35);
          vec3 ecoSky = mix(ecoLow, ecoHigh, smoothstep(-0.05, 0.55, y));
          gl_FragColor = vec4(ecoSky, 1.0);
          return;
        }

        vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.24, y));
        col = mix(col, uTopColor, smoothstep(0.20, 0.78, y));

        // Mie horizon atmospheric scatter & solar disc
        vec3 sunDir = normalize(uSunDir);
        float sunAmt = max(0.0, dot(d, sunDir));
        float horizonGlowBand = exp(-abs(y - 0.03) * 9.0);
        col += uSunGlowColor * pow(sunAmt, 3.2) * (0.28 + 0.26 * horizonGlowBand) * smoothstep(-0.10, 0.25, y);
        col += mix(uSunGlowColor, vec3(1.0, 0.95, 0.84), 0.55) * pow(sunAmt, 52.0) * 0.72;

        // Subtle silver crescent moon halo opposite the sun during Dusk
        if (uDuskFactor > 0.15 && y > 0.05) {
          vec3 moonDir = normalize(vec3(-sunDir.x * 0.75, max(0.24, 0.52 - sunDir.y * 0.3), -sunDir.z * 0.75));
          float moonDot = max(0.0, dot(d, moonDir));
          float moonDisc = smoothstep(0.9986, 0.9993, moonDot);
          float moonGlow = pow(moonDot, 22.0) * 0.22;
          col += vec3(0.76, 0.88, 1.0) * (moonDisc * 0.9 + moonGlow) * smoothstep(0.15, 0.75, uDuskFactor);
        }

        // Layered sunlit Venetian cloud strata
        if (y > 0.015) {
          vec2 uv = d.xz / (y + 0.32) * 1.35 + vec2(uTime * 0.007, uTime * 0.0035);
          float c = cloudFbm(uv * 2.1);
          float cloudDensity = smoothstep(0.45, 0.78, c);
          float cloudMask = cloudDensity * smoothstep(0.015, 0.22, y) * (1.0 - smoothstep(0.46, 0.86, y));
          float edgeRim = smoothstep(0.42, 0.62, c) * (1.0 - smoothstep(0.65, 0.88, c));
          vec3 cloudShadow = mix(uMidColor * 1.15, uTopColor * 1.25, 0.4);
          vec3 cloudLit = mix(uMidColor * 1.45, uSunGlowColor * 1.02, 0.35 + 0.55 * pow(sunAmt, 2.0));
          vec3 cloudCol = mix(cloudShadow, cloudLit, clamp(edgeRim * 0.75 + pow(sunAmt, 1.6) * 0.65, 0.0, 1.0));
          col = mix(col, cloudCol, cloudMask * 0.46);
        }

        // Crisp twinkling stars emerging smoothly during Dusk
        if (uDuskFactor > 0.08 && y > 0.06) {
          vec2 starGrid = floor((d.xz / (y + 0.45)) * 82.0);
          vec2 starFract = fract((d.xz / (y + 0.45)) * 82.0) - 0.5;
          float rnd = hash(starGrid);
          if (rnd > 0.955) {
            float starDist = length(starFract);
            float twinkle = 0.65 + 0.35 * sin(uTime * (2.0 + fract(rnd * 31.0) * 3.5) + rnd * 40.0);
            float starGlow = smoothstep(0.28, 0.02, starDist) * twinkle;
            float horizonMask = smoothstep(0.06, 0.34, y);
            col += vec3(0.88, 0.93, 1.0) * starGlow * uDuskFactor * horizonMask * 0.9;
          }
        }

        // Seamless blend to horizon/fog color below horizon
        col = mix(uHorizonColor, col, smoothstep(-0.04, 0.12, y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return {
    mesh,
    setEcoMode: (eco: boolean) => {
      uniforms.uEcoMode.value = eco ? 1 : 0;
    },
    setDaylight: (opts: SkyDaylightUpdate) => {
      uniforms.uTime.value = opts.time;
      uniforms.uDuskFactor.value = opts.duskFactor;
      uniforms.uHorizonColor.value.copy(opts.horizonColor);
      uniforms.uMidColor.value.copy(opts.midColor);
      uniforms.uTopColor.value.copy(opts.topColor);
      uniforms.uSunDir.value.set(opts.sunDir[0], opts.sunDir[1], opts.sunDir[2]).normalize();
      uniforms.uSunGlowColor.value.copy(opts.sunGlowColor);
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

export function createWorldMaterials(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl = false
): WorldMaterialSet {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const textures: THREE.Texture[] = [];

  // 1. Wet Venetian Slate Roof Tiles (with rain puddles in roughnessMap + stone relief in bumpMap)
  const slateMaps = createCanvasPair(512, 2.5, 2.5, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#19262B';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#202020';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#9E9E9E';
    ctxR.fillRect(0, 0, s, s);

    const rows = 10;
    const cols = 6;
    const h = s / rows;
    const w = s / cols;

    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (w * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * w + off;
        const y = r * h;
        const n = hash2(c + 19, r + 7);
        const baseR = Math.round(28 + n * 16);
        const baseG = Math.round(44 + n * 18);
        const baseB = Math.round(50 + n * 18);
        ctxA.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
        ctxA.fillRect(x + 2, y + 2, w - 4, h - 4);

        // Chipped slate edge highlight
        ctxA.fillStyle = 'rgba(158, 180, 173, 0.11)';
        ctxA.fillRect(x + 3, y + 2, w - 6, 3);

        // Tile height for bump
        const bVal = Math.round(145 + n * 65);
        ctxB.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
        ctxB.fillRect(x + 3, y + 3, w - 6, h - 6);

        // Per-tile dampness variation
        const rVal = Math.round(105 + n * 75);
        ctxR.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
        ctxR.fillRect(x + 2, y + 2, w - 4, h - 4);
      }
    }

    // Rainwater puddles & subtle moss streaks across tiles
    const imgA = ctxA.getImageData(0, 0, s, s);
    const imgR = ctxR.getImageData(0, 0, s, s);
    for (let py = 0; py < s; py += 2) {
      for (let px = 0; px < s; px += 2) {
        const wet = fbm(px / 72, py / 72, 3);
        const grain = hash2(px, py) * 14 - 7;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const idx = ((py + dy) * s + (px + dx)) * 4;
            if (wet > 0.57) {
              // Glossy puddle: slightly darker albedo, very low roughness (18..40)
              imgA.data[idx] = Math.max(10, imgA.data[idx] * 0.76);
              imgA.data[idx + 1] = Math.max(15, imgA.data[idx + 1] * 0.8);
              imgA.data[idx + 2] = Math.max(18, imgA.data[idx + 2] * 0.84);
              const gloss = Math.round(16 + (1 - wet) * 50);
              imgR.data[idx] = imgR.data[idx + 1] = imgR.data[idx + 2] = gloss;
            } else {
              imgA.data[idx] = Math.min(255, Math.max(0, imgA.data[idx] + grain));
              imgA.data[idx + 1] = Math.min(255, Math.max(0, imgA.data[idx + 1] + grain));
              imgA.data[idx + 2] = Math.min(255, Math.max(0, imgA.data[idx + 2] + grain));
            }
          }
        }
      }
    }
    ctxA.putImageData(imgA, 0, 0);
    ctxR.putImageData(imgR, 0, 0);
  });
  textures.push(slateMaps.map, slateMaps.bumpMap, slateMaps.roughnessMap);

  // 2. Patina Oxidized Verdigris Standing-Seam Copper
  const copperMaps = createCanvasPair(512, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#387266';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#888888';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#A8A8A8';
    ctxR.fillRect(0, 0, s, s);

    const panels = 8;
    const pw = s / panels;
    for (let i = 0; i < panels; i++) {
      const x = i * pw;
      const n = hash2(i, 3);
      ctxA.fillStyle = `rgb(${Math.round(52 + n * 16)}, ${Math.round(112 + n * 20)}, ${Math.round(100 + n * 16)})`;
      ctxA.fillRect(x, 0, pw - 5, s);

      // Tarnished copper edge streak near batten seam
      ctxA.fillStyle = 'rgba(130, 86, 62, 0.35)';
      ctxA.fillRect(x + pw - 9, 0, 4, s);

      // Raised standing seam rib in bump + lower roughness on exposed bronze edge
      ctxA.fillStyle = '#254C44';
      ctxA.fillRect(x + pw - 5, 0, 5, s);
      ctxB.fillStyle = '#FFFFFF';
      ctxB.fillRect(x + pw - 5, 0, 4, s);
      ctxR.fillStyle = '#626262';
      ctxR.fillRect(x + pw - 5, 0, 5, s);

      // Horizontal lock seam + rivets
      ctxA.fillStyle = 'rgba(26, 48, 44, 0.45)';
      ctxA.fillRect(x, s * 0.5 - 2, pw, 3);
      ctxB.fillStyle = '#C8C8C8';
      ctxB.fillRect(x, s * 0.5 - 2, pw, 3);

      for (let r = 0; r < 6; r++) {
        const ry = (r + 0.5) * (s / 6);
        ctxA.fillStyle = '#6E4C3B';
        ctxA.beginPath();
        ctxA.arc(x + pw - 9, ry, 2.5, 0, Math.PI * 2);
        ctxA.fill();
        ctxB.fillStyle = '#F0F0F0';
        ctxB.beginPath();
        ctxB.arc(x + pw - 9, ry, 2.5, 0, Math.PI * 2);
        ctxB.fill();
      }
    }

    // Subtle rain patina streaks
    for (let k = 0; k < 120; k++) {
      const sx = hash2(k, 11) * s;
      const sy = hash2(k, 23) * s;
      const len = 30 + hash2(k, 31) * 70;
      ctxA.fillStyle = k % 3 === 0 ? 'rgba(158, 190, 178, 0.08)' : 'rgba(25, 45, 42, 0.09)';
      ctxA.fillRect(sx, sy, 3, len);
    }
  });
  textures.push(copperMaps.map, copperMaps.bumpMap, copperMaps.roughnessMap);

  // 3. Weathered Venetian Stone & Brick Masonry
  const masonryMaps = createCanvasPair(512, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#1E2A2F';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#2A2A2A';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#D8D8D8';
    ctxR.fillRect(0, 0, s, s);

    const rows = 12;
    const cols = 6;
    const h = s / rows;
    const w = s / cols;

    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (w * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * w + off;
        const y = r * h;
        const n = hash2(c * 3 + 5, r * 7 + 11);
        const tone = Math.round(n * 24 - 12);
        const warmShift = n > 0.68 ? 10 : 0;
        ctxA.fillStyle = `rgb(${44 + tone + warmShift}, ${56 + tone}, ${62 + tone})`;
        ctxA.fillRect(x + 3, y + 3, w - 6, h - 6);

        const b = Math.round(135 + n * 75);
        ctxB.fillStyle = `rgb(${b},${b},${b})`;
        ctxB.fillRect(x + 3, y + 3, w - 6, h - 6);

        const rv = Math.round(170 + n * 65);
        ctxR.fillStyle = `rgb(${rv},${rv},${rv})`;
        ctxR.fillRect(x + 3, y + 3, w - 6, h - 6);
      }
    }

    // Subtle stone grain speckles & mortar variation across entire tile (no UV-space waterline stripes;
    // world-space water caustics & wetBand handle true height-based shoreline darkening)
    for (let k = 0; k < 280; k++) {
      const gx = hash2(k, 17) * s;
      const gy = hash2(k, 43) * s;
      const gs = 2 + hash2(k, 61) * 4;
      ctxA.fillStyle = k % 2 === 0 ? 'rgba(210, 224, 226, 0.045)' : 'rgba(18, 26, 30, 0.065)';
      ctxA.fillRect(gx, gy, gs, gs * 0.7);
    }
  });
  textures.push(masonryMaps.map, masonryMaps.bumpMap, masonryMaps.roughnessMap);

  // 4. Aged Timber Planks
  const woodMaps = createCanvasPair(512, 1, 3, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#553A2C';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#606060';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#C8C8C8';
    ctxR.fillRect(0, 0, s, s);

    const planks = 6;
    const pw = s / planks;
    for (let p = 0; p < planks; p++) {
      const x = p * pw;
      const n = hash2(p, 19);
      ctxA.fillStyle = `rgb(${Math.round(86 + n * 24)}, ${Math.round(58 + n * 16)}, ${Math.round(44 + n * 12)})`;
      ctxA.fillRect(x + 2, 0, pw - 4, s);

      for (let g = 0; g < 26; g++) {
        const gx = x + 4 + hash2(p * 17 + g, 5) * (pw - 8);
        ctxA.fillStyle = g % 2 === 0 ? 'rgba(34, 22, 16, 0.25)' : 'rgba(145, 108, 84, 0.16)';
        ctxA.fillRect(gx, 0, 2, s);
        ctxB.fillStyle = g % 2 === 0 ? '#909090' : '#D0D0D0';
        ctxB.fillRect(gx, 0, 2, s);
      }

      // Plank dark gap
      ctxA.fillStyle = '#1D1410';
      ctxA.fillRect(x, 0, 3, s);
      ctxB.fillStyle = '#181818';
      ctxB.fillRect(x, 0, 3, s);
    }
  });
  textures.push(woodMaps.map, woodMaps.bumpMap, woodMaps.roughnessMap);

  // 5. Brushed Horological Brass (warm gilded bronze sheen with verdigris seam patina & edge wear)
  const brassMaps = createCanvasPair(256, 1, 1, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#C28A52';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#484848';
    ctxR.fillRect(0, 0, s, s);

    for (let i = 0; i < 180; i++) {
      const y = (i / 180) * s;
      const n = hash2(i, 9);
      ctxA.fillStyle = n > 0.48 ? 'rgba(246, 206, 152, 0.085)' : 'rgba(92, 54, 30, 0.075)';
      ctxA.fillRect(0, y, s, 1.5);
      const b = Math.round(118 + n * 24);
      ctxB.fillStyle = `rgb(${b},${b},${b})`;
      ctxB.fillRect(0, y, s, 1.5);
      const r = Math.round(52 + n * 48);
      ctxR.fillStyle = `rgb(${r},${r},${r})`;
      ctxR.fillRect(0, y, s, 1.5);
    }

    // Subtle recessed verdigris oxidation & micro-scratches
    for (let p = 0; p < 58; p++) {
      const px = hash2(p, 31) * s;
      const py = hash2(p, 47) * s;
      ctxA.fillStyle = p % 2 === 0 ? 'rgba(62, 118, 102, 0.14)' : 'rgba(54, 30, 18, 0.12)';
      ctxA.fillRect(px, py, 5, 36);
      if (p % 3 === 0) {
        ctxR.fillStyle = '#7E7E7E';
        ctxR.fillRect(px, py, 5, 36);
      }
    }
  });
  textures.push(brassMaps.map, brassMaps.bumpMap, brassMaps.roughnessMap);

  // 6. Hammered Wrought Iron (textured charcoal metal with micro-scratches & faint oxide crevices)
  const ironMaps = createCanvasPair(256, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#252D32';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#7C7C7C';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#6C6C6C';
    ctxR.fillRect(0, 0, s, s);

    for (let i = 0; i < 240; i++) {
      const px = hash2(i, 13) * s;
      const py = hash2(i, 29) * s;
      const rad = 3 + hash2(i, 41) * 9;
      const shade = hash2(i, 59);
      ctxA.fillStyle = shade > 0.55 ? 'rgba(62, 74, 82, 0.22)' : 'rgba(18, 22, 26, 0.28)';
      ctxA.beginPath();
      ctxA.arc(px, py, rad, 0, Math.PI * 2);
      ctxA.fill();
      const b = Math.round(108 + shade * 46);
      ctxB.fillStyle = `rgb(${b},${b},${b})`;
      ctxB.beginPath();
      ctxB.arc(px, py, rad, 0, Math.PI * 2);
      ctxB.fill();
      const rv = Math.round(78 + (1 - shade) * 58);
      ctxR.fillStyle = `rgb(${rv},${rv},${rv})`;
      ctxR.beginPath();
      ctxR.arc(px, py, rad, 0, Math.PI * 2);
      ctxR.fill();
    }
    // Fine metallic edge wear & rust flecks
    for (let k = 0; k < 70; k++) {
      const sx = hash2(k, 71) * s;
      const sy = hash2(k, 89) * s;
      ctxA.fillStyle = k % 4 === 0 ? 'rgba(116, 62, 36, 0.24)' : 'rgba(130, 148, 158, 0.14)';
      ctxA.fillRect(sx, sy, 14, 1.5);
    }
  });
  textures.push(ironMaps.map, ironMaps.bumpMap, ironMaps.roughnessMap);

  // 7. Venetian Leaded Diamond-Mullion Window Glass (map + emissiveMap + roughnessMap)
  const winAlbedo = document.createElement('canvas');
  const winEmissive = document.createElement('canvas');
  const winRough = document.createElement('canvas');
  winAlbedo.width = winEmissive.width = winRough.width = 256;
  winAlbedo.height = winEmissive.height = winRough.height = 256;
  {
    const ctxA = winAlbedo.getContext('2d')!;
    const ctxE = winEmissive.getContext('2d')!;
    const ctxR = winRough.getContext('2d')!;
    const s = 256;

    // Warm candlelit room depth gradient (brightest in lower-center hearth area, deeper amber near top frame)
    const gradA = ctxA.createRadialGradient(s * 0.5, s * 0.62, 12, s * 0.5, s * 0.52, s * 0.65);
    gradA.addColorStop(0, '#FFE7B5');
    gradA.addColorStop(0.55, '#E8A85A');
    gradA.addColorStop(1, '#68442B');
    ctxA.fillStyle = gradA;
    ctxA.fillRect(0, 0, s, s);

    const gradE = ctxE.createRadialGradient(s * 0.5, s * 0.64, 10, s * 0.5, s * 0.54, s * 0.62);
    gradE.addColorStop(0, '#FFE4A6');
    gradE.addColorStop(0.5, '#E89238');
    gradE.addColorStop(1, '#3D2212');
    ctxE.fillStyle = gradE;
    ctxE.fillRect(0, 0, s, s);

    // Glossy glass base in roughnessMap
    ctxR.fillStyle = '#1E1E1E';
    ctxR.fillRect(0, 0, s, s);

    // Subtle interior drape silhouette + candle warmth variation per glass pane
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const n = hash2(gx + 5, gy + 11);
        ctxE.fillStyle = n > 0.5 ? 'rgba(255, 224, 150, 0.16)' : 'rgba(90, 42, 18, 0.18)';
        ctxE.fillRect(gx * (s / 3), gy * (s / 4), s / 3, s / 4);
      }
    }

    // Crisp leaded diamond & rectangular Venetian muntin bars (dark & higher roughness)
    ctxA.strokeStyle = '#242A2E';
    ctxE.strokeStyle = '#080605';
    ctxR.strokeStyle = '#B8B8B8';
    ctxA.lineWidth = 5;
    ctxE.lineWidth = 6;
    ctxR.lineWidth = 6;

    const step = s / 4;
    for (let i = -s; i <= s * 2; i += step) {
      for (const ctx of [ctxA, ctxE, ctxR]) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + s * 0.65, s);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i, s);
        ctx.lineTo(i + s * 0.65, 0);
        ctx.stroke();
      }
    }
    // Outer sash border & central horizontal transom
    for (const ctx of [ctxA, ctxE, ctxR]) {
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, s - 10, s - 10);
      ctx.beginPath();
      ctx.moveTo(0, s * 0.5);
      ctx.lineTo(s, s * 0.5);
      ctx.stroke();
    }
  }
  const winMapTex = new THREE.CanvasTexture(winAlbedo);
  winMapTex.colorSpace = THREE.SRGBColorSpace;
  const winEmissiveTex = new THREE.CanvasTexture(winEmissive);
  winEmissiveTex.colorSpace = THREE.SRGBColorSpace;
  const winRoughTex = new THREE.CanvasTexture(winRough);
  textures.push(winMapTex, winEmissiveTex, winRoughTex);

  // 8. Porous Venetian Terracotta Clay (with bottom damp stain & lime salt efflorescence)
  const terracottaMaps = createCanvasPair(256, 1, 1, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#9A4F38';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#CECECE';
    ctxR.fillRect(0, 0, s, s);

    for (let i = 0; i < 420; i++) {
      const px = hash2(i, 3) * s;
      const py = hash2(i, 17) * s;
      const r = 1.5 + hash2(i, 43) * 4.5;
      const n = hash2(i, 61);
      ctxA.fillStyle = n > 0.72 ? 'rgba(214, 178, 152, 0.22)' : n < 0.28 ? 'rgba(72, 34, 24, 0.22)' : 'rgba(164, 88, 60, 0.24)';
      ctxA.beginPath();
      ctxA.arc(px, py, r, 0, Math.PI * 2);
      ctxA.fill();
      const b = Math.round(108 + n * 56);
      ctxB.fillStyle = `rgb(${b},${b},${b})`;
      ctxB.beginPath();
      ctxB.arc(px, py, r, 0, Math.PI * 2);
      ctxB.fill();
    }
    const damp = ctxA.createLinearGradient(0, s * 0.65, 0, s);
    damp.addColorStop(0, 'rgba(32, 48, 38, 0)');
    damp.addColorStop(1, 'rgba(38, 28, 22, 0.55)');
    ctxA.fillStyle = damp;
    ctxA.fillRect(0, 0, s, s);
  });
  textures.push(terracottaMaps.map, terracottaMaps.bumpMap, terracottaMaps.roughnessMap);

  // 9. Organic Moss & Sunlit Olive Foliage Texture
  const mossMaps = createCanvasPair(256, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#244A39';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#606060';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#D4D4D4';
    ctxR.fillRect(0, 0, s, s);

    for (let i = 0; i < 520; i++) {
      const lx = hash2(i, 7) * s;
      const ly = hash2(i, 19) * s;
      const rx = 3 + hash2(i, 37) * 5;
      const ry = 2 + hash2(i, 53) * 3.5;
      const ang = hash2(i, 73) * Math.PI;
      const n = hash2(i, 91);
      ctxA.save();
      ctxA.translate(lx, ly);
      ctxA.rotate(ang);
      ctxA.fillStyle =
        n > 0.72
          ? 'rgba(104, 146, 98, 0.72)'
          : n > 0.36
            ? 'rgba(54, 102, 78, 0.78)'
            : 'rgba(22, 50, 38, 0.8)';
      ctxA.beginPath();
      ctxA.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctxA.fill();
      ctxA.restore();

      const b = Math.round(95 + n * 125);
      ctxB.fillStyle = `rgb(${b},${b},${b})`;
      ctxB.beginPath();
      ctxB.arc(lx, ly, rx * 0.85, 0, Math.PI * 2);
      ctxB.fill();

      const rv = Math.round(145 + (1 - n) * 85);
      ctxR.fillStyle = `rgb(${rv},${rv},${rv})`;
      ctxR.beginPath();
      ctxR.arc(lx, ly, rx * 0.85, 0, Math.PI * 2);
      ctxR.fill();
    }
  });
  textures.push(mossMaps.map, mossMaps.bumpMap, mossMaps.roughnessMap);

  // 10. Interior Venetian Lime Plaster, Woven Medallion Rug, Damask Cushion, Hearth Embers & Striped Awning
  const plasterMaps = createCanvasPair(256, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#CFB38D';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#DEDEDE';
    ctxR.fillRect(0, 0, s, s);
    for (let i = 0; i < 320; i++) {
      const px = hash2(i, 12) * s;
      const py = hash2(i, 28) * s;
      const rad = 6 + hash2(i, 44) * 18;
      const n = hash2(i, 66);
      ctxA.fillStyle = n > 0.5 ? 'rgba(228, 206, 174, 0.14)' : 'rgba(154, 124, 92, 0.14)';
      ctxA.beginPath();
      ctxA.arc(px, py, rad, 0, Math.PI * 2);
      ctxA.fill();
      const b = Math.round(115 + n * 35);
      ctxB.fillStyle = `rgb(${b},${b},${b})`;
      ctxB.beginPath();
      ctxB.arc(px, py, rad * 0.7, 0, Math.PI * 2);
      ctxB.fill();
    }
  });
  textures.push(plasterMaps.map, plasterMaps.bumpMap, plasterMaps.roughnessMap);

  const rugMaps = createCanvasPair(256, 1, 1, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#883428';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#707070';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#E6E6E6';
    ctxR.fillRect(0, 0, s, s);

    // Ornate Venetian border & central medallion
    ctxA.strokeStyle = '#C89B54';
    ctxA.lineWidth = 10;
    ctxA.strokeRect(18, 18, s - 36, s - 36);
    ctxA.strokeStyle = '#2B5956';
    ctxA.lineWidth = 6;
    ctxA.strokeRect(32, 32, s - 64, s - 64);

    ctxA.fillStyle = '#2A5350';
    ctxA.beginPath();
    ctxA.arc(s * 0.5, s * 0.5, 48, 0, Math.PI * 2);
    ctxA.fill();
    ctxA.strokeStyle = '#D6A962';
    ctxA.lineWidth = 4;
    ctxA.stroke();

    // Woven tapestry warp/weft grain
    for (let y = 0; y < s; y += 3) {
      ctxA.fillStyle = y % 6 === 0 ? 'rgba(255,240,210,0.06)' : 'rgba(20,10,8,0.08)';
      ctxA.fillRect(0, y, s, 1.5);
      ctxB.fillStyle = y % 6 === 0 ? '#A4A4A4' : '#565656';
      ctxB.fillRect(0, y, s, 1.5);
    }
  });
  textures.push(rugMaps.map, rugMaps.bumpMap, rugMaps.roughnessMap);

  const cushionMaps = createCanvasPair(128, 2, 2, maxAniso, (ctxA, ctxB, ctxR, s) => {
    ctxA.fillStyle = '#2E625B';
    ctxA.fillRect(0, 0, s, s);
    ctxB.fillStyle = '#7A7A7A';
    ctxB.fillRect(0, 0, s, s);
    ctxR.fillStyle = '#D0D0D0';
    ctxR.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 4) {
      for (let x = 0; x < s; x += 4) {
        const checker = ((x + y) >> 2) & 1;
        ctxA.fillStyle = checker ? 'rgba(72, 134, 124, 0.28)' : 'rgba(22, 54, 49, 0.25)';
        ctxA.fillRect(x, y, 3, 3);
        ctxB.fillStyle = checker ? '#9E9E9E' : '#585858';
        ctxB.fillRect(x, y, 3, 3);
      }
    }
  });
  textures.push(cushionMaps.map, cushionMaps.bumpMap, cushionMaps.roughnessMap);

  const awningMaps = createCanvasPair(256, 3, 1, maxAniso, (ctxA, ctxB, ctxR, s) => {
    const stripes = 6;
    const sw = s / stripes;
    for (let i = 0; i < stripes; i++) {
      ctxA.fillStyle = i % 2 === 0 ? '#9B4532' : '#DFCFAF';
      ctxA.fillRect(i * sw, 0, sw + 1, s);
      ctxB.fillStyle = i % 2 === 0 ? '#989898' : '#787878';
      ctxB.fillRect(i * sw, 0, sw + 1, s);
    }
    ctxR.fillStyle = '#D4D4D4';
    ctxR.fillRect(0, 0, s, s);
    // Sun-bleached weather & canvas weave
    for (let y = 0; y < s; y += 3) {
      ctxA.fillStyle = 'rgba(32, 24, 18, 0.06)';
      ctxA.fillRect(0, y, s, 1);
    }
    const grime = ctxA.createLinearGradient(0, 0, 0, s);
    grime.addColorStop(0, 'rgba(30, 38, 36, 0.28)');
    grime.addColorStop(0.5, 'rgba(30, 38, 36, 0.0)');
    grime.addColorStop(1, 'rgba(26, 38, 34, 0.24)');
    ctxA.fillStyle = grime;
    ctxA.fillRect(0, 0, s, s);
  });
  textures.push(awningMaps.map, awningMaps.bumpMap, awningMaps.roughnessMap);

  // Glowing cracked hearth ember bed
  const emberCanvas = document.createElement('canvas');
  emberCanvas.width = emberCanvas.height = 128;
  {
    const ctx = emberCanvas.getContext('2d')!;
    ctx.fillStyle = '#2A1810';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 85; i++) {
      const ex = hash2(i, 5) * 128;
      const ey = hash2(i, 19) * 128;
      const rad = 4 + hash2(i, 31) * 10;
      const hot = hash2(i, 47);
      ctx.fillStyle = hot > 0.65 ? '#FFB648' : hot > 0.3 ? '#E65B1C' : '#3C2218';
      ctx.beginPath();
      ctx.arc(ex, ey, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const emberTex = new THREE.CanvasTexture(emberCanvas);
  emberTex.colorSpace = THREE.SRGBColorSpace;
  textures.push(emberTex);

  const contactTex = makeContactShadowTexture();
  const moteTexture = makeSoftMoteTexture();
  const steamTexture = makeSteamWispTexture();
  textures.push(contactTex, moteTexture, steamTexture);

  const slateRoof = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: slateMaps.map,
    bumpMap: slateMaps.bumpMap,
    bumpScale: 0.056,
    roughnessMap: slateMaps.roughnessMap,
    roughness: 0.88,
    metalness: 0.16,
  });

  const masonryWall = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: masonryMaps.map,
    bumpMap: masonryMaps.bumpMap,
    bumpScale: 0.064,
    roughnessMap: masonryMaps.roughnessMap,
    roughness: 0.94,
    metalness: 0.05,
  });

  const verdigrisRoof = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: copperMaps.map,
    bumpMap: copperMaps.bumpMap,
    bumpScale: 0.044,
    roughnessMap: copperMaps.roughnessMap,
    roughness: 0.82,
    metalness: 0.38,
  });

  const brassTrim = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: brassMaps.map,
    bumpMap: brassMaps.bumpMap,
    bumpScale: 0.022,
    roughnessMap: brassMaps.roughnessMap,
    roughness: 0.32,
    metalness: 0.94,
    anisotropy: 0.68,
    clearcoat: 0.24,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.4,
  });

  const darkIron = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: ironMaps.map,
    bumpMap: ironMaps.bumpMap,
    bumpScale: 0.026,
    roughnessMap: ironMaps.roughnessMap,
    roughness: 0.48,
    metalness: 0.84,
    envMapIntensity: 1.15,
  });

  const woodCatwalk = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: woodMaps.map,
    bumpMap: woodMaps.bumpMap,
    bumpScale: 0.044,
    roughnessMap: woodMaps.roughnessMap,
    roughness: 0.84,
    metalness: 0.04,
    anisotropy: 0.62,
    sheen: 0.18,
    sheenRoughness: 0.72,
    sheenColor: new THREE.Color('#B89674'),
  });

  const windowGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: winMapTex,
    emissive: new THREE.Color('#E89A3C'),
    emissiveMap: winEmissiveTex,
    emissiveIntensity: 0.62,
    roughnessMap: winRoughTex,
    roughness: 0.12,
    metalness: 0.14,
    transmission: isSoftwareGl ? 0 : 0.26,
    ior: 1.52,
    thickness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4,
  });

  const lanternGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFBE66'),
    emissive: new THREE.Color('#D97822'),
    emissiveIntensity: 0.95,
    roughness: 0.14,
    metalness: 0.08,
  });

  const echoLedge = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.amberChime),
    emissive: new THREE.Color(PALETTE.amberChime),
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.78,
    roughness: 0.25,
    metalness: 0.45,
  });

  const mossFoliage = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: mossMaps.map,
    bumpMap: mossMaps.bumpMap,
    bumpScale: 0.034,
    roughnessMap: mossMaps.roughnessMap,
    roughness: 0.86,
    metalness: 0.02,
  });

  const terracottaPot = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: terracottaMaps.map,
    bumpMap: terracottaMaps.bumpMap,
    bumpScale: 0.028,
    roughnessMap: terracottaMaps.roughnessMap,
    roughness: 0.84,
    metalness: 0.03,
  });

  // Biome-specific architectural masonry for Act II (Emerald Grotto) & Act III (Golden Sandstone Spire)
  const biomeStoneGrotto = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5A8D84'),
    map: masonryMaps.map,
    bumpMap: masonryMaps.bumpMap,
    bumpScale: 0.068,
    roughnessMap: masonryMaps.roughnessMap,
    roughness: 0.86,
    metalness: 0.08,
  });

  const biomeSandstoneSpire = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D4AA7D'),
    map: masonryMaps.map,
    bumpMap: masonryMaps.bumpMap,
    bumpScale: 0.056,
    roughnessMap: masonryMaps.roughnessMap,
    roughness: 0.88,
    metalness: 0.04,
  });

  const interiorPlaster = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: plasterMaps.map,
    bumpMap: plasterMaps.bumpMap,
    bumpScale: 0.02,
    roughnessMap: plasterMaps.roughnessMap,
    roughness: 0.92,
    metalness: 0.02,
  });

  const interiorRug = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: rugMaps.map,
    bumpMap: rugMaps.bumpMap,
    bumpScale: 0.022,
    roughnessMap: rugMaps.roughnessMap,
    roughness: 0.95,
    metalness: 0.0,
  });

  const interiorCushion = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: cushionMaps.map,
    bumpMap: cushionMaps.bumpMap,
    bumpScale: 0.018,
    roughnessMap: cushionMaps.roughnessMap,
    roughness: 0.88,
    metalness: 0.02,
    sheen: 0.65,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color('#8ED1C6'),
  });

  const hearthGlow = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: emberTex,
    emissive: new THREE.Color('#D94E18'),
    emissiveMap: emberTex,
    emissiveIntensity: 0.95,
    roughness: 0.45,
    metalness: 0.04,
  });

  const awningFabric = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: awningMaps.map,
    bumpMap: awningMaps.bumpMap,
    bumpScale: 0.02,
    roughnessMap: awningMaps.roughnessMap,
    roughness: 0.86,
    metalness: 0.02,
    sheen: 0.42,
    sheenRoughness: 0.68,
    sheenColor: new THREE.Color('#FFE0B8'),
  });

  const causticsUniforms = {
    uTime: { value: 0 },
    uCausticsStrength: { value: 1.0 },
  };

  function applyWaterCausticsAndWetEdge(mat: THREE.MeshStandardMaterial): void {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uCausticTime = causticsUniforms.uTime;
      shader.uniforms.uCausticsStrength = causticsUniforms.uCausticsStrength;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vCausticWorldPos;
          varying vec3 vCausticWorldNormal;`
        )
        .replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
          vCausticWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          vCausticWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uCausticTime;
          uniform float uCausticsStrength;
          varying vec3 vCausticWorldPos;
          varying vec3 vCausticWorldNormal;

          vec2 causticHash22(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.xx + p3.yz) * p3.zy);
          }

          float causticVoronoiEdge(vec2 p, float t) {
            vec2 n = floor(p);
            vec2 f = fract(p);
            float md1 = 8.0;
            float md2 = 8.0;
            for (int j = -1; j <= 1; j++) {
              for (int i = -1; i <= 1; i++) {
                vec2 g = vec2(float(i), float(j));
                vec2 h = causticHash22(n + g);
                vec2 o = 0.5 + 0.38 * vec2(sin(t + 6.2831 * h.x), cos(t * 0.87 + 6.2831 * h.y));
                vec2 r = g + o - f;
                float d = dot(r, r);
                if (d < md1) {
                  md2 = md1;
                  md1 = d;
                } else if (d < md2) {
                  md2 = d;
                }
              }
            }
            float edge = sqrt(md2) - sqrt(md1);
            return exp(-edge * 11.5);
          }`
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float wy = vCausticWorldPos.y;
          float sideMask = 1.0 - smoothstep(0.28, 0.68, abs(normalize(vCausticWorldNormal).y));
          float wetBand = smoothstep(-0.24, -0.02, wy) * (1.0 - smoothstep(0.02, 0.34, wy)) * mix(0.18, 1.0, sideMask);
          diffuseColor.rgb *= mix(1.0, 0.58, wetBand * (0.45 + 0.55 * uCausticsStrength));`
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
          float wyR = vCausticWorldPos.y;
          float sideMaskR = 1.0 - smoothstep(0.28, 0.68, abs(normalize(vCausticWorldNormal).y));
          float wetRoughMask = smoothstep(-0.24, -0.02, wyR) * (1.0 - smoothstep(0.02, 0.32, wyR)) * mix(0.15, 1.0, sideMaskR);
          roughnessFactor = mix(roughnessFactor, 0.22, wetRoughMask * 0.8);`
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          if (uCausticsStrength > 0.05) {
            float wyC = vCausticWorldPos.y;
            float sideMaskC = 1.0 - smoothstep(0.26, 0.64, abs(normalize(vCausticWorldNormal).y));
            float cHeight = smoothstep(-0.06, 0.04, wyC) * (1.0 - smoothstep(0.14, 0.44, wyC));
            float cMask = cHeight * sideMaskC;
            if (cMask > 0.01) {
              vec2 cw = vec2(vCausticWorldPos.x + vCausticWorldPos.z * 0.72, wyC * 1.18 - vCausticWorldPos.x * 0.34) * 1.25;
              float webA = causticVoronoiEdge(cw + vec2(uCausticTime * 0.12, -uCausticTime * 0.09), uCausticTime * 1.2);
              float webB = causticVoronoiEdge(cw * 1.48 + vec2(3.7 - uCausticTime * 0.10, uCausticTime * 0.08), uCausticTime * 1.0);
              float web = clamp(webA * 0.62 + webB * 0.42, 0.0, 1.0);
              totalEmissiveRadiance += vec3(0.11, 0.20, 0.18) * web * cMask * uCausticsStrength * 0.14;
            }
          }`
        );
    };
  }

  applyWaterCausticsAndWetEdge(masonryWall);
  applyWaterCausticsAndWetEdge(woodCatwalk);
  applyWaterCausticsAndWetEdge(terracottaPot);
  applyWaterCausticsAndWetEdge(biomeStoneGrotto);

  // Realistic Venetian Canal Water: pure world-space 2D Simplex ripples, coastal shallow depth, Schlick Fresnel, sky reflection & rain splashes
  const waterUniforms = {
    uTime: { value: 0 },
    uWaterQuality: { value: 2 },
    uEnableGlints: { value: 1 },
    uRainIntensity: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.62, 0.28, 0.65).normalize() },
    uSkyReflectTint: { value: new THREE.Color('#1B4249') },
  };
  const waterSurface = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0C282D'),
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0,
    envMapIntensity: 1.15,
  });

  waterSurface.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.uniforms.uWaterQuality = waterUniforms.uWaterQuality;
    shader.uniforms.uEnableGlints = waterUniforms.uEnableGlints;
    shader.uniforms.uRainIntensity = waterUniforms.uRainIntensity;
    shader.uniforms.uSunDir = waterUniforms.uSunDir;
    shader.uniforms.uSkyReflectTint = waterUniforms.uSkyReflectTint;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWaterQuality;
        varying vec3 vWaterWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        if (uWaterQuality >= 1.5) {
          float swell = sin(position.x * 0.52 + uTime * 1.1) * 0.022 + cos(position.y * 0.68 - uTime * 0.9) * 0.018;
          transformed.z += swell;
        }`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vWaterWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWaterQuality;
        uniform float uEnableGlints;
        uniform float uRainIntensity;
        uniform vec3 uSunDir;
        uniform vec3 uSkyReflectTint;
        varying vec3 vWaterWorldPos;

        float canalHash21(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        float rainRingSample(vec2 uv, float t, float speedScale) {
          vec2 cell = floor(uv);
          vec2 f = fract(uv);
          float seed = canalHash21(cell + vec2(17.3, 41.9));
          float seed2 = canalHash21(cell + vec2(59.1, 83.7));
          float activeCell = step(0.45, canalHash21(cell + vec2(7.1, 91.7)));
          vec2 center = vec2(0.24 + seed * 0.52, 0.24 + seed2 * 0.52);
          float age = fract(t * speedScale + seed * 4.37);
          float dist = length(f - center);
          float radius = age * 0.24;
          float band = exp(-pow((dist - radius) * 58.0, 2.0));
          float env = smoothstep(0.0, 0.10, age) * pow(1.0 - age, 1.8);
          return band * env * activeCell;
        }

        float rainRipplePattern(vec2 wp, float t) {
          float rA = rainRingSample(mat2(0.86, -0.51, 0.51, 0.86) * (wp * 2.1), t, 1.55);
          float rB = rainRingSample(mat2(-0.44, 0.90, -0.90, -0.44) * (wp * 3.2) + vec2(4.7, 9.2), t, 1.95);
          return clamp(rA + rB * 0.8, 0.0, 1.0);
        }

        float canalBoxDist(vec2 p, vec2 bMin, vec2 bMax) {
          vec2 c = (bMin + bMax) * 0.5;
          vec2 h = (bMax - bMin) * 0.5;
          vec2 d = abs(p - c) - h;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        }

        vec2 canalHash22(vec2 p) {
          vec2 q = p + vec2(37.13, 91.79);
          vec3 p3 = fract(vec3(q.xyx) * vec3(0.1031, 0.1030, 0.0973));
          p3 += dot(p3, p3.yzx + 33.33);
          vec2 g = fract((p3.xx + p3.yz) * p3.zy) - 0.5;
          return normalize(g + vec2(1e-4, -1e-4));
        }

        // C2-continuous 2D Simplex Noise on an equilateral triangular lattice with exact analytical gradient (zero square grid artifacts)
        vec3 canalSimplexGrad(vec2 p) {
          const float K1 = 0.366025403784439;
          const float K2 = 0.211324865405187;
          vec2 i = floor(p + (p.x + p.y) * K1);
          vec2 a = p - i + (i.x + i.y) * K2;
          float m = step(a.y, a.x);
          vec2 o = vec2(m, 1.0 - m);
          vec2 b = a - o + K2;
          vec2 c = a - 1.0 + 2.0 * K2;

          vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
          vec3 h2 = h * h;
          vec3 h3 = h2 * h;
          vec3 h4 = h2 * h2;

          vec2 g0 = canalHash22(i);
          vec2 g1 = canalHash22(i + o);
          vec2 g2 = canalHash22(i + 1.0);

          float p0 = dot(g0, a);
          float p1 = dot(g1, b);
          float p2 = dot(g2, c);

          const float scale = 38.0;
          float val = dot(h4, vec3(p0, p1, p2)) * scale;
          vec2 grad = (h4.x * g0 + h4.y * g1 + h4.z * g2 - 8.0 * (h3.x * p0 * a + h3.y * p1 * b + h3.z * p2 * c)) * scale;
          return vec3(val * 0.5 + 0.5, grad * 0.5);
        }

        vec3 canalWaveNormal(vec2 wp, float t, float detailFactor) {
          float distFade = 1.0 - smoothstep(14.0, 58.0, length(wp - cameraPosition.xz));

          // Multi-scale domain-warped 2D Simplex gradient FBM ripples
          vec3 n0 = canalSimplexGrad(wp * 0.34 + vec2(t * 0.13, -t * 0.07));
          vec2 warp = n0.yz * 0.28 + vec2(n0.x * 0.45, -n0.x * 0.31);

          mat2 rotA = mat2(0.84, -0.54, 0.54, 0.84);
          mat2 rotB = mat2(-0.42, -0.91, 0.91, -0.42);
          mat2 rotC = mat2(0.28, 0.96, -0.96, 0.28);

          vec3 n1 = canalSimplexGrad(rotA * (wp * 0.78 + warp) + vec2(-t * 0.20, t * 0.15));
          vec2 gradN1 = n1.yz * rotA;

          vec2 slope = n0.yz * 0.068 + gradN1 * 0.088;

          if (detailFactor > 0.5) {
            vec3 n2 = canalSimplexGrad(rotB * (wp * 1.56 - warp * 0.55) + vec2(t * 0.28, t * 0.22));
            vec3 n3 = canalSimplexGrad(rotC * (wp * 2.95 + n1.yz * 0.24) + vec2(-t * 0.36, -t * 0.26));
            vec2 gradN2 = n2.yz * rotB;
            vec2 gradN3 = n3.yz * rotC;
            slope += (gradN2 * 0.072 + gradN3 * 0.038) * distFade;
          }

          // Subtle long-wavelength non-orthogonal swells
          float swellA = wp.x * 0.41 + wp.y * 0.19 + n0.x * 1.45 + t * 0.88;
          float swellB = -wp.x * 0.57 + wp.y * 0.37 + n1.x * 1.25 - t * 0.72;
          slope += vec2(cos(swellA) * 0.024 - cos(swellB) * 0.020, cos(swellA) * 0.011 + cos(swellB) * 0.013);

          return normalize(vec3(-slope.x, 1.0, -slope.y));
        }`
      )
      .replace(
        '#include <opaque_fragment>',
        `
        if (uWaterQuality < 0.5) {
          // Low (Eco): bright legible Venetian canal teal surface, zero heavy shader waves/glints
          outgoingLight = vec3(0.068, 0.165, 0.178);
        } else if (uWaterQuality < 1.5 || uEnableGlints < 0.5) {
          // Medium: smooth organic canal jade with gentle Simplex FBM flow + optional raindrop splash rings
          vec2 wp = vWaterWorldPos.xz;
          float flowM = canalSimplexGrad(wp * 0.28 + vec2(uTime * 0.08, -uTime * 0.05)).x;
          vec3 baseCol = mix(vec3(0.034, 0.098, 0.110), mix(vec3(0.088, 0.162, 0.152), uSkyReflectTint * 0.45, 0.35), flowM * 0.75);
          if (uRainIntensity > 0.02) {
            float rSplash = rainRipplePattern(wp, uTime) * uRainIntensity;
            baseCol += vec3(0.32, 0.46, 0.48) * rSplash * 0.55;
          }
          float waterShadow = clamp(0.68 + dot(reflectedLight.directDiffuse, vec3(1.0)) * 7.5, 0.68, 1.0);
          baseCol *= waterShadow;
          outgoingLight = baseCol;
        } else {
          vec3 wN = canalWaveNormal(vWaterWorldPos.xz, uTime, 1.0);
          float rainSparkle = 0.0;
          if (uRainIntensity > 0.02) {
            rainSparkle = rainRipplePattern(vWaterWorldPos.xz, uTime) * uRainIntensity;
            wN = normalize(wN + vec3((rainSparkle - 0.15) * 0.22, 0.0, (rainSparkle - 0.15) * 0.18));
          }
          vec3 viewDirW = normalize(cameraPosition - vWaterWorldPos);
          vec3 reflDir = reflect(-viewDirW, wN);
          float ndotv = clamp(dot(wN, viewDirW), 0.0, 1.0);
          float fresnel = 0.025 + 0.92 * pow(1.0 - ndotv, 4.8);

          // Shoreline proximity to buildings, stone quays, market piers, dam wall & skiffs
          vec2 wp = vWaterWorldPos.xz;
          float dStart = canalBoxDist(wp, vec2(-3.35, -3.35), vec2(3.35, 3.35));
          float dBelfry = canalBoxDist(wp, vec2(-3.55, -13.75), vec2(3.55, -7.25));
          float dPerch = canalBoxDist(wp, vec2(-2.35, -18.35), vec2(2.35, -14.65));
          float dQuayL = canalBoxDist(wp, vec2(-10.3, -48.1), vec2(-6.9, 24.1));
          float dQuayR = canalBoxDist(wp, vec2(6.9, -48.1), vec2(10.3, 24.1));
          float dPierE = canalBoxDist(wp, vec2(10.2, 5.6), vec2(22.8, 17.6));
          float dPierW = canalBoxDist(wp, vec2(-22.8, 5.6), vec2(-10.2, 17.6));
          float dQuays = min(min(dQuayL, dQuayR), min(dPierE, dPierW));
          float dDam = max(0.0, wp.y + 24.4);
          float dSkiffA = canalBoxDist(wp, vec2(4.9, -5.4), vec2(5.9, -2.2));
          float dSkiffB = canalBoxDist(wp, vec2(-6.1, -13.0), vec2(-5.1, -9.8));
          float shoreDist = min(min(min(dStart, dBelfry), min(dPerch, dDam)), min(dQuays, min(dSkiffA, dSkiffB)));

          // Deep Venetian canal teal -> coastal shallow translucent jade near masonry quays & piers
          float currentEddy = canalSimplexGrad(wp * 0.22 + vec2(uTime * 0.07, -uTime * 0.04)).x;
          float eddyDetail = canalSimplexGrad(wp * 0.54 + vec2(-uTime * 0.11, uTime * 0.08)).x;
          float depthTint = clamp(currentEddy * 0.65 + eddyDetail * 0.35, 0.0, 1.0);
          float shallowMask = 1.0 - smoothstep(0.15, 2.35, shoreDist);
          vec3 abyssCol = mix(vec3(0.006, 0.025, 0.032), vec3(0.015, 0.052, 0.058), depthTint);
          vec3 shallowCol = mix(vec3(0.022, 0.078, 0.082), vec3(0.036, 0.105, 0.098), depthTint);
          vec3 deepWater = mix(abyssCol, shallowCol, shallowMask * 0.78);

          // Physical sky-gradient + crisp controlled solar sparkle off wave facets
          vec3 sunDir = normalize(uSunDir);
          float sunRefl = max(0.0, dot(reflDir, sunDir));
          float skyPitch = smoothstep(-0.04, 0.62, reflDir.y);
          vec3 skyBaseRefl = mix(uSkyReflectTint * 0.38, vec3(0.016, 0.042, 0.056), skyPitch * 0.68);
          vec3 skyRefl = mix(skyBaseRefl, vec3(0.11, 0.075, 0.048), pow(sunRefl, 3.2) * 0.68);
          skyRefl += vec3(0.46, 0.29, 0.14) * pow(sunRefl, 150.0) * 0.72;
          skyRefl += vec3(0.14, 0.09, 0.05) * pow(sunRefl, 22.0) * 0.22;

          // Subtle warm reflections of flooded windows & lanterns distorted organically by wave slopes
          float ripShift = wN.x * 3.2 + wN.z * 1.8;
          float winBandL = exp(-pow((wp.x + 6.4 + ripShift * 0.5) * 0.72, 2.0));
          float winBandR = exp(-pow((wp.x - 6.4 + ripShift * 0.5) * 0.72, 2.0));
          float winGrid = 0.5 + 0.5 * sin((wp.y + ripShift * 0.7) * 1.75);
          float winShimmer = (winBandL + winBandR) * smoothstep(0.45, 0.96, winGrid) * (0.25 + 0.75 * fresnel);

          float skiffGlowA = exp(-length(wp - vec2(5.4 + ripShift * 0.35, -1.6)) * 0.75);
          float skiffGlowB = exp(-length(wp - vec2(-5.6 + ripShift * 0.35, -9.2)) * 0.75);
          vec3 lanternShimmer = vec3(0.46, 0.25, 0.09) * (winShimmer * 0.20 + (skiffGlowA + skiffGlowB) * 0.22);

          // Wet stone darkening right at the wall base + delicate broken meniscus ripple
          float contactAO = smoothstep(0.0, 0.65, shoreDist);
          vec3 waterCol = mix(deepWater * (0.46 + 0.54 * contactAO), skyRefl * (0.56 + 0.44 * contactAO), fresnel);
          waterCol += lanternShimmer;

          // Raindrop delicate glinting splash rings
          waterCol += vec3(0.28, 0.44, 0.48) * rainSparkle * 0.24;

          float foamNoise = clamp(eddyDetail * 0.7 + canalSimplexGrad(wp * 2.4 + vec2(uTime * 0.22, -uTime * 0.16)).x * 0.5, 0.0, 1.0);
          float shoreBand = 1.0 - smoothstep(0.01, 0.24, shoreDist);
          float lapWave = smoothstep(0.45, 0.92, sin(shoreDist * 28.0 - uTime * 2.4 + foamNoise * 3.0) * 0.5 + 0.5);
          float edgeThin = 1.0 - smoothstep(0.0, 0.06, shoreDist);
          float foamMask = clamp((shoreBand * lapWave * 0.22 + edgeThin * 0.15) * (0.55 + 0.45 * foamNoise), 0.0, 0.25);
          waterCol = mix(waterCol, vec3(0.15, 0.24, 0.25), foamMask);

          float waterShadow = clamp(0.64 + dot(reflectedLight.directDiffuse, vec3(1.0)) * 7.5, 0.64, 1.0);
          waterCol *= waterShadow;
          outgoingLight = waterCol;
        }
        #include <opaque_fragment>
        `
      );
  };

  // Soft volumetric light-cone halo material
  const beamMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#FFD18F') },
      uOpacity: { value: 0.09 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNorm;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNorm = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNorm;
      varying vec3 vViewDir;
      void main() {
        float edgeFade = pow(abs(dot(normalize(vNorm), normalize(vViewDir))), 1.8);
        float vertFade = smoothstep(0.0, 0.35, vUv.y) * pow(vUv.y, 1.2);
        float alpha = edgeFade * vertFade * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });

  const allMaterials: THREE.Material[] = [
    slateRoof,
    masonryWall,
    verdigrisRoof,
    brassTrim,
    darkIron,
    woodCatwalk,
    windowGlass,
    lanternGlow,
    echoLedge,
    mossFoliage,
    terracottaPot,
    biomeStoneGrotto,
    biomeSandstoneSpire,
    interiorPlaster,
    interiorRug,
    interiorCushion,
    hearthGlow,
    awningFabric,
    waterSurface,
    beamMaterial,
    contactShadow,
  ];

  return {
    slateRoof,
    masonryWall,
    verdigrisRoof,
    brassTrim,
    darkIron,
    woodCatwalk,
    windowGlass,
    lanternGlow,
    echoLedge,
    mossFoliage,
    terracottaPot,
    biomeStoneGrotto,
    biomeSandstoneSpire,
    interiorPlaster,
    interiorRug,
    interiorCushion,
    hearthGlow,
    awningFabric,
    waterSurface,
    waterUniforms,
    causticsUniforms,
    beamMaterial,
    contactShadow,
    moteTexture,
    steamTexture,
    dispose: () => {
      for (const m of allMaterials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
