import * as THREE from 'three';

export class KitchenZone {
  constructor(scene) {
    this.scene = scene;
    this.bounds = { minX: -14, maxX: 0, minZ: 0, maxZ: 14 };
  }
}
