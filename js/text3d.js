/**
 * 3D Text Generator for "XIANLY RUNA"
 * Uses procedural 3D box glyphs to render crisp extruded 3D neon letters
 * with zero font asset loading dependencies.
 */
import * as THREE from 'three';

export function create3DNameBanner(text = "XIANLY RUNA", position = new THREE.Vector3(0, 5.5, -9.8)) {
  const group = new THREE.Group();
  group.position.copy(position);

  // 5x5 Grid definitions for each letter
  const glyphs = {
    'X': [
      "10001",
      "01010",
      "00100",
      "01010",
      "10001"
    ],
    'I': [
      "11111",
      "00100",
      "00100",
      "00100",
      "11111"
    ],
    'A': [
      "01110",
      "10001",
      "11111",
      "10001",
      "10001"
    ],
    'N': [
      "10001",
      "11001",
      "10101",
      "10011",
      "10001"
    ],
    'L': [
      "10000",
      "10000",
      "10000",
      "10000",
      "11111"
    ],
    'Y': [
      "10001",
      "01010",
      "00100",
      "00100",
      "00100"
    ],
    ' ': [
      "00000",
      "00000",
      "00000",
      "00000",
      "00000"
    ],
    'R': [
      "11110",
      "10001",
      "11110",
      "10010",
      "10001"
    ],
    'U': [
      "10001",
      "10001",
      "10001",
      "10001",
      "01110"
    ]
  };

  const blockGeo = new THREE.BoxGeometry(0.12, 0.12, 0.14);
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  });

  const letterMatAccent = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.8
  });

  const letterWidth = 5 * 0.13;
  const letterSpacing = 0.25;
  const totalLength = text.length * (letterWidth + letterSpacing);
  let cursorX = -totalLength / 2;

  // Backdrop plaque
  const plaqueGeo = new THREE.BoxGeometry(totalLength + 1.2, 1.4, 0.08);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0x0a0f1d,
    roughness: 0.6,
    metalness: 0.3
  });
  const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaque.position.set(0, 0, -0.06);
  plaque.receiveShadow = true;
  group.add(plaque);

  // Border glow frame
  const frameGeo = new THREE.BoxGeometry(totalLength + 1.3, 1.5, 0.04);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0, -0.04);
  group.add(frame);

  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    const map = glyphs[char] || glyphs[' '];
    const isSecondWord = i >= 7; // Accent color for 'RUNA'
    const mat = isSecondWord ? letterMatAccent : letterMat;

    if (char !== ' ') {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (map[row][col] === '1') {
            const block = new THREE.Mesh(blockGeo, mat);
            block.position.set(
              cursorX + col * 0.13,
              (4 - row) * 0.13 - 0.26,
              0.05
            );
            block.castShadow = true;
            group.add(block);
          }
        }
      }
    }
    cursorX += letterWidth + letterSpacing;
  }

  // Neon accent light for the name
  const neonLight = new THREE.PointLight(0x38bdf8, 1.4, 6);
  neonLight.position.set(-1.5, 0.2, 0.8);
  group.add(neonLight);

  const neonLight2 = new THREE.PointLight(0xf59e0b, 1.4, 6);
  neonLight2.position.set(1.5, 0.2, 0.8);
  group.add(neonLight2);

  return group;
}

