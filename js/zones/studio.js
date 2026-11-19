import * as THREE from 'three';

export class StudioZone {
  constructor(scene) {
    this.scene = scene;
    this.bounds = { minX: -14, maxX: 0, minZ: -14, maxZ: 0 };
  }
}
