import * as THREE from 'three';

export class BedroomZone {
  constructor(scene) {
    this.scene = scene;
    this.bounds = { minX: 0, maxX: 14, minZ: 0, maxZ: 14 };
  }
}
