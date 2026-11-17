/**
 * Procedural Texture Generator for HyFly-4
 * Generates high-fidelity materials (hardwood parquet, walnut grain, marble, and fabric)
 * without external network image downloads.
 */
import * as THREE from 'three';

export class TextureGenerator {
  static createParquetFloor() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm dark oak
    ctx.fillStyle = '#1e1813';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankWidth = 128;
    const plankHeight = 32;

    for (let y = 0; y < 1024; y += plankHeight) {
      const offsetX = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
      for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
        const px = x + offsetX;

        // Subtle plank tone variation
        const toneJitter = (Math.sin(px * 13 + y * 7) * 0.5 + 0.5);
        const r = Math.floor(32 + toneJitter * 14);
        const g = Math.floor(26 + toneJitter * 11);
        const b = Math.floor(20 + toneJitter * 9);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px + 1, y + 1, plankWidth - 2, plankHeight - 2);

        // Wood grain streaks
        ctx.fillStyle = `rgba(0, 0, 0, 0.12)`;
        for (let i = 0; i < 4; i++) {
          const streakY = y + 4 + i * 7;
          ctx.fillRect(px + 2, streakY, plankWidth - 4, 1);
        }

        // Grout line
        ctx.strokeStyle = '#0d0a08';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 0.5, y + 0.5, plankWidth - 1, plankHeight - 1);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  static createWalnutDesk() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich dark walnut gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#2d1f18');
    grad.addColorStop(0.3, '#3b2a21');
    grad.addColorStop(0.7, '#2f2119');
    grad.addColorStop(1, '#251a14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Fine organic wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      const wave = Math.sin(i * 0.04) * 8 + Math.cos(i * 0.08) * 4;
      ctx.bezierCurveTo(i + wave, 170, i - wave, 340, i + wave * 0.5, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createMarbleCounter() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Soft white-grey porcelain base
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // Natural marble veins
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.18)';
    ctx.lineWidth = 3;
    for (let v = 0; v < 4; v++) {
      ctx.beginPath();
      let startX = v * 120 + 40;
      let startY = 0;
      ctx.moveTo(startX, startY);

      while (startY < 512) {
        startX += (Math.random() - 0.45) * 40;
        startY += 25 + Math.random() * 30;
        ctx.lineTo(startX, startY);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createFabricSofa() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);

    // Cross-weave pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < 256; x += 4) {
      ctx.fillRect(x, 0, 2, 256);
    }
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 256, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }
}
