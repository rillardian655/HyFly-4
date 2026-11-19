import * as THREE from 'three';

export class LivingRoomZone {
  constructor(scene) {
    this.scene = scene;
    this.bounds = { minX: 0, maxX: 14, minZ: -14, maxZ: 0 };
  }
}
