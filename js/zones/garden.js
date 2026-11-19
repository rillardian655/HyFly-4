import * as THREE from 'three';

export class GardenZone {
  constructor(scene) {
    this.scene = scene;
    this.bounds = { minX: 14, maxX: 22, minZ: -14, maxZ: 0 };
  }

  buildTerrace() {
    const group = new THREE.Group();
    // Slate stone decking
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 14), deckMat);
    deck.position.set(18, -0.1, -7);
    deck.receiveShadow = true;
    group.add(deck);

    // Glass railing perimeter
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.9
    });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 14), glassMat);
    rail.position.set(21.9, 0.55, -7);
    group.add(rail);

    return group;
  }
}
