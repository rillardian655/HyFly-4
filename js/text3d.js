/**
 * Elegant Architectural 3D Typography for "XIANLY RUNA"
 * Minimalist Scandinavian & Contemporary Art Gallery Aesthetic.
 * Brushed warm brass and champagne gold lettering on minimalist plaster backplate.
 */
import * as THREE from 'three';

function createLetterShape(char) {
  const s = new THREE.Shape();
  const w = 0.65;
  const h = 0.95;
  const t = 0.16;

  switch (char.toUpperCase()) {
    case 'X':
      s.moveTo(0, 0); s.lineTo(t, 0); s.lineTo(w / 2, h / 2 - t * 0.4); s.lineTo(w - t, 0); s.lineTo(w, 0);
      s.lineTo(w / 2 + t * 0.4, h / 2); s.lineTo(w, h); s.lineTo(w - t, h); s.lineTo(w / 2, h / 2 + t * 0.4);
      s.lineTo(t, h); s.lineTo(0, h); s.lineTo(w / 2 - t * 0.4, h / 2); s.closePath();
      return s;

    case 'I':
      s.moveTo(0.24, 0); s.lineTo(0.24 + t, 0); s.lineTo(0.24 + t, h); s.lineTo(0.24, h); s.closePath();
      return s;

    case 'A':
      s.moveTo(0, 0); s.lineTo(w * 0.35, h); s.lineTo(w * 0.65, h); s.lineTo(w, 0);
      s.lineTo(w - t, 0); s.lineTo(w * 0.72, h * 0.32); s.lineTo(w * 0.28, h * 0.32);
      s.lineTo(t, 0); s.closePath();
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
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelOffset: 0,
    bevelSegments: 4
  };

  // Luxurious Warm Brushed Brass / Champagne Gold
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.32,
    metalness: 0.85
  });

  const letterSpacing = 0.82;
  const spaceWidth = 0.45;
  let totalWidth = 0;

  for (let i = 0; i < text.length; i++) {
    totalWidth += (text[i] === ' ') ? spaceWidth : letterSpacing;
  }

  // Minimalist Warm Beige Plaster Backplate
  const plateWidth = totalWidth + 1.4;
  const plateHeight = 1.7;
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x24201c, // Warm architectural charcoal
    roughness: 0.85,
    metalness: 0.1
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(plateWidth, plateHeight, 0.06), plateMat);
  plate.position.set(0, 0, -0.04);
  plate.receiveShadow = true;
  group.add(plate);

  // Minimalist Slim Brass Trim
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.8 });
  const trimTop = new THREE.Mesh(new THREE.BoxGeometry(plateWidth, 0.02, 0.08), trimMat);
  trimTop.position.set(0, plateHeight / 2, -0.02);
  group.add(trimTop);

  const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(plateWidth, 0.02, 0.08), trimMat);
  trimBottom.position.set(0, -plateHeight / 2, -0.02);
  group.add(trimBottom);

  // Elegant Subtitle: "INTERIOR ARCHITECTURE & DESIGN"
  const subCanvas = document.createElement('canvas');
  subCanvas.width = 512;
  subCanvas.height = 64;
  const sCtx = subCanvas.getContext('2d');
  sCtx.fillStyle = '#24201c';
  sCtx.fillRect(0, 0, 512, 64);
  sCtx.fillStyle = '#d4af37';
  sCtx.font = '500 20px sans-serif';
  sCtx.textAlign = 'center';
  sCtx.fillText('STUDIO & INTERIOR ARCHITECTURE', 256, 40);

  const subTex = new THREE.CanvasTexture(subCanvas);
  const subPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.45),
    new THREE.MeshBasicMaterial({ map: subTex, transparent: true })
  );
  subPlane.position.set(0, -0.58, 0.04);
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

      const mesh = new THREE.Mesh(geo, brassMat);
      mesh.position.set(currentX + 0.32, 0.22, 0.04);
      mesh.castShadow = true;
      group.add(mesh);
    }

    currentX += letterSpacing;
  }

  // Soft warm gallery downlight (warm 3000K incandescent warmth, zero cyber glow!)
  const galleryLight = new THREE.PointLight(0xfff3e0, 1.8, 6.0);
  galleryLight.position.set(0, 1.4, 1.2);
  group.add(galleryLight);

  return group;
}
