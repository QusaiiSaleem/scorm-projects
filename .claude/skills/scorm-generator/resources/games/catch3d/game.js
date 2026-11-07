/*
 * games/catch3d/game.js -- the catch game in 3D (2026-11-07, learning-games
 * spec §5, game 7, D12 and D15; Scitter plan Task 25).
 *
 * THIS IS dsh-game-studio's `voxel` TEMPLATE ("Lantern Isle"), USED WHOLE AND
 * THEN EDITED FOR LEARNING (template/voxel/game.js and its artwork), MIT,
 * Copyright (c) 2026 ZSeven—W. The licence text is in this folder's README.md.
 * three.js (MIT) is ../three/three.module.min.js, the one copy every 3D game
 * imports. Qusai, 2026-11-07: «dont simplifiy use it then edit it to get the
 * best value».
 *
 * KEPT FROM VOXEL, as it was: its sections (rules, renderer, helpers, island,
 * characters, audio, input, update, camera, loop); the seeded island of
 * stacked blocks inside a noisy circle, its sand, trees, rocks, water, sea
 * floor, warm low sun and its shadows, stars, moon and fireflies; the
 * block-built characters merged into one mesh each (hero, chaser, lantern)
 * and its palette; the follow camera at its fixed angle; movement with WASD
 * or the arrows and the press-and-drag joystick, sliding along what blocks
 * it; chasers that come in from the shore, keep apart and speed up; hearts,
 * the blink of invulnerability, the shield bubble every few right acts that
 * sends the chasers away; the burst of sparks; a slot filled with a picture
 * of the lecture's own becomes a camera-facing sprite (a character) or the
 * ground's texture.
 *
 * EDITED FOR LEARNING -- the same layer as games/catch, on voxel's loop:
 * - voxel's lanterns are the content's WORD CARDS. Each card stands over a
 *   lantern on the island; every lantern looks the same, only the words say
 *   whether it is safe. A card stays a while, then its lantern goes out:
 *   walked over is `caught`, gone out untouched is `passed` -- one definite
 *   outcome, so one report per card, first outcome only, and a platform play
 *   through record() that never touches the physics or the GPU.
 * - chasers carry no words. A hit costs a heart and reports nothing.
 * - cards are buttons in the page over the canvas, projected from the 3D
 *   world every frame: Arabic shaped by the browser, a lecture's deck.css on
 *   them, the contrast check able to measure them. A tap, or Tab and Enter,
 *   on a card walks the character there by a path round the trees and rocks
 *   -- the way to play without dragging (WCAG 2.5.7). A tap on the island
 *   walks there too.
 * - the screens, the score bar, the debrief, sound off until asked, colours
 *   of everything the learner reads from base.css variables (and the sparks
 *   and the shield from them too); a seeded generator for everything voxel
 *   left to Math.random, so the same content plays the same island the same
 *   way.
 * - the game clock is the wall's: steps of at most 1/30 s, as many as a slow
 *   frame needs, so a phone (or software GL) plays slower frames and not a
 *   slower game, and a card's seconds are seconds.
 *
 * WHAT VOXEL DID THAT A LECTURE MUST NOT, and is gone: posting to its studio
 * (`post`, `window.__gameState`, `__renderSlots` and its second WebGL
 * renderer), its best score in localStorage, sound on by default, "any key
 * starts", and its HUD of white text on dark glass as inline styles.
 *
 * THE ISLAND IS BUILT WHEN A ROUND STARTS (or `moment('after-wrong')` asks
 * for it), never at load. The start screen, the debrief, the feedback sheet
 * and the platform's play are the page's own elements, so a slide that is
 * only looked at -- a render, the release's plain pass, a deck loading it
 * two slides ahead -- draws no WebGL. three.js is fetched while the learner
 * reads the start screen.
 *
 * NO WEBGL (spec §5, plan Review Focus 5): voxel's "fail readably" screen,
 * which here still lets the learner finish -- the same cards on a flat board,
 * a tap catches, a card left fades, the same hearts, clock and reports.
 *
 * Reports one `performance` row per card (response caught | passed, result
 * correct when it fits the kind, latency from the card's appearance), and
 * `none`/`wrong` for every card never met, sent when the debrief opens. A
 * replay is practice and reports nothing.
 */
import {
  announce, debrief, el, finish, GameContentError, latencyFrom, onRestore, readContent, registerTest, save, setting,
} from '../core/game-core.js';

/** content.schema.json without its descriptions: what readContent enforces.
 *  catch's, field for field, so a lecture changes look and not words. */
export const SHAPE = {
  'x-points': 'items[]',
  type: 'object',
  required: ['title', 'items'],
  properties: {
    title: { type: 'string', minLength: 1 },
    items: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        required: ['id', 'label', 'kind', 'rule', 'source'],
        properties: {
          id: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' },
          label: { type: 'string', minLength: 1 },
          kind: { type: 'string', enum: ['safe', 'hazard'] },
          rule: { type: 'string', minLength: 1 },
          source: { type: 'string' },
        },
      },
    },
    slots: {
      type: 'object',
      properties: {
        hero: { type: 'string' },
        enemy: { type: 'string' },
        item: { type: 'string' },
        background: { type: 'string' },
      },
    },
  },
};

/* 1. RULES -- voxel's DEFAULTS, every gameplay value in one place (distances
 *    in world units: one ground block is 1), and the learning layer's beside
 *    them. A learner's slide has no settings; render_slide may pass
 *    `duration`, `lives` and `enemies` (game.json declares their ranges). */
const DEFAULTS = {
  hearts: 3,
  heroSpeed: 6.5,
  enemySpeed: 2.6,
  enemySpeedGrowth: 0.05,
  enemySpawnEvery: 5,
  maxEnemies: 6,
  heroSize: 1.9,
  enemySize: 1.7,
  pickupSize: 1.3,
  shield: { enabled: true, every: 3, seconds: 4 },
  worldSize: 34,
  seed: 7,
  // Voxel's palette: the island's own colours, its picture -- as collector's
  // SVGs are catch's. What the learner READS takes base.css variables.
  palette: {
    skyTop: '#1d2550', skyBottom: '#e58a6a', fog: '#6f5a7e', grass: '#6bab5c',
    dirt: '#8b6446', sand: '#e6cf96', water: '#3f7fb3', accent: '#ffc463',
  },
  // The learning layer.
  cardLife: 6, // seconds a card stays before its lantern goes out, passed
  cardEvery: 2.4, // seconds between two cards
  maxCards: 3, // cards on the island at once
};
const MOST_ENEMIES = 8; // game.json's `enemies` maximum
const HUD_ROOM = 84; // stage px the score bar covers at the top
const MIN_LIFE = 1.5;
const END_PAUSE_MS = 650;
const STEP = 1 / 30; // the longest step of the game clock
const RIGHT_ACT = { safe: 'caught', hazard: 'passed' };
const WRONG_ACT = { safe: 'passed', hazard: 'caught' };
const ACT_WORDS = { caught: 'أمسكتها', passed: 'تركتها' };
const KIND_WORDS = { safe: 'آمنة: تُمسَك', hazard: 'خطِرة: تُترَك' };
const PICTURES = ['hero', 'enemy', 'item', 'background'];
/* Voxel's keys, by `code`, so a keyboard set to Arabic moves the same. */
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};
/** A slot fill is a picture in the lecture's own assets, never an address. */
const SLOT_PATH = /^\.\.\/assets\/[A-Za-z0-9_.\-/]+\.(png|webp|jpe?g|gif|svg)$/;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
const lerp = (a, b, t) => a + (b - a) * t;

function int(name, low, high) {
  const value = setting(name);
  return value === null ? null : clamp(value, low, high);
}

/** Voxel's generator, mulberry32, for its island. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The same generator keyed by text (the round's card ids): what voxel drew
 *  from Math.random, the same on every play of the same content. */
function seeded(text) {
  let h = 2166136261;
  for (const ch of text) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return mulberry32(h >>> 0);
}

/** Whether this GL draws in software (SwiftShader, llvmpipe): then one pixel
 *  per CSS pixel and no shadow map, the CLAUDE.md rule for software GL. */
function softwareGl(gl) {
  let name = String(gl.getParameter(gl.RENDERER) || '');
  if (/webkit webgl/i.test(name)) {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) { name = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || name); }
  }
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

/*
 * 2-5, 11. THE WORLD: voxel's renderer, island, characters and camera, in one
 * closure built once per page. Answers null when the device gives no WebGL 2
 * context (three dropped WebGL 1 in r163), before three is asked for one, so
 * a device without it gets the flat board and no error in its console.
 */
