/**
 * Vector-Extruded 3D Typography for "XIANLY RUNA"
 * Uses smooth 2D vector shapes extruded with beveled edges and neon materials.
 * Sleek designer look without blocky grid voxels.
 */
import * as THREE from 'three';

function createLetterShape(char) {
  const s = new THREE.Shape();
  const w = 0.65;
  const h = 0.95;
  const t = 0.16; // stroke thickness

  switch (char.toUpperCase()) {
    case 'X':
      // Diagonal 1
      s.moveTo(0, 0); s.lineTo(t, 0); s.lineTo(w, h); s.lineTo(w - t, h); s.closePath();
      // Diagonal 2 as separate path or single shape
      const sX = new THREE.Shape();
      sX.moveTo(0, 0); sX.lineTo(t, 0); sX.lineTo(w / 2, h / 2 - t * 0.4); sX.lineTo(w - t, 0); sX.lineTo(w, 0);
      sX.lineTo(w / 2 + t * 0.4, h / 2); sX.lineTo(w, h); sX.lineTo(w - t, h); sX.lineTo(w / 2, h / 2 + t * 0.4);
      sX.lineTo(t, h); sX.lineTo(0, h); sX.lineTo(w / 2 - t * 0.4, h / 2); sX.closePath();
      return sX;

    case 'I':
      s.moveTo(0.24, 0); s.lineTo(0.24 + t, 0); s.lineTo(0.24 + t, h); s.lineTo(0.24, h); s.closePath();
      return s;

    case 'A':
      s.moveTo(0, 0); s.lineTo(w * 0.35, h); s.lineTo(w * 0.65, h); s.lineTo(w, 0);
      s.lineTo(w - t, 0); s.lineTo(w * 0.72, h * 0.32); s.lineTo(w * 0.28, h * 0.32);
      s.lineTo(t, 0); s.closePath();
      // Triangle hole
      const holeA = new THREE.Path();
      holeA.moveTo(w * 0.34, h * 0.46); holeA.lineTo(w * 0.66, h * 0.46); holeA.lineTo(w * 0.5, h * 0.82); holeA.closePath();
      s.holes.push(holeA);
      return s;

    case 'N':
      s.moveTo(0, 0); s.lineTo(t, 0); s.lineTo(t, h * 0.65); s.lineTo(w - t, 0);
      s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(w - t, h); s.lineTo(w - t, h * 0.35);
      s.lineTo(t, h); s.lineTo(0, h); s.closePath();
      return s;

    case 'L':
      s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, t); s.lineTo(t, t); s.lineTo(t, h); s.lineTo(0, h); s.closePath();
      return s;

    case 'Y':
      s.moveTo(w / 2 - t / 2, 0); s.lineTo(w / 2 + t / 2, 0); s.lineTo(w / 2 + t / 2, h * 0.48);
      s.lineTo(w, h); s.lineTo(w - t * 1.1, h); s.lineTo(w / 2, h * 0.58);
      s.lineTo(t * 1.1, h); s.lineTo(0, h); s.lineTo(w / 2 - t / 2, h * 0.48); s.closePath();
      return s;

    case 'R':
      s.moveTo(0, 0); s.lineTo(t, 0); s.lineTo(t, h * 0.44); s.lineTo(w * 0.5, h * 0.44);
      s.lineTo(w - t * 0.3, 0); s.lineTo(w, 0); s.lineTo(w * 0.58, h * 0.48);
      s.absarc(w * 0.48, h * 0.72, h * 0.24, -Math.PI / 2, Math.PI / 2, false);
      s.lineTo(0, h); s.closePath();

      const holeR = new THREE.Path();
      holeR.moveTo(t, h * 0.56); holeR.lineTo(w * 0.45, h * 0.56);
      holeR.absarc(w * 0.45, h * 0.72, h * 0.13, -Math.PI / 2, Math.PI / 2, false);
      holeR.lineTo(t, h * 0.85); holeR.closePath();
      s.holes.push(holeR);
      return s;

    case 'U':
      s.moveTo(0, h); s.lineTo(t, h); s.lineTo(t, h * 0.32);
      s.absarc(w / 2, h * 0.32, w / 2 - t, Math.PI, 0, true);
      s.lineTo(w, h); s.lineTo(w - t, h); s.lineTo(w - t, h * 0.32);
      s.absarc(w / 2, h * 0.32, w / 2, 0, Math.PI, false);
      s.closePath();
      return s;

    default:
      return null;
  }
}

export function create3DNameBanner(text = "XIANLY RUNA", position = new THREE.Vector3(0, 5.2, 0)) {
  const group = new THREE.Group();
  group.position.copy(position);

  const extrudeSettings = {
    steps: 1,
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4
  };

  // Sleek Metallic Cyber Cyan for XIANLY
  const cyanMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15
  });

  // Sleek Metallic Amber Gold for RUNA
  const amberMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15
  });

  // Calculate length and layout
  const letterSpacing = 0.85;
  const spaceWidth = 0.5;
  let totalWidth = 0;

  for (let i = 0; i < text.length; i++) {
    totalWidth += (text[i] === ' ') ? spaceWidth : letterSpacing;
  }

  // Floating Brushed Dark Steel Backplate
  const plateWidth = totalWidth + 1.2;
  const plateHeight = 1.8;
  const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, 0.08);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e17,
    metalness: 0.9,
    roughness: 0.35
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, 0, -0.05);
  plate.receiveShadow = true;
  group.add(plate);

  // Slim glowing edge trim
  const trimGeo = new THREE.BoxGeometry(plateWidth + 0.06, plateHeight + 0.06, 0.04);
  const trimMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.set(0, 0, -0.06);
  group.add(trim);

  // Subtitle plaque: "ARCHITECT & LEAD DEV"
  const subCanvas = document.createElement('canvas');
  subCanvas.width = 512;
  subCanvas.height = 64;
  const sCtx = subCanvas.getContext('2d');
  sCtx.fillStyle = '#0a0e17';
  sCtx.fillRect(0, 0, 512, 64);
  sCtx.fillStyle = '#38bdf8';
  sCtx.font = 'bold 22px monospace';
  sCtx.textAlign = 'center';
  sCtx.fillText('— LEAD ARCHITECT & CREATOR —', 256, 42);

  const subTex = new THREE.CanvasTexture(subCanvas);
  const subPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.45),
    new THREE.MeshBasicMaterial({ map: subTex, transparent: true })
  );
  subPlane.position.set(0, -0.65, 0.04);
  group.add(subPlane);

  let currentX = -totalWidth / 2;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += spaceWidth;
      continue;
    }

    const shape = createLetterShape(char);
    if (shape) {
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();

      const mat = (i >= 7) ? amberMat : cyanMat;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(currentX + 0.32, 0.2, 0.05);
      mesh.castShadow = true;
      group.add(mesh);
    }

    currentX += letterSpacing;
  }

  // Spotlights for dramatic illumination
  const lightCyan = new THREE.PointLight(0x38bdf8, 2.2, 7);
  lightCyan.position.set(-2.2, 0.4, 0.9);
  group.add(lightCyan);

  const lightAmber = new THREE.PointLight(0xf59e0b, 2.2, 7);
  lightAmber.position.set(2.2, 0.4, 0.9);
  group.add(lightAmber);

  return group;
}