function makeIsland(THREE, canvas, R, art, C) {
  /* 2. RENDERER -- a context we ask for ourselves first. */
  const attrs = { antialias: true, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance' };
  let gl = null;
  try { gl = canvas.getContext('webgl2', attrs); } catch (error) { gl = null; }
  if (!gl) { return null; }
  const soft = softwareGl(gl);
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true });
  renderer.setPixelRatio(Math.min(soft ? 1 : 1.5, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = !soft;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(R.palette.fog, 30, 90);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);

  /* 3. HELPERS */
  const rand = mulberry32(Math.round(R.seed) * 2654435761);
  const hashSeed = Math.round(R.seed) * 374761393;
  function hash2(x, z) {
    let h = (x * 374761393 + z * 668265263 + hashSeed) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  function valueNoise(x, z) {
    const xi = Math.floor(x);
    const zi = Math.floor(z);
    const xf = smooth(x - xi);
    const zf = smooth(z - zi);
    return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), xf), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), xf), zf);
  }
  const fbm = (x, z) => valueNoise(x, z) * 0.62 + valueNoise(x * 2.1 + 17, z * 2.1 + 5) * 0.28
    + valueNoise(x * 4.3 + 3, z * 4.3 + 11) * 0.1;
  const color = (hex) => new THREE.Color(hex);

  /** A small gradient texture drawn on a 2D canvas (glows, shadows, the moon, the sky). */
  function gradientTexture(stops, size, linear) {
    const c = document.createElement('canvas');
    c.width = linear ? 2 : (size || 128);
    c.height = size || 128;
    const g = c.getContext('2d');
    const grad = linear
      ? g.createLinearGradient(0, 0, 0, c.height)
      : g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
    for (const [at, tone] of stops) { grad.addColorStop(at, tone); }
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  const GLOW = gradientTexture([[0, 'rgba(255,230,160,1)'], [0.25, 'rgba(255,196,99,0.55)'], [1, 'rgba(255,170,60,0)']]);
  const BLOB = gradientTexture([[0, 'rgba(0,0,0,0.5)'], [0.6, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']], 64);
  // Voxel's sky was a CSS gradient behind a transparent canvas; here it is
  // drawn by the picture itself, so the page holds no colour of its own.
  scene.background = gradientTexture([[0, R.palette.skyTop], [0.18, R.palette.skyTop], [1, R.palette.skyBottom]], 256, true);

  /** Merge boxes into one mesh with vertex colours, so a whole character is
   *  one draw call. Each box is [x, y, z, w, h, d, colour, glow]; glowing
   *  boxes go into a second, unlit mesh. */
  function voxelModel(boxes) {
    const parts = [[], []];
    for (const box of boxes) { parts[box[7] ? 1 : 0].push(box); }
    const group = new THREE.Group();
    for (let p = 0; p < 2; p += 1) {
      if (!parts[p].length) { continue; }
      const positions = [];
      const normals = [];
      const colors = [];
      const indices = [];
      for (const box of parts[p]) {
        const geo = new THREE.BoxGeometry(box[3], box[4], box[5]);
        geo.translate(box[0], box[1], box[2]);
        const pos = geo.attributes.position;
        const nor = geo.attributes.normal;
        const base = positions.length / 3;
        const tint = color(box[6]);
        for (let v = 0; v < pos.count; v += 1) {
          positions.push(pos.getX(v), pos.getY(v), pos.getZ(v));
          normals.push(nor.getX(v), nor.getY(v), nor.getZ(v));
          colors.push(tint.r, tint.g, tint.b);
        }
        for (const index of geo.index.array) { indices.push(base + index); }
        geo.dispose();
      }
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      merged.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      merged.setIndex(indices);
      merged.computeBoundingSphere();
      const material = p === 0
        ? new THREE.MeshLambertMaterial({ vertexColors: true })
        : new THREE.MeshBasicMaterial({ vertexColors: true });
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = p === 0;
      group.add(mesh);
    }
    return group;
  }

  /* 4. ISLAND -- a heightmap of stacked blocks inside a noisy circle. */
  const N = clamp(Math.round(R.worldSize), 16, 64);
  const HALF = N / 2;
  const WATER_Y = 0.55;
  const height = new Int8Array(N * N); // 0 = water, otherwise blocks stacked from y = 0
  const sandy = new Uint8Array(N * N);
  const solid = new Uint8Array(N * N); // trees and rocks block movement
  for (let gx = 0; gx < N; gx += 1) {
    for (let gz = 0; gz < N; gz += 1) {
      const wx = gx - HALF + 0.5;
      const wz = gz - HALF + 0.5;
      const d = Math.sqrt(wx * wx + wz * wz) / HALF;
      const n = fbm(gx * 0.11, gz * 0.11);
      const land = 1 - d + (n - 0.5) * 0.42;
      const i0 = gx * N + gz;
      if (land < 0.07 && d > 0.25) { continue; }
      const h = 1 + Math.floor(clamp(land, 0, 1) * 3.2 + n * 1.4);
      height[i0] = clamp(h, 1, 5);
      if (land < 0.17 && d > 0.3) { height[i0] = 1; sandy[i0] = 1; }
    }
  }
  function cell(x, z) {
    const cx = Math.floor(x + HALF);
    const cz = Math.floor(z + HALF);
    return cx < 0 || cz < 0 || cx >= N || cz >= N ? -1 : cx * N + cz;
  }
  function groundAt(x, z) { const c = cell(x, z); return c < 0 ? 0 : height[c]; }
  function walkable(x, z) { const c = cell(x, z); return c >= 0 && height[c] > 0 && !solid[c]; }
  function cellCenter(index) { return { x: Math.floor(index / N) - HALF + 0.5, z: (index % N) - HALF + 0.5 }; }
  function isShore(index) {
    const cx = Math.floor(index / N);
    const cz = index % N;
    if (!height[index]) { return false; }
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dz = -1; dz <= 1; dz += 1) {
        const x = cx + dx;
        const z = cz + dz;
        if (x < 0 || z < 0 || x >= N || z >= N || !height[x * N + z]) { return true; }
      }
    }
    return false;
  }

  // Decoration: trees and rocks, never in the middle where the hero starts.
  const trees = [];
  const rocks = [];
  for (let t = 0; t < N * N; t += 1) {
    if (!height[t] || sandy[t] || isShore(t)) { continue; }
    const at = cellCenter(t);
    if (Math.abs(at.x) < 3 && Math.abs(at.z) < 3) { continue; }
    const r = rand();
    if (r < 0.032) { trees.push(t); solid[t] = 1; } else if (r < 0.05) { rocks.push(t); solid[t] = 1; }
  }
  const open = (index) => index >= 0 && height[index] > 0 && !solid[index];

  // EVERY CELL A CARD OR A CHASER MAY STAND ON IS ONE THE HERO CAN REACH
  // (the learning layer's): a breadth-first walk from where the hero starts,
  // so a tapped card is never behind water or a ring of trees.
  const reach = new Uint8Array(N * N);
  {
    const start = cell(0, 0);
    const queue = [start];
    reach[start] = 1;
    while (queue.length) {
      const at = queue.shift();
      const cx = Math.floor(at / N);
      const cz = at % N;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = cx + dx;
        const z = cz + dz;
        const next = x * N + z;
        if (x >= 0 && z >= 0 && x < N && z < N && !reach[next] && open(next)) { reach[next] = 1; queue.push(next); }
      }
    }
  }

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const dummy = new THREE.Object3D();
  function blockMesh(count, material) {
    const mesh = new THREE.InstancedMesh(BOX, material, Math.max(1, count));
    mesh.count = 0;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  function addBlock(mesh, x, y, z, sx, sy, sz, tint) {
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(mesh.count, dummy.matrix);
    mesh.setColorAt(mesh.count, tint);
    mesh.count += 1;
  }

  let columns = 0;
  let stacked = 0;
  for (let q = 0; q < N * N; q += 1) { if (height[q]) { columns += 1; stacked += height[q]; } }
  let groundTexture = null;
  if (art.background) {
    groundTexture = new THREE.Texture(art.background);
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    groundTexture.needsUpdate = true;
  }
  const tops = blockMesh(columns, new THREE.MeshLambertMaterial(groundTexture ? { map: groundTexture } : {}));
  const sides = blockMesh(stacked, new THREE.MeshLambertMaterial());
  const tint = new THREE.Color();
  for (let s = 0; s < N * N; s += 1) {
    if (!height[s]) { continue; }
    const c0 = cellCenter(s);
    const top = height[s];
    const jitter = 0.9 + hash2(s, 99) * 0.14;
    if (groundTexture) { tint.setRGB(jitter, jitter, jitter); } else {
      tint.set(sandy[s] ? R.palette.sand : R.palette.grass).multiplyScalar(jitter);
    }
    addBlock(tops, c0.x, top - 0.5, c0.z, 1, 1, 1, tint);
    for (let y = 0; y < top - 1; y += 1) {
      tint.set(sandy[s] ? R.palette.sand : R.palette.dirt).multiplyScalar((0.75 + y * 0.06) * (0.92 + hash2(s, y) * 0.1));
      addBlock(sides, c0.x, y + 0.5, c0.z, 1, 1, 1, tint);
    }
  }
  tops.instanceMatrix.needsUpdate = true;
  sides.instanceMatrix.needsUpdate = true;
  tops.computeBoundingSphere();

  const trunks = blockMesh(trees.length * 2, new THREE.MeshLambertMaterial());
  const leaves = blockMesh(trees.length * 13, new THREE.MeshLambertMaterial());
  const stones = blockMesh(rocks.length * 2, new THREE.MeshLambertMaterial());
  const LEAF_TONES = ['#3f7d4a', '#4b8f50', '#356b45', '#5a9a52'];
  trees.forEach((index, k) => {
    const p = cellCenter(index);
    const base = height[index];
    addBlock(trunks, p.x, base + 0.6, p.z, 0.42, 1.2, 0.42, tint.set('#6b4a32'));
    const tall = 1.3 + (k % 2) * 0.5;
    for (let lx = -1; lx <= 1; lx += 1) {
      for (let lz = -1; lz <= 1; lz += 1) {
        if (lx && lz && hash2(index, lx * 3 + lz) < 0.5) { continue; }
        addBlock(leaves, p.x + lx * 0.62, base + tall + 0.45, p.z + lz * 0.62, 0.66, 0.66, 0.66,
          tint.set(LEAF_TONES[(k + lx + lz + 4) % 4]));
      }
    }
    addBlock(leaves, p.x, base + tall + 1.05, p.z, 0.7, 0.62, 0.7, tint.set(LEAF_TONES[k % 4]));
  });
  rocks.forEach((index, k) => {
    const p = cellCenter(index);
    const base = height[index];
    addBlock(stones, p.x, base + 0.3, p.z, 0.8, 0.6, 0.7, tint.set('#8a8f98'));
    if (k % 2) { addBlock(stones, p.x + 0.15, base + 0.75, p.z - 0.1, 0.45, 0.35, 0.45, tint.set('#a3a8b0')); }
  });
  [trunks, leaves, stones].forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });

  // Water and a darker sea floor beneath it.
  const water = new THREE.Mesh(new THREE.CircleGeometry(N * 2.2, 48),
    new THREE.MeshLambertMaterial({ color: R.palette.water, transparent: true, opacity: 0.86 }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = WATER_Y;
  water.receiveShadow = true;
  scene.add(water);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(N * 2.2, 32),
    new THREE.MeshBasicMaterial({ color: color(R.palette.water).multiplyScalar(0.35) }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.6;
  scene.add(floor);

  // Lights: a cool sky, a warm low sun, and a hint of fill.
  scene.add(new THREE.HemisphereLight('#8a8cff', '#4a3428', 0.95));
  const sun = new THREE.DirectionalLight('#ffb27a', 2.5);
  sun.castShadow = !soft;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0008;
  scene.add(sun, sun.target);

  // Sky dressing: stars high up and a low moon, both far away.
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let st = 0; st < 260; st += 1) {
    const theta = rand() * TAU;
    const phi = 0.12 + rand() * 0.55;
    starPos.push(Math.cos(theta) * Math.cos(phi) * 180, Math.sin(phi) * 180, Math.sin(theta) * Math.cos(phi) * 180);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: '#fff4dc', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85,
  }));
  scene.add(stars);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({
    map: gradientTexture([[0, '#fffbe8'], [0.42, '#fff1c2'], [0.5, 'rgba(255,230,170,0.35)'], [1, 'rgba(255,220,150,0)']]),
    fog: false, depthWrite: false,
  }));
  moon.scale.set(26, 26, 1);
  scene.add(moon);

  // Fireflies drifting over the island.
  const FLY_COUNT = 36;
  const flyGeo = new THREE.BufferGeometry();
  const flyBase = [];
  for (let f = 0; f < FLY_COUNT; f += 1) {
    flyBase.push((rand() - 0.5) * N * 0.8, 2 + rand() * 3, (rand() - 0.5) * N * 0.8, rand() * 10);
  }
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(FLY_COUNT * 3), 3));
  const flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({
    map: GLOW, color: '#ffe59a', size: 0.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(flies);

  /* 5. CHARACTERS -- voxel models by default, the lecture's art as sprites. */
  const HERO_BOXES = [
    [-1.2, 1, -1, 1, 2, 1, '#4a2a1a'], [1.2, 1, -1, 1, 2, 1, '#4a2a1a'], [-1.2, 1, 1.2, 1, 2, 1, '#4a2a1a'], [1.2, 1, 1.2, 1, 2, 1, '#4a2a1a'],
    [0, 3, 0, 4, 2.6, 5, '#e8803a'], [0, 3, 2.4, 2.6, 2.2, 0.6, '#f6e7d0'],
    [0, 6, 2, 3.8, 3.2, 3.4, '#e8803a'], [0, 5.25, 3.95, 2, 1.4, 1, '#f6e7d0'], [0, 5.7, 4.5, 0.7, 0.55, 0.4, '#2b1a14'],
    [-0.95, 6.55, 3.72, 0.6, 0.8, 0.15, '#22140f'], [0.95, 6.55, 3.72, 0.6, 0.8, 0.15, '#22140f'],
    [-1.25, 8.4, 2, 1.2, 1.6, 0.9, '#e8803a'], [1.25, 8.4, 2, 1.2, 1.6, 0.9, '#e8803a'],
    [-1.25, 8.2, 2.48, 0.6, 1, 0.15, '#f6e7d0'], [1.25, 8.2, 2.48, 0.6, 1, 0.15, '#f6e7d0'],
    [0, 4.65, 0.8, 4.3, 0.9, 4.2, '#c8323c'], [1.5, 3.6, 2.85, 0.9, 1.8, 0.4, '#c8323c'],
    [0, 3.8, -3.2, 1.6, 1.6, 2.6, '#e8803a'], [0, 4.25, -4.8, 1.5, 1.5, 1.1, '#f6e7d0'],
    [-2.6, 3, 1.4, 0.4, 2.4, 0.4, '#5a3a22'], [-2.6, 1.5, 1.4, 1, 1.2, 1, '#ffd27a', true],
  ];
  const ENEMY_BOXES = [
    [-1.5, 0.4, 0, 1.2, 0.8, 1.6, '#2a1830'], [1.5, 0.4, 0, 1.2, 0.8, 1.6, '#2a1830'],
    [0, 3, 0, 5, 4.6, 5, '#3b2448'], [0, 3, 0, 5.4, 1, 5.4, '#4a2d5a'],
    [-1.1, 3.9, 2.55, 1.1, 0.85, 0.2, '#ffd34d', true], [1.1, 3.9, 2.55, 1.1, 0.85, 0.2, '#ffd34d', true],
    [0, 2.4, 2.55, 2.4, 0.45, 0.2, '#ff9f45', true],
  ];
  [[3, 3.8, 0], [-3, 3.8, 0], [0, 3.8, 3], [0, 3.8, -3], [2.2, 5.8, 1.5], [-2.2, 5.8, -1.5], [0, 5.9, 0],
    [2.6, 1.8, -2.4], [-2.6, 1.8, 2.4], [1.8, 5.6, -2.2]].forEach((o) => {
    const horizontal = Math.abs(o[0]) > Math.abs(o[2]);
    ENEMY_BOXES.push([o[0], o[1], o[2], horizontal ? 1.6 : 0.55, o[1] > 5 ? 1.6 : 0.55, horizontal ? 0.55 : 1.6, '#6b3e7a']);
    ENEMY_BOXES.push([o[0] * 1.18, o[1] + (o[1] > 5 ? 0.6 : 0), o[2] * 1.18, 0.4, 0.4, 0.4, '#b98ad0']);
  });
  const LANTERN_BOXES = [
    [0, 0.35, 0, 2.4, 0.7, 2.4, '#5a3a22'], [0, 2.2, 0, 1.9, 2.8, 1.9, '#ffd27a', true],
    [-1.05, 2.2, -1.05, 0.35, 2.8, 0.35, '#5a3a22'], [1.05, 2.2, -1.05, 0.35, 2.8, 0.35, '#5a3a22'],
    [-1.05, 2.2, 1.05, 0.35, 2.8, 0.35, '#5a3a22'], [1.05, 2.2, 1.05, 0.35, 2.8, 0.35, '#5a3a22'],
    [0, 3.9, 0, 2.7, 0.6, 2.7, '#5a3a22'], [0, 4.45, 0, 1.2, 0.5, 1.2, '#5a3a22'], [0, 4.95, 0, 0.45, 0.5, 0.45, '#c9a24a'],
  ];
  const MODEL_HEIGHT = { hero: 9.2, enemy: 6.6, item: 5.2 };
  /** Every character's look in one place. */
  const MODELS = { hero: HERO_BOXES, enemy: ENEMY_BOXES, item: LANTERN_BOXES };
  const SIZES = { hero: R.heroSize, enemy: R.enemySize, item: R.pickupSize };
  const spriteTextures = {};
  function spriteTexture(slot) {
    if (!spriteTextures[slot]) {
      const texture = new THREE.Texture(art[slot]);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      spriteTextures[slot] = texture;
    }
    return spriteTextures[slot];
  }

  /** One character: a body (voxel model or sprite) on a holder that stands on
   *  the ground, with a blob shadow. */
  function makeCharacter(slot) {
    const size = SIZES[slot];
    const holder = new THREE.Group();
    let body;
    if (art[slot]) {
      body = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTexture(slot), alphaTest: 0.08 }));
      body.center.set(0.5, 0.02);
      body.scale.set(size * 1.25, size * 1.25, 1);
      body.userData.sprite = true;
    } else {
      body = voxelModel(MODELS[slot]);
      body.scale.setScalar(size / MODEL_HEIGHT[slot]);
    }
    holder.add(body);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.9, size * 0.9),
      new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    holder.add(shadow);
    holder.userData.body = body;
    scene.add(holder);
    return holder;
  }

  const hero = { x: 0, z: 0, y: groundAt(0, 0), vx: 0, vz: 0, facing: 0, node: makeCharacter('hero') };
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(R.heroSize * 0.78, 20, 14),
    new THREE.MeshBasicMaterial({
      color: C.shield, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
  bubble.position.y = R.heroSize * 0.5;
  bubble.visible = false;
  hero.node.add(bubble);

  /** A lantern for a card: voxel's addPickup, its glow and all. */
  function addLantern(x, z, phase) {
    const node = makeCharacter('item');
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW, color: R.palette.accent, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    glow.scale.set(R.pickupSize * 2.4, R.pickupSize * 2.4, 1);
    glow.position.y = R.pickupSize * 0.5;
    node.add(glow);
    return { x, z, phase, node, glow, out: null };
  }

  // Burst particles, pooled, each its own colour (a right act, a wrong one).
  const SPARKS = 72;
  const sparks = [];
  const sparkMesh = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: '#ffffff' }), SPARKS);
  sparkMesh.frustumCulled = false;
  const white = new THREE.Color('#ffffff');
  for (let sp = 0; sp < SPARKS; sp += 1) {
    sparks.push({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 });
    sparkMesh.setColorAt(sp, white);
  }
  scene.add(sparkMesh);
  const sparkTone = new THREE.Color();
  function burst(x, y, z, tone, rnd, many) {
    sparkTone.set(tone);
    let made = 0;
    for (let i = 0; i < SPARKS && made < many; i += 1) {
      const p = sparks[i];
      if (p.life > 0) { continue; }
      const a = rnd() * TAU;
      p.life = 0.6 + rnd() * 0.4;
      p.x = x; p.y = y; p.z = z;
      p.vx = Math.cos(a) * (1 + rnd() * 2);
      p.vz = Math.sin(a) * (1 + rnd() * 2);
      p.vy = 2 + rnd() * 3;
      sparkMesh.setColorAt(i, sparkTone);
      made += 1;
    }
    if (sparkMesh.instanceColor) { sparkMesh.instanceColor.needsUpdate = true; }
  }

  /** Move with sliding: try each axis on its own, and keep a body radius
   *  clear of blocked cells. */
  function moveOnIsland(entity, dx, dz, radius) {
    const nx = entity.x + dx;
    if (walkable(nx + Math.sign(dx) * radius, entity.z) && walkable(nx, entity.z)) { entity.x = nx; }
    const nz = entity.z + dz;
    if (walkable(entity.x, nz + Math.sign(dz) * radius) && walkable(entity.x, nz)) { entity.z = nz; }
  }

  /** A random reachable cell, `minFromHero` away (voxel's randomLand, seeded). */
  function randomLand(rnd, minFromHero, shoreOnly) {
    for (let tries = 0; tries < 400; tries += 1) {
      const index = Math.floor(rnd() * N * N);
      if (!reach[index] || (shoreOnly && !isShore(index))) { continue; }
      const p = cellCenter(index);
      if (Math.hypot(p.x - hero.x, p.z - hero.z) < minFromHero) { continue; }
      return p;
    }
    return null;
  }

  /** A straight walk from a to b that nothing blocks, a body radius wide. */
  function clearLine(ax, az, bx, bz) {
    const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.2);
    for (let k = 1; k <= steps; k += 1) {
      const x = lerp(ax, bx, k / steps);
      const z = lerp(az, bz, k / steps);
      if (!walkable(x + 0.3, z + 0.3) || !walkable(x - 0.3, z + 0.3)
        || !walkable(x + 0.3, z - 0.3) || !walkable(x - 0.3, z - 0.3)) { return false; }
    }
    return true;
  }

  /**
   * THE WAY TO A TAPPED CARD (the learning layer's: voxel moved only by keys
   * and drag). A breadth-first search over the island's cells, eight ways and
   * never cutting a blocked corner, then pulled straight wherever nothing is
   * in the way. Answers the points to walk through, ending on (tx, tz), or
   * null when the target is water or a tree.
   */
  function pathTo(sx, sz, tx, tz) {
    const start = cell(sx, sz);
    const goal = cell(tx, tz);
    if (start < 0 || goal < 0 || !open(goal)) { return null; }
    const prev = new Int32Array(N * N).fill(-1);
    prev[start] = start;
    const queue = [start];
    for (let head = 0; head < queue.length && prev[goal] < 0; head += 1) {
      const at = queue[head];
      const cx = Math.floor(at / N);
      const cz = at % N;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          if (!dx && !dz) { continue; }
          const x = cx + dx;
          const z = cz + dz;
          if (x < 0 || z < 0 || x >= N || z >= N) { continue; }
          const next = x * N + z;
          if (prev[next] >= 0 || !open(next)) { continue; }
          if (dx && dz && (!open((cx + dx) * N + cz) || !open(cx * N + cz + dz))) { continue; }
          prev[next] = at;
          queue.push(next);
        }
      }
    }
    if (prev[goal] < 0) { return null; }
    const cells = [];
    for (let at = goal; at !== start; at = prev[at]) { cells.unshift(at); }
    const points = cells.map(cellCenter);
    points.push({ x: tx, z: tz });
    const out = [];
    let ax = sx;
    let az = sz;
    let i = 0;
    while (i < points.length) {
      let j = points.length - 1;
      while (j > i && !clearLine(ax, az, points[j].x, points[j].z)) { j -= 1; }
      out.push(points[j]);
      ax = points[j].x;
      az = points[j].z;
      i = j + 1;
    }
    return out;
  }

  /* 11. CAMERA -- a fixed angle that follows the hero; portrait pulls back. */
  const PITCH = 47 * Math.PI / 180;
  const focus = new THREE.Vector3(0, groundAt(0, 0), 0);
  function cameraDistance() {
    return camera.aspect >= 1 ? 31 : 31 + (1 - camera.aspect) * 34;
  }
  function place(dt, shake, rnd) {
    focus.x = lerp(focus.x, hero.x, Math.min(1, dt * 5));
    focus.z = lerp(focus.z, hero.z, Math.min(1, dt * 5));
    focus.y = lerp(focus.y, hero.y, Math.min(1, dt * 4));
    const distance = cameraDistance();
    camera.position.set(focus.x, focus.y + Math.sin(PITCH) * distance, focus.z + Math.cos(PITCH) * distance);
    camera.lookAt(focus.x, focus.y + 0.6, focus.z);
    if (shake > 0) {
      camera.position.x += (rnd() * 2 - 1) * shake;
      camera.position.y += (rnd() * 2 - 1) * shake;
    }
    camera.updateMatrixWorld();
    scene.fog.near = distance * 1.05;
    scene.fog.far = distance * 2.4;
    sun.position.set(focus.x - 18, focus.y + 15, focus.z + 8);
    sun.target.position.copy(focus);
    moon.position.set(camera.position.x + 60, camera.position.y + 30, camera.position.z - 150);
    stars.position.set(camera.position.x, 0, camera.position.z);
  }

  function resize() {
    const width = canvas.clientWidth || 1280;
    const tall = canvas.clientHeight || 720;
    renderer.setSize(width, tall, false);
    camera.aspect = width / tall;
    camera.updateProjectionMatrix();
  }

  /* Animate everything, also behind the cards (voxel's update, its second
     half): the bob of the hero and the chasers, the lanterns turning and
     glowing (and going out), the sparks, the fireflies, the water. */
  function animate(dt, now, enemies, lanterns, invuln, shield, moving) {
    const t = now / 1000;
    hero.y = lerp(hero.y, groundAt(hero.x, hero.z), Math.min(1, dt * 14));
    const heroBody = hero.node.userData.body;
    hero.node.position.set(hero.x, hero.y + (moving ? Math.abs(Math.sin(t * 12)) * 0.12 : Math.sin(t * 2.4) * 0.03), hero.z);
    if (heroBody.userData.sprite) { heroBody.material.rotation = moving ? Math.sin(t * 12) * 0.06 : 0; } else {
      heroBody.rotation.y = lerp(heroBody.rotation.y, hero.facing, Math.min(1, dt * 10));
    }
    hero.node.visible = invuln <= 0 || Math.floor(t * 12) % 2 === 0;
    bubble.visible = shield > 0;
    bubble.material.opacity = 0.16 + Math.sin(t * 8) * 0.06;
    for (const en of enemies) {
      const body = en.node.userData.body;
      en.y = lerp(en.y, groundAt(en.x, en.z), Math.min(1, dt * 10));
      en.node.position.set(en.x, en.y + Math.abs(Math.sin(t * 6 + en.wobble)) * 0.1, en.z);
      if (!body.userData.sprite) { body.rotation.y = Math.atan2(hero.x - en.x, hero.z - en.z) + Math.sin(t * 5 + en.wobble) * 0.15; }
    }
    for (const pk of lanterns) {
      const pb = pk.node.userData.body;
      const fade = pk.out === null ? 1 : Math.max(0.001, 1 - pk.out / 0.4);
      pk.node.position.set(pk.x, groundAt(pk.x, pk.z) + 0.15 + Math.sin(t * 2.6 + pk.phase) * 0.14, pk.z);
      pk.node.scale.setScalar(fade);
      if (!pb.userData.sprite) { pb.rotation.y = t * 0.9 + pk.phase; }
      const pulse = (1 + Math.sin(t * 4 + pk.phase) * 0.12) * fade;
      pk.glow.scale.set(R.pickupSize * 2.4 * pulse, R.pickupSize * 2.4 * pulse, 1);
    }
    for (let q = 0; q < SPARKS; q += 1) {
      const s = sparks[q];
      if (s.life > 0) {
        s.life -= dt;
        s.vy -= 9 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
      }
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(t * 3 + q, t * 2, 0);
      dummy.scale.setScalar(s.life > 0 ? 0.16 * Math.min(1, s.life * 2) : 0);
      dummy.updateMatrix();
      sparkMesh.setMatrixAt(q, dummy.matrix);
    }
    sparkMesh.instanceMatrix.needsUpdate = true;
    const fp = flyGeo.attributes.position;
    for (let w = 0; w < FLY_COUNT; w += 1) {
      const b = w * 4;
      fp.setXYZ(w, flyBase[b] + Math.sin(t * 0.4 + flyBase[b + 3]) * 1.6,
        flyBase[b + 1] + Math.sin(t * 1.1 + flyBase[b + 3]) * 0.5, flyBase[b + 2] + Math.cos(t * 0.35 + flyBase[b + 3]) * 1.6);
    }
    fp.needsUpdate = true;
    water.material.color.set(R.palette.water).multiplyScalar(0.94 + Math.sin(t * 0.8) * 0.04);
  }

  const projected = new THREE.Vector3();
  /** Where a world point lands on the canvas, in its CSS pixels. */
  function project(x, y, z) {
    projected.set(x, y, z).project(camera);
    return {
      x: (projected.x + 1) / 2 * (canvas.clientWidth || 1280),
      y: (1 - projected.y) / 2 * (canvas.clientHeight || 720),
      ahead: projected.z < 1,
    };
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  /** The island under a point of the screen, or null (the sea, the sky). */
  function pick(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) { return null; }
    pointer.set((clientX - box.left) / box.width * 2 - 1, -((clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(tops, false)[0];
    return hit ? { x: hit.point.x, z: hit.point.z } : null;
  }

  /** Put the camera on the hero at once (a new round, a moment). */
  function snap() {
    focus.set(hero.x, hero.y, hero.z);
    place(1, 0, rand);
  }

  function draw() {
    renderer.render(scene, camera);
    return renderer.info.render.calls;
  }

  return {
    THREE, renderer, scene, soft, hero, N, groundAt, walkable, moveOnIsland, randomLand, pathTo, makeCharacter,
    addLantern, burst, animate, place, snap, resize, project, pick, draw,
    remove: (node) => scene.remove(node),
    compile: () => { resize(); snap(); renderer.compile(scene, camera); },
  };
}

function boot() {
  const root = document.getElementById('game');
  if (!root) {
    console.error('[game] لا يوجد عنصر #game في الصفحة. The page has no <div id="game">; get_template hands one out.');
    return;
  }
  let content;
  try {
    content = readContent(SHAPE);
  } catch (error) {
    if (error instanceof GameContentError) { return; }
    throw error;
  }
  root.classList.add('game-root', 'c3');

  const items = content.items;
  const R = { ...DEFAULTS, shield: { ...DEFAULTS.shield }, palette: { ...DEFAULTS.palette } };
  R.hearts = int('lives', 1, 5) || R.hearts;
  const askedEnemies = int('enemies', 0, MOST_ENEMIES);
  const picture = Object.fromEntries(PICTURES.map((name) => {
    const fill = content.slots && content.slots[name];
    if (typeof fill === 'string' && SLOT_PATH.test(fill)) { return [name, fill]; }
    if (fill !== undefined) {
      console.warn(`[game] slots.${name} is not a picture under ../assets/ (${JSON.stringify(fill)}); the placeholder is shown.`);
    }
    return [name, new URL(`assets/${name}.svg`, import.meta.url).href];
  }));
  /* A slot the lecture filled is loaded now, and becomes the island's picture
     once it has loaded; one that never loads leaves voxel's own model. */
  const art = {};
  for (const name of PICTURES) {
    if (!(content.slots && SLOT_PATH.test(String(content.slots[name] || '')))) { continue; }
    const img = new Image();
    img.onload = () => { art[name] = img; };
    img.src = picture[name];
  }
  // three.js, fetched while the learner reads the start screen; null when it
  // cannot load, which is a device that gets the flat board.
  const threeLoading = import('../three/three.module.min.js').catch(() => null);

  /* Colours: base.css variables, read once and spelled the way a canvas
     spells them, so deck.css reaches the sparks and the shield too. Voxel's
     own colours stay only as the fallback for a page with no stylesheet. */
  const css = getComputedStyle(document.documentElement);
  const pen = document.createElement('canvas').getContext('2d');
  const colour = (name, fallback) => {
    if (!pen) { return fallback; }
    pen.fillStyle = fallback;
    pen.fillStyle = css.getPropertyValue(name).trim() || fallback;
    return pen.fillStyle;
  };
  const C = {
    good: colour('--color-accent', R.palette.accent),
    bad: colour('--color-error', '#ff8a6e'),
    shield: colour('--color-info', '#9fe8ff'),
  };

  const state = {
    screen: 'intro', // intro | play | won | lost | nogl | debrief | done | sheet
    outcomes: {}, // item id -> the FIRST outcome: caught | passed | none
    preview: null, // outcomes a moment shows without anyone acting
    paused: false,
    muted: true,
    flat: false, // no WebGL here: the flat board, for every round after
    lost: false, // the browser took the WebGL context back while the page ran
  };
  let round = null;
  let raf = 0;
  let offScreen = false;
  let audio = null;
  let world = null;
  let building = null;
  const left = () => items.filter((item) => !(item.id in state.outcomes));
  const resultOf = (item, act) => (act === RIGHT_ACT[item.kind] ? 'correct' : 'wrong');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function persist() {
    save({ outcomes: state.outcomes, finished: state.screen === 'done' });
  }

  /** The first outcome of a card, reported once; a replay's is practice. */
  function record(item, act, ms) {
    if (item.id in state.outcomes) { return false; }
    state.outcomes[item.id] = act;
    announce({
      id: item.id, type: 'performance', response: act, result: resultOf(item, act), latency: latencyFrom(ms),
    });
    persist();
    return true;
  }

  /* THE STAGE: the world layer (canvas, cards, the flat board) under the
     screen layer (score bar, panels, debrief). The world layer stays for the
     whole page, so the island is built once and never re-made per screen. */
  const canvas = el('canvas', { class: 'c3-canvas', 'aria-hidden': 'true' });
  // The play screen's focus target (render() takes the LAST data-focus, so
  // every other screen's own wins): Start pressed from the keyboard removes
  // its button, and focus fell to the page -- the first Tabs went to sound,
  // pause, out of the document and only then to a card (review of
  // 2026-11-07). Held here, it passes to the first card that rises.
  const cardsBox = el('div', {
    class: 'c3-cards', 'data-cards': true, role: 'group', 'aria-label': 'البطاقات', tabindex: '-1', 'data-focus': true,
  });
  const floatBox = el('div', { class: 'c3-floaters', 'aria-hidden': 'true' });
  const hurt = el('div', { class: 'c3-hurt', 'aria-hidden': 'true' });
  const layer = el('div', { class: 'c3-world', 'data-world-layer': true, hidden: true },
    canvas, el('div', { class: 'c3-board', 'aria-hidden': 'true' }), cardsBox, floatBox, hurt);
  const screenBox = el('div', { class: 'c3-screen' });
  root.replaceChildren(layer, screenBox);

  /* 6. AUDIO -- voxel's tiny synthesized blips, off until the learner asks. */
  function blip(freq, duration, type, volume, slideTo) {
    if (state.muted) { return; }
    try {
      if (!audio) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) { return; }
        audio = new Context();
      }
      if (audio.state === 'suspended') { audio.resume().catch(() => {}); }
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) { osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration); }
      gain.gain.setValueAtTime(volume || 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(audio.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (error) { /* audio is optional */ }
  }
  const sfx = {
    start: () => blip(520, 0.12, 'triangle', 0.07, 780),
    pickup: () => blip(880, 0.1, 'triangle', 0.06, 1320),
    shield: () => blip(440, 0.35, 'sine', 0.06, 1100),
    hurt: () => blip(180, 0.25, 'square', 0.05, 90),
    miss: () => blip(320, 0.14, 'triangle', 0.05, 220),
    win: () => blip(660, 0.5, 'triangle', 0.06, 990),
    lose: () => blip(220, 0.5, 'sawtooth', 0.06, 110),
  };

  // ---- the world, built once -------------------------------------------------

  /** The island, built the first time a round or a moment needs it: true
   *  when it stands, false when this device gives no WebGL (or no three). */
  function ensureWorld() {
    if (world) { return Promise.resolve(true); }
    if (state.flat) { return Promise.resolve(false); }
    if (!building) {
      building = threeLoading.then((THREE) => {
        if (!THREE) { return false; }
        try {
          world = makeIsland(THREE, canvas, R, art, C);
        } catch (error) {
          console.warn(`[game] the island could not be drawn here (${error && error.message}); the flat board is used.`);
          world = null;
        }
        return world !== null;
      });
    }
    return building;
  }

  // ---- a round ------------------------------------------------------------

  /** When each card appears and how long a round lasts. `duration` (a test
   *  setting) squeezes the same schedule into its seconds. */
  function schedule(n) {
    const asked = int('duration', 3, 120);
    let life = R.cardLife;
    let every = R.cardEvery;
    if (asked !== null) {
      life = clamp(asked * 0.45, MIN_LIFE, R.cardLife);
      every = n > 1 ? Math.max(0, (asked - life) / (n - 1)) : 0;
    }
    return { life, every, length: (n - 1) * every + life };
  }

  function newRound(list, practice) {
    const { life, every, length } = schedule(list.length);
    return {
      list, practice, life, every, length, rand: seeded(list.map((item) => item.id).join(',')),
      jolt: seeded('shake'), // the camera's shake, apart, so frames never move a card's spot
      t: 0, last: 0, next: 0, // the next card of `list` to appear
      cards: [], enemies: [],
      hearts: R.hearts, score: 0, rightActs: 0, shield: 0, invuln: 0, shake: 0,
      // As many cards at once as the schedule needs: three by default, more
      // when `duration` squeezes the round, so the clock is the round's.
      maxCards: every > 0 ? Math.max(R.maxCards, Math.ceil(life / every) + 1) : list.length,
      // Voxel's pressure, scaled to the round so a short one is no trap.
      maxEnemies: askedEnemies !== null ? askedEnemies : clamp(Math.ceil(list.length / 3), 1, R.maxEnemies),
      spawnTimer: 0, keys: Object.create(null), drag: null, path: null,
      running: false, endAt: null, won: null,
    };
  }

  /** Take a round's cards, lanterns and chasers off the island and the page. */
  function clearRound() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (round) {
      for (const card of round.cards) { if (card.lantern && world) { world.remove(card.lantern.node); } }
      for (const e of round.enemies) { if (world) { world.remove(e.node); } }
    }
    cardsBox.replaceChildren();
    floatBox.replaceChildren();
    round = null;
  }

  function loop() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  function startRound() {
    if (state.screen === 'play') { return; }
    const replay = left().length === 0;
    clearRound();
    round = newRound(replay ? items : left(), replay); // a replay plays every card again
    state.paused = false;
    root.dataset.running = 'false';
    show('play');
    if (state.flat) { begin(); return; }
    const mine = round;
    ensureWorld().then((ok) => {
      if (round !== mine || state.screen !== 'play') { return; } // the platform played meanwhile
      if (!ok) {
        state.flat = true;
        clearRound();
        show('nogl');
        return;
      }
      begin();
    });
  }

  /** The round's world is ready: the hero home, the first chasers on the
   *  shore, the camera on the hero, the clock running. */
  function begin() {
    root.dataset.world = state.flat ? 'flat' : '3d';
    if (!state.flat) {
      const { hero } = world;
      hero.x = 0; hero.z = 0; hero.vx = 0; hero.vz = 0; hero.y = world.groundAt(0, 0);
      world.compile();
      for (let i = 0; i < Math.min(2, round.maxEnemies); i += 1) { spawnEnemy(); }
    }
    round.running = true;
    round.last = 0;
    root.dataset.running = 'true';
    const loading = screenBox.querySelector('[data-loading]');
    if (loading) { loading.hidden = true; }
    sfx.start();
    hud();
    if (!state.flat) { drawWorld(0, performance.now()); }
    loop();
  }

  /* 7. SPAWNING (voxel's addPickup and addEnemy, seeded; the card is the
     learning layer's). */
  function cardSpot(card) {
    const { rand } = round;
    const { hero } = world;
    const live = round.cards.filter((c) => !c.gone && c !== card);
    const W = canvas.clientWidth || 1280;
    const H = canvas.clientHeight || 720;
    let near = null;
    for (let tries = 0; tries < 300; tries += 1) {
      const p = world.randomLand(rand, 5, false);
      if (!p) { continue; }
      if (live.some((c) => Math.hypot(c.x - p.x, c.z - p.z) < 6)) { continue; }
      // On screen, under the score bar (and the rule, while it shows), with
      // room for its words above it.
      const s = world.project(p.x, world.groundAt(p.x, p.z) + 1, p.z);
      if (s.ahead && s.x > W * 0.12 && s.x < W * 0.88 && s.y > topFloor() + card.h + 16 && s.y < H - 24) { return p; }
      near = near || p;
    }
    return near || world.randomLand(rand, 0, false) || { x: 0, z: 0 };
  }

  /** A free spot of the flat board, in its own pixels. */
  function boardSpot(card) {
    const W = layer.clientWidth || 1280;
    const H = layer.clientHeight || 720;
    const cols = 4;
    const rows = 3;
    const cw = (W - 48) / cols;
    const ch = (H - HUD_ROOM - 24) / rows;
    const taken = new Set(round.cards.filter((c) => !c.gone && c !== card).map((c) => c.slot));
    const free = [];
    for (let i = 0; i < cols * rows; i += 1) { if (!taken.has(i)) { free.push(i); } }
    const slot = free.length ? free[Math.floor(round.rand() * free.length)] : 0;
    return {
      slot,
      px: 24 + (slot % cols) * cw + cw / 2,
      py: HUD_ROOM + Math.floor(slot / cols) * ch + ch / 2,
    };
  }

  function spawnCard(item) {
    const node = el('button', {
      type: 'button', class: 'c3-card', 'data-card': item.id,
      'aria-label': state.flat ? `بطاقة: ${item.label}. انقر لتمسكها.` : `بطاقة: ${item.label}. انقر لتمشي إليها.`,
    },
    state.flat ? el('img', { class: 'c3-card-art', src: picture.item, alt: '' }) : null,
    el('span', { class: 'c3-card-label', text: item.label }),
    el('span', { class: 'c3-card-life', 'aria-hidden': 'true' }));
    cardsBox.append(node);
    const card = {
      item, node, w: node.offsetWidth || 200, h: node.offsetHeight || 80, born: round.t,
      outcome: null, gone: false, x: 0, z: 0, lantern: null, slot: -1,
    };
    if (state.flat) {
      const spot = boardSpot(card);
      card.slot = spot.slot;
      node.style.transform = `translate(${spot.px - card.w / 2}px, ${spot.py - card.h / 2}px)`;
      card.px = spot.px;
      card.py = spot.py;
    } else {
      const p = cardSpot(card);
      card.x = p.x;
      card.z = p.z;
      card.lantern = world.addLantern(p.x, p.z, round.rand() * 6);
      placeCard(card);
    }
    round.cards.push(card);
    // A keyboard learner waiting on the group (Start, or a card just
    // decided) lands on the card that rose, so Enter walks there at once.
    if (document.activeElement === cardsBox) { node.focus({ preventScroll: true }); }
    say(`بطاقة جديدة: ${item.label}`);
    return card;
  }

  function spawnEnemy() {
    if (round.enemies.length >= round.maxEnemies) { return; }
    const p = world.randomLand(round.rand, 9, true) || world.randomLand(round.rand, 7, false);
    if (!p) { return; }
    round.enemies.push({
      x: p.x, z: p.z, y: world.groundAt(p.x, p.z), wobble: round.rand() * 6, node: world.makeCharacter('enemy'),
    });
  }

  /** The highest a card's top may sit, in the cards' own pixels: under the
   *  score bar, and under the rule while the rule shows. Voxel's follow
   *  camera carries the cards up as the hero walks, and the rule is opaque:
   *  a card held at the score bar alone sat under it for up to 3 s of its
   *  6 s life (review of 2026-11-07, 46% of a safe card covered), long
   *  enough to fade there unread -- passed, an answer nobody chose. */
  function topFloor() {
    const box = screenBox.querySelector('[data-toast]');
    return box && !box.hidden && box.floor ? Math.max(HUD_ROOM, box.floor) : HUD_ROOM;
  }

  /** A card's words over its lantern: projected, kept inside the stage. */
  function placeCard(card, floor = topFloor()) {
    const W = canvas.clientWidth || 1280;
    const H = canvas.clientHeight || 720;
    const s = world.project(card.x, world.groundAt(card.x, card.z) + R.pickupSize * 1.3, card.z);
    const x = clamp(s.x - card.w / 2, 8, W - card.w - 8);
    const y = clamp(s.y - card.h - 6, floor, H - card.h - 8);
    card.node.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    card.node.toggleAttribute('data-edge', x !== s.x - card.w / 2 || y !== s.y - card.h - 6);
  }

  /** A word that rises and fades where something happened. */
  function addFloater(at, text, kind) {
    const node = el('span', { class: 'c3-floater', 'data-kind': kind, text });
    node.style.transform = `translate(${Math.round(at.x)}px, ${Math.round(at.y)}px)`;
    floatBox.append(node);
    setTimeout(() => node.remove(), 900);
  }

  function screenOf(card) {
    if (state.flat) { return { x: card.px, y: card.py - card.h / 2 }; }
    return world.project(card.x, world.groundAt(card.x, card.z) + R.pickupSize * 1.4, card.z);
  }

  function flash() {
    hurt.removeAttribute('data-on');
    void hurt.offsetWidth; // restart the animation
    hurt.setAttribute('data-on', '');
  }

  /* The learning layer's two outcomes. */
  function resolveCard(card, act) {
    const { item } = card;
    const r = round;
    card.outcome = act;
    card.doneAt = r.t;
    card.node.dataset.outcome = act;
    const right = act === RIGHT_ACT[item.kind];
    card.node.dataset.result = right ? 'correct' : 'wrong';
    const hadFocus = document.activeElement === card.node;
    card.node.disabled = true;
    if (hadFocus) {
      // To the next live card, else to the group the next card will take it
      // from (spawnCard) -- never out of the game to the page.
      const next = r.cards.find((c) => !c.outcome && c !== card);
      (next ? next.node : cardsBox).focus({ preventScroll: true });
    }
    record(item, act, (r.t - card.born) * 1000);
    const at = screenOf(card);
    if (card.lantern) {
      card.lantern.out = 0;
      if (act === 'caught') {
        world.burst(card.x, world.groundAt(card.x, card.z) + R.pickupSize * 0.6, card.z, right ? C.good : C.bad, r.rand,
          reduced() ? 6 : 16);
      }
    }
    if (right) {
      r.score += 1;
      r.rightActs += 1;
      if (R.shield.enabled && r.rightActs % R.shield.every === 0) {
        r.shield = R.shield.seconds;
        sfx.shield();
        addFloater({ x: at.x, y: at.y - 44 }, `درع ${R.shield.seconds} ث`, 'shield');
      }
      addFloater(at, '+1', 'good');
      sfx.pickup();
      say(`${ACT_WORDS[act]}: ${item.label}. أحسنت.`);
      return;
    }
    if (act === 'caught') {
      // A hazard caught is voxel's hit: a heart, the blink, a shake, a burst.
      r.hearts -= 1;
      r.invuln = Math.max(r.invuln, 1.4);
      r.shake = 0.35;
      flash();
      sfx.hurt();
    } else {
      addFloater(at, 'فاتتك', 'bad');
      sfx.miss();
    }
    toast(item);
    say(`${ACT_WORDS[act]}: ${item.label}. ${item.rule}`);
  }

  /* A chaser's touch: voxel's, which reports nothing. */
  function hurtHero(e) {
    const r = round;
    const { hero } = world;
    const tx = hero.x - e.x;
    const tz = hero.z - e.z;
    const d = Math.hypot(tx, tz) || 1;
    r.hearts -= 1;
    r.invuln = 1.4;
    r.shake = 0.35;
    // Pushed AWAY from the chaser. Voxel moved the hero by -(hero - chaser),
    // which is toward it, into a second touch the blink alone held off.
    world.moveOnIsland(hero, tx / d * 1.4, tz / d * 1.4, 0.3);
    flash();
    sfx.hurt();
    say(`أصابك مطارد. بقي ${Math.max(0, r.hearts)} من القلوب.`);
  }

  /** Voxel's input: the keys, else the drag's direction (screen-aligned:
   *  right is +x, down the screen is +z, the camera never turns). */
  function inputDirection() {
    const r = round;
    let x = (r.keys.right ? 1 : 0) - (r.keys.left ? 1 : 0);
    let z = (r.keys.down ? 1 : 0) - (r.keys.up ? 1 : 0);
    if (r.drag && r.drag.moved) {
      const length = Math.hypot(r.drag.dx, r.drag.dy);
      if (length > 10) { x = r.drag.dx / length; z = r.drag.dy / length; }
    }
    const magnitude = Math.hypot(x, z);
    return magnitude > 0 ? { x: x / magnitude, z: z / magnitude } : { x: 0, z: 0 };
  }

  /** Walk the hero to a point of the island, by a path (a tap, a card). */
  function walkTo(x, z) {
    if (!round || !world || state.flat) { return; }
    const path = world.pathTo(world.hero.x, world.hero.z, x, z);
    if (path) { round.path = path; }
  }

  /* 10. UPDATE (voxel's section 10, the learning layer in it): one step of
     the game clock, never longer than STEP. */
  function update(dt) {
    const r = round;
    if (r.shake > 0) { r.shake = Math.max(0, r.shake - dt); }
    if (r.endAt !== null) { return; }
    r.t += dt;
    r.invuln = Math.max(0, r.invuln - dt);
    r.shield = Math.max(0, r.shield - dt);

    if (!state.flat) {
      const { hero } = world;
      // Movement: voxel's keys and drag; else the path to a tapped spot.
      let dir = inputDirection();
      let pace = 1;
      if (dir.x || dir.z) {
        r.path = null;
      } else if (r.path) {
        const p = r.path[0];
        const dx = p.x - hero.x;
        const dz = p.z - hero.z;
        const d = Math.hypot(dx, dz);
        const last = r.path.length === 1;
        if (d < (last ? 0.12 : 0.35)) {
          r.path.shift();
          if (!r.path.length) { r.path = null; }
        } else {
          dir = { x: dx / d, z: dz / d };
          if (last) { pace = Math.min(1, d / 0.8); }
        }
      }
      hero.vx = lerp(hero.vx, dir.x * R.heroSpeed * pace, Math.min(1, dt * 12));
      hero.vz = lerp(hero.vz, dir.z * R.heroSpeed * pace, Math.min(1, dt * 12));
      world.moveOnIsland(hero, hero.vx * dt, hero.vz * dt, 0.3);
      if (Math.abs(hero.vx) + Math.abs(hero.vz) > 0.4) { hero.facing = Math.atan2(hero.vx, hero.vz); }

      // Chasers: voxel's chase, separation, shield and contact.
      r.spawnTimer += dt;
      if (r.spawnTimer >= R.enemySpawnEvery && r.enemies.length < r.maxEnemies) { r.spawnTimer = 0; spawnEnemy(); }
      const speed = R.enemySpeed + R.enemySpeedGrowth * r.t;
      for (let i = 0; i < r.enemies.length; i += 1) {
        const e = r.enemies[i];
        const tx = hero.x - e.x;
        const tz = hero.z - e.z;
        const dist = Math.hypot(tx, tz) || 1;
        let ax = tx / dist;
        let az = tz / dist;
        for (let j = 0; j < r.enemies.length; j += 1) {
          if (i === j) { continue; }
          const ox = e.x - r.enemies[j].x;
          const oz = e.z - r.enemies[j].z;
          const od = Math.hypot(ox, oz);
          if (od > 0 && od < 1.6) { ax += ox / od * 0.8; az += oz / od * 0.8; }
        }
        let al = Math.hypot(ax, az) || 1;
        if (r.shield > 0 && dist < 3) { ax = -tx / dist; az = -tz / dist; al = 1; }
        world.moveOnIsland(e, ax / al * speed * dt, az / al * speed * dt, 0.3);
        if (dist < (R.heroSize + R.enemySize) * 0.36) {
          if (r.shield > 0) {
            world.moveOnIsland(e, -tx / dist * 1.2, -tz / dist * 1.2, 0.3);
          } else if (r.invuln <= 0) {
            hurtHero(e);
            if (r.hearts <= 0) { break; }
          }
        }
      }
    }

    // Cards: one appears on its time while the island has room; a card the
    // hero reaches is caught; a card past its life goes out, passed.
    const live = r.cards.filter((c) => !c.outcome).length;
    if (r.hearts > 0 && r.next < r.list.length && r.t >= r.next * r.every && live < r.maxCards) {
      spawnCard(r.list[r.next]);
      r.next += 1;
    }
    for (const card of r.cards) {
      if (card.gone) { continue; }
      if (!card.outcome) {
        if (r.hearts <= 0) { continue; }
        const near = !state.flat
          && Math.hypot(card.x - world.hero.x, card.z - world.hero.z) < (R.heroSize + R.pickupSize) * 0.38;
        if (near) {
          resolveCard(card, 'caught');
        } else if (r.t - card.born >= r.life) {
          resolveCard(card, 'passed');
        } else {
          card.node.style.setProperty('--c3-left', String(1 - (r.t - card.born) / r.life));
        }
      } else if (r.t - card.doneAt > 0.4) {
        card.node.remove();
        if (card.lantern) { world.remove(card.lantern.node); }
        card.gone = true;
      }
    }
    for (const card of r.cards) { if (card.lantern && card.lantern.out !== null) { card.lantern.out += dt; } }

    hud();
    const over = r.hearts <= 0 || (r.next >= r.list.length && r.cards.every((c) => c.gone));
    if (over) { r.endAt = performance.now(); r.won = r.hearts > 0; }
  }

  /* 12. LOOP -- the wall's clock in steps, voxel's animation, the picture. */
  function drawWorld(dt, now) {
    const r = round;
    const { hero } = world;
    const moving = r && r.running && Math.hypot(hero.vx, hero.vz) > 0.5 && state.screen === 'play';
    world.animate(dt, now, r ? r.enemies : [], r ? r.cards.filter((c) => c.lantern && !c.gone).map((c) => c.lantern) : [],
      r ? r.invuln : 0, r ? r.shield : 0, moving);
    const shake = r && r.shake > 0 && !reduced() ? r.shake * 0.9 : 0;
    world.place(dt, shake, r ? r.jolt : Math.random);
    const floor = topFloor();
    if (r) { for (const card of r.cards) { if (!card.gone) { placeCard(card, floor); } } }
    root.dataset.draws = String(world.draw());
  }

  function frame(now) {
    raf = 0;
    if (!round) { return; }
    const playing = state.screen === 'play';
    if (!playing && state.screen !== 'won' && state.screen !== 'lost') { return; }
    const wall = round.last ? Math.min(0.25, Math.max(0, (now - round.last) / 1000)) : 0;
    round.last = now;
    if (!offScreen) {
      if (playing && round.running && !state.paused) {
        for (let rest = wall; rest > 1e-6; rest -= STEP) { update(Math.min(STEP, rest)); }
      }
      if (!state.flat) { drawWorld(wall, now); }
    }
    if (playing && round.endAt !== null && performance.now() - round.endAt > END_PAUSE_MS) { endRound(); }
    raf = requestAnimationFrame(frame);
  }

  function endRound() {
    state.screen = round.won ? 'won' : 'lost';
    if (round.won) { sfx.win(); } else { sfx.lose(); }
    // A card still up when the hearts ran out leaves the island; the
    // debrief reports it as never met. A keyboard learner on it is held in
    // the game first, so render() hands the end screen its focus.
    if (cardsBox.contains(document.activeElement)) { cardsBox.focus({ preventScroll: true }); }
    for (const card of round.cards) {
      if (!card.gone && !card.outcome) {
        card.node.remove();
        if (card.lantern) { world.remove(card.lantern.node); }
        card.gone = true;
      }
    }
    round.keys = Object.create(null);
    round.drag = null;
    round.path = null;
    render();
  }

  // ---- what the learner reads and hears ---------------------------------

  function toast(item) {
    const box = screenBox.querySelector('[data-toast]');
    if (!box) { return; }
    box.replaceChildren(el('strong', { text: `${item.label}: ` }), item.rule);
    box.hidden = false;
    // Where the rule ends, in the cards' pixels (a two-line rule ends lower):
    // no card rises past it while it shows (topFloor).
    box.floor = box.getBoundingClientRect().bottom - cardsBox.getBoundingClientRect().top + 8;
    clearTimeout(box.timer);
    box.timer = setTimeout(() => { box.hidden = true; }, 3000);
  }

  function say(text) {
    const live = screenBox.querySelector('[data-say]');
    if (live) { live.textContent = text; }
  }

  function hud() {
    if (!round) { return; }
    const hearts = screenBox.querySelector('[data-hearts]');
    if (!hearts) { return; }
    const full = Math.max(0, round.hearts);
    if (hearts.dataset.count !== String(full)) {
      hearts.dataset.count = String(full);
      hearts.replaceChildren(
        el('span', { class: 'sr-only', text: `القلوب: ${full} من ${R.hearts}` }),
        ...Array.from({ length: R.hearts }, (_, i) => el('span', {
          class: 'c3-heart', 'data-full': i < full ? 'true' : 'false', 'aria-hidden': 'true', text: '♥',
        })));
    }
    screenBox.querySelector('[data-score]').textContent = `النقاط: ${round.score}`;
    // Less a microsecond: (3 - 1.5) / 9 * 9 + 1.5 can be 3.0000000000000004.
    const remaining = Math.max(0, Math.ceil(round.length - round.t - 1e-6));
    screenBox.querySelector('[data-time]').textContent = `الوقت: ${remaining} ث`;
    const shield = screenBox.querySelector('[data-shield]');
    shield.hidden = !(round.shield > 0);
    shield.textContent = `الدرع: ${Math.ceil(round.shield)} ث`;
    root.dataset.enemies = String(round.enemies.length);
  }

  // ---- the debrief, and the end -----------------------------------------

  function toDebrief() {
    clearRound();
    // Every card the learner never met is a decision never made: `none`,
    // reported once, now -- before the debrief that names it.
    for (const item of left()) {
      state.outcomes[item.id] = 'none';
      announce({ id: item.id, type: 'performance', response: 'none', result: 'wrong' });
    }
    persist();
    show('debrief');
  }

  function end() {
    if (state.screen !== 'debrief') { return; }
    state.screen = 'done';
    persist();
    finish();
    render();
  }

  function rowsFor(outcomes) {
    return items.map((item) => {
      const act = outcomes[item.id];
      const met = act === 'caught' || act === 'passed';
      return {
        id: item.id, situation: `${item.label} · ${KIND_WORDS[item.kind]}`,
        chosen: met ? ACT_WORDS[act] : null, rule: item.rule, source: item.source,
        result: met ? resultOf(item, act) : 'none',
      };
    });
  }

  // ---- the views ----------------------------------------------------------

  function header(title, line) {
    return el('header', { class: 'c3-head' },
      line ? el('p', { class: 'c3-line', text: line }) : null,
      el('h2', { class: 'c3-title', tabindex: '-1', 'data-focus': true, text: title }));
  }

  function soundButton() {
    return el('button', {
      type: 'button', class: 'btn-ghost c3-sound', 'data-act': 'sound',
      'aria-pressed': state.muted ? 'false' : 'true', text: state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل',
    });
  }

  /** The cast beside the start and end screens, voxel's own pictures of its
   *  models: the character the learner moves, what chases, the lantern. */
  function scene() {
    return el('div', { class: 'c3-scene' },
      el('div', { class: 'c3-scene-row' },
        el('img', { class: 'c3-scene-item', src: picture.item, alt: 'الفانوس الذي تقف فوقه البطاقة' }),
        el('img', { class: 'c3-scene-enemy', src: picture.enemy, alt: 'المخلوق الذي يطاردك' })),
      el('img', { class: 'c3-scene-hero', src: picture.hero, alt: 'الشخصية التي تحرّكها' }));
  }

  function introView() {
    const remaining = left().length;
    const resuming = remaining > 0 && remaining < items.length;
    return el('div', { class: 'c3-intro' },
      el('div', { class: 'c3-intro-text' },
        header(content.title, resuming ? `تابع: بقيت ${remaining} من ${items.length} بطاقات` : `${items.length} بطاقات`),
        el('p', { text: 'على الجزيرة فوانيس، فوق كل فانوس بطاقة تبقى قليلًا ثم ينطفئ فانوسها. امشِ إلى البطاقة الآمنة لتمسكها، واترك الخطِرة حتى تنطفئ.' }),
        el('p', { text: `وابتعد عن المخلوقات التي تطاردك. لديك ${R.hearts} قلوب: تخسر قلبًا إن أمسكت بطاقة خطِرة أو لحق بك مطارد. كل ${R.shield.every} اختيارات صحيحة تمنحك درعًا.` }),
        el('p', { class: 'c3-how', text: 'انقر بطاقة أو مكانًا على الجزيرة لتمشي إليه، أو اسحب على الأرض، أو استعمل الأسهم.' }),
        el('div', { class: 'c3-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'start', 'data-focus': true,
            text: resuming ? 'تابع' : 'ابدأ',
          }),
          soundButton())),
      scene());
  }

  function playView() {
    const waiting = !(round && round.running);
    return el('div', { class: 'c3-play', 'data-play': true },
      el('div', { class: 'c3-hud' },
        el('p', { class: 'c3-pill c3-hearts', 'data-hearts': true }),
        el('p', { class: 'c3-pill', 'data-score': true }),
        el('p', { class: 'c3-pill', 'data-time': true }),
        el('p', { class: 'c3-pill c3-shield', 'data-shield': true, hidden: true }),
        el('div', { class: 'c3-hud-acts' },
          soundButton(),
          el('button', { type: 'button', class: 'btn-secondary', 'data-act': 'pause', text: 'إيقاف مؤقت' }))),
      el('p', { class: 'c3-loading', 'data-loading': true, hidden: !waiting, text: 'جارٍ رسم الجزيرة…' }),
      el('p', { class: 'c3-toast', 'data-toast': true, role: 'status', hidden: true }),
      el('div', { class: 'c3-paused', 'data-paused': true, hidden: true },
        el('p', { class: 'c3-title', text: 'اللعبة متوقّفة' }),
        el('button', { type: 'button', class: 'btn-primary', 'data-act': 'resume', text: 'تابع اللعب' })),
      el('p', { class: 'sr-only', 'aria-live': 'polite', 'data-say': true }));
  }

  function endView() {
    const won = state.screen === 'won';
    const played = round ? round.list.length : items.length;
    const score = round ? round.score : 0;
    const practice = round && round.practice;
    return el('div', { class: 'c3-end', 'data-end': state.screen },
      el('div', { class: 'c3-end-text' },
        header(won ? 'انتهت الجولة!' : 'نفدت قلوبك', content.title),
        el('p', { class: 'c3-big', text: `أصبت ${score} من ${played}` }),
        practice ? el('p', { text: 'جولة تدريب: نتيجتك الأولى هي التي حُسبت.' }) : null,
        el('div', { class: 'c3-actions' },
          el('button', {
            type: 'button', class: won ? 'btn-primary' : 'btn-secondary', 'data-act': 'debrief',
            'data-focus': won ? true : null, text: 'إلى الخلاصة',
          }),
          el('button', {
            type: 'button', class: won ? 'btn-secondary' : 'btn-primary', 'data-act': 'again',
            'data-focus': won ? null : true, text: won ? 'العب مرة أخرى' : 'حاول مرة أخرى',
          }))),
      scene());
  }

  /** Voxel's "fail readably" screen, which here still lets the learner finish. */
  function noglView() {
    const webgl = () => el('span', { class: 'ltr-inline', dir: 'ltr', text: 'WebGL' });
    return el('div', { class: 'c3-intro c3-nogl' },
      el('div', { class: 'c3-intro-text' },
        header(state.lost ? 'توقّف رسم الجزيرة' : 'الجزيرة لا تظهر على هذا الجهاز', content.title),
        state.lost
          ? el('p', {}, 'توقّف المتصفح عن رسم الجزيرة بتقنية ', webgl(), '. ما قررته في البطاقات قبلها محسوب كما هو.')
          : el('p', {}, 'هذه اللعبة ترسم جزيرتها بتقنية ', webgl(), '، وهي غير متاحة هنا.'),
        el('p', {
          text: state.lost
            ? 'البطاقات الباقية تنتظرك على لوح مسطح: انقر البطاقة الآمنة لتمسكها، واترك الخطِرة حتى تختفي.'
            : 'البطاقات نفسها تنتظرك على لوح مسطح: انقر البطاقة الآمنة لتمسكها، واترك الخطِرة حتى تختفي. تُحتسب كما هي في الجزيرة.',
        }),
        el('div', { class: 'c3-actions' },
          el('button', {
            type: 'button', class: 'btn-primary', 'data-act': 'flat', 'data-focus': true, text: 'العب على اللوح المسطح',
          }),
          soundButton())),
      scene());
  }

  function debriefView() {
    const done = state.screen === 'done';
    return el('div', { class: 'c3-debrief' },
      header('خلاصة الجولة', content.title),
      debrief(rowsFor(state.preview || state.outcomes)),
      done
        ? el('p', { class: 'c3-done', role: 'status', text: 'انتهيت. يمكنك المتابعة إلى الشريحة التالية.' })
        : el('button', { type: 'button', class: 'btn-primary', 'data-act': 'finish', text: 'إنهاء' }));
  }

  /** Every card, what it is, what to do with it, the rule and its source,
   *  for a reviewer: moment=feedback-sheet. */
  function sheetView() {
    return el('div', { class: 'c3-sheet', 'data-sheet': true },
      el('header', { class: 'c3-sheet-head', 'data-sheet-head': true },
        el('h2', { class: 'c3-title', text: `ورقة المراجعة: ${content.title}` }),
        el('p', { class: 'c3-line', 'data-sheet-count': true })),
      el('div', { class: 'c3-sheet-items' }, items.map((item) => el('section', {
        class: 'c3-sheet-item', 'data-sheet-point': item.id, 'data-kind': item.kind,
      },
      el('h3', { text: item.label }),
      el('p', { class: 'c3-sheet-kind' }, el('strong', { text: `${KIND_WORDS[item.kind]}. ` }),
        `الصحيح: ${ACT_WORDS[RIGHT_ACT[item.kind]]}.`),
      el('p', {}, el('strong', { text: 'القاعدة: ' }), item.rule),
      item.source ? el('p', { class: 'c3-source', text: `المصدر: ${item.source}` }) : null))));
  }

  /** Whole items, in order, as many as the stage holds under the head,
   *  measured (catch's paging); `sheet=` picks the page. */
  function pageTheSheet() {
    const sheet = screenBox.querySelector('[data-sheet]');
    const parts = [...sheet.querySelectorAll('[data-sheet-point]')];
    const bottom = root.getBoundingClientRect().top + root.clientHeight
      - parseFloat(getComputedStyle(root).paddingBlockEnd);
    const room = bottom - parts[0].getBoundingClientRect().top;
    const gap = parseFloat(getComputedStyle(parts[0].parentElement).rowGap) || 0;
    let pages = 1;
    let used = 0;
    for (const part of parts) {
      const tall = part.getBoundingClientRect().height;
      if (used && used + gap + tall > room) { pages += 1; used = 0; }
      used += (used ? gap : 0) + tall;
      part.dataset.page = String(pages);
    }
    const shown = Math.min(Math.max(setting('sheet') || 1, 1), pages);
    parts.forEach((part) => { part.hidden = Number(part.dataset.page) !== shown; });
    sheet.dataset.sheetPages = String(pages);
    sheet.dataset.sheetPage = String(shown);
    sheet.querySelector('[data-sheet-count]').replaceChildren(`الصفحة ${shown} من ${pages}`,
      shown < pages ? ' · التالية: ' : '',
      shown < pages ? el('span', { class: 'ltr-inline', dir: 'ltr', text: `sheet=${shown + 1}` }) : '');
  }

  const VIEWS = {
    intro: introView, play: playView, won: endView, lost: endView, nogl: noglView,
    debrief: debriefView, done: debriefView, sheet: sheetView,
  };
  const ON_THE_ISLAND = ['play', 'won', 'lost'];

  function show(screen) {
    state.screen = screen;
    render();
    root.scrollTop = 0;
  }

  function render() {
    const hadFocus = root.contains(document.activeElement);
    root.setAttribute('data-screen', state.screen);
    if (!ON_THE_ISLAND.includes(state.screen)) { root.dataset.running = 'false'; }
    layer.hidden = !ON_THE_ISLAND.includes(state.screen);
    screenBox.className = `c3-screen c3-on-${state.screen}`;
    screenBox.replaceChildren(VIEWS[state.screen]());
    if (state.screen === 'sheet') { pageTheSheet(); }
    if (state.screen === 'play') { hud(); }
    if (world && !state.flat && !layer.hidden) { world.resize(); }
    if (hadFocus) {
      const target = [...root.querySelectorAll('[data-focus]')].pop();
      if (target) { target.focus(); }
    }
  }

  // ---- 9. INPUT: voxel's keys and drag, a tap or a card to walk ----------

  /* Voxel's press-and-drag on the island, and a short tap walks there. */
  canvas.addEventListener('pointerdown', (event) => {
    if (!round || !round.running || state.paused || state.screen !== 'play') { return; }
    try { canvas.setPointerCapture(event.pointerId); } catch (error) { /* not captured */ }
    round.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false };
  });
  canvas.addEventListener('pointermove', (event) => {
    const drag = round && round.drag;
    if (!drag || event.pointerId !== drag.id) { return; }
    drag.dx = event.clientX - drag.x;
    drag.dy = event.clientY - drag.y;
    if (Math.hypot(drag.dx, drag.dy) > 10) { drag.moved = true; }
  });
  const release = (event) => {
    const drag = round && round.drag;
    if (!drag || event.pointerId !== drag.id) { return; }
    round.drag = null;
    if (!drag.moved && event.type === 'pointerup' && world) {
      const spot = world.pick(event.clientX, event.clientY);
      if (spot) { walkTo(spot.x, spot.z); }
    }
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  function setPaused(paused) {
    if (!round || state.screen !== 'play') { return; }
    state.paused = paused;
    round.keys = Object.create(null);
    round.drag = null;
    screenBox.querySelector('[data-paused]').hidden = !paused;
    if (paused) { screenBox.querySelector('[data-act=resume]').focus(); }
    round.last = 0;
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target || target.disabled || !root.contains(target)) { return; }
    if (target.dataset.card !== undefined) {
      const card = round && round.running && round.cards.find((c) => c.item.id === target.dataset.card && !c.outcome);
      if (!card || state.paused || state.screen !== 'play') { return; }
      // On the island a card walks the character to it: catching is still
      // walking there. On the flat board the tap is the catch.
      if (state.flat) { resolveCard(card, 'caught'); } else { walkTo(card.x, card.z); }
      return;
    }
    const act = target.dataset.act;
    if (act === 'start' || act === 'again' || act === 'flat') { startRound(); }
    if (act === 'pause') { setPaused(true); }
    if (act === 'resume') { setPaused(false); }
    if (act === 'debrief') { toDebrief(); }
    if (act === 'finish') { end(); }
    if (act === 'sound') {
      state.muted = !state.muted;
      target.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
      target.textContent = state.muted ? 'الصوت: مغلق' : 'الصوت: يعمل';
      sfx.pickup();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'play' || !round) { return; }
    // By `code` (voxel's), so an Arabic keyboard layout moves the same; by
    // `key` too, for the arrows a script or an on-screen keyboard sends.
    const move = KEYMAP[event.code] || KEYMAP[event.key];
    if (move) {
      event.preventDefault();
      if (!state.paused) { round.keys[move] = true; }
    }
    const key = (event.key || '').toLowerCase();
    if (event.code === 'KeyM' || key === 'm') { const sound = screenBox.querySelector('[data-act=sound]'); if (sound) { sound.click(); } }
    if ((event.code === 'KeyP' || key === 'p' || key === 'escape') && !state.paused) { event.preventDefault(); setPaused(true); }
  });
  document.addEventListener('keyup', (event) => {
    const move = KEYMAP[event.code] || KEYMAP[event.key];
    if (round && move) { round.keys[move] = false; }
  });
  window.addEventListener('resize', () => { if (world && !state.flat && !layer.hidden) { world.resize(); } });
  /* A LOST CONTEXT. iPad Safari takes a WebGL context back under memory
     pressure; the island then goes blank while the round runs on, unseen
     chasers still taking hearts (review of 2026-11-07, WEBGL_lose_context
     0.8 s into a round). A context that went once is not trusted to stay:
     the round stops, reporting nothing for itself -- the cards met keep
     their outcomes, the rest are still to come -- and the screen a device
     with no WebGL gets says so and plays the rest on the flat board. */
  canvas.addEventListener('webglcontextlost', () => {
    if (state.flat) { return; }
    console.warn('[game] the browser took the island\'s WebGL context back; the flat board is used.');
    state.flat = true;
    state.lost = true;
    if (state.screen === 'play') {
      clearRound();
      show('nogl');
    }
  });
  window.addEventListener('blur', () => { if (round) { round.keys = Object.create(null); round.drag = null; } });
  // Off screen (the deck moved on, or the tab is hidden) the round waits.
  if (window.deckNav && typeof window.deckNav.onScreen === 'function') {
    window.deckNav.onScreen((on) => { offScreen = !on; if (round) { round.last = 0; } });
  }
  document.addEventListener('visibilitychange', () => { if (round) { round.last = 0; round.drag = null; } });

  // ---- the platform's hooks, and a returning learner ----------------------

  /** The meadow frozen the instant a hazard was caught, on the island or the
   *  board: a heart gone, the rule up, a chaser closing in. Drawn once. */
  async function afterWrong() {
    const hazard = items.find((item) => item.kind === 'hazard') || items[0];
    const other = items.find((item) => item !== hazard) || hazard;
    const ok = await ensureWorld();
    if (!ok) { state.flat = true; }
    clearRound();
    round = newRound(items, true);
    round.t = 4;
    round.hearts = R.hearts - 1;
    round.running = true;
    state.paused = false;
    show('play');
    root.dataset.world = state.flat ? 'flat' : '3d';
    screenBox.querySelector('[data-loading]').hidden = true;
    if (!state.flat) {
      const { hero } = world;
      hero.x = 0; hero.z = 0; hero.vx = 0; hero.vz = 0; hero.y = world.groundAt(0, 0);
      world.compile();
    }
    const caught = spawnCard(hazard);
    caught.node.dataset.result = 'wrong';
    spawnCard(other);
    if (!state.flat) {
      const { hero } = world;
      hero.x = caught.x + 0.4;
      hero.z = caught.z + 0.7;
      hero.y = world.groundAt(hero.x, hero.z);
      hero.facing = Math.PI;
      const spot = world.randomLand(round.rand, 4, false) || { x: hero.x + 4, z: hero.z };
      const side = Math.sign(spot.x - hero.x) || 1;
      const ex = clamp(hero.x + side * 4, -12, 12);
      round.enemies.push({ x: ex, z: hero.z - 1.5, y: world.groundAt(ex, hero.z - 1.5), wobble: 0, node: world.makeCharacter('enemy') });
      world.burst(caught.x, world.groundAt(caught.x, caught.z) + R.pickupSize * 0.6, caught.z, C.bad, round.rand, 16);
      world.snap();
      // The sparks a moment after the catch, and everything stood still.
      drawWorld(0.12, 4000);
    }
    flash();
    toast(hazard);
    hud();
  }

  registerTest({
    decisions: () => items.map((item) => ({ id: item.id, choices: ['caught', 'passed'] })),
    play: async (path) => {
      // Through the game's own record(), never its physics: every card the
      // learner has not met is resolved as `path` says, in order; then the
      // debrief, which reports `none` for what `skip` left, and the end.
      clearRound();
      state.preview = null;
      for (const item of left()) {
        if (path === 'skip') { break; }
        record(item, path === 'right' ? RIGHT_ACT[item.kind] : WRONG_ACT[item.kind], 0);
      }
      if (state.screen !== 'done') { toDebrief(); end(); }
    },
    moment: async (name) => {
      // A moment is a picture: it reports nothing and saves nothing.
      state.preview = null;
      if (name === 'start') { clearRound(); show('intro'); return; }
      if (name === 'feedback-sheet') { clearRound(); show('sheet'); return; }
      if (name === 'debrief') {
        clearRound();
        state.preview = Object.fromEntries(items.map((item) => [item.id,
          state.outcomes[item.id] || WRONG_ACT[item.kind]]));
        show('debrief');
        return;
      }
      await afterWrong();
    },
  });

  onRestore(({ done, progress }) => {
    // Only a card the host says was reported, with an outcome the game knows.
    const raw = progress.outcomes && typeof progress.outcomes === 'object' ? progress.outcomes : {};
    state.outcomes = {};
    for (const item of items) {
      const act = raw[item.id];
      if (done.includes(item.id) && ['caught', 'passed', 'none'].includes(act)) { state.outcomes[item.id] = act; }
    }
    if (progress.finished === true && left().length === 0) {
      state.screen = 'done';
      render();
      finish();
      return;
    }
    if (left().length === 0) { show('debrief'); return; }
    render();
  });

  render();
}

if (typeof document !== 'undefined') { boot(); }
