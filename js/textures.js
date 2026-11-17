/**
 * Warm & Natural Procedural Textures for HyFly-4
 * Natural Scandinavian & Japandi Aesthetic: Light Oak, White Quartz, Bouclé Linen
 */
import * as THREE from 'three';

export class TextureGenerator {
  static createNaturalOakFloor() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Warm natural scandinavian oak base
    ctx.fillStyle = '#bfa17c';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankW = 128;
    const plankH = 32;

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (Math.floor(y / plankH) % 2) * (plankW / 2);
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offsetX;

        const jitter = Math.sin(px * 17 + y * 11) * 0.5 + 0.5;
        const r = Math.floor(190 + jitter * 18);
        const g = Math.floor(160 + jitter * 15);
        const b = Math.floor(125 + jitter * 12);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px + 1, y + 1, plankW - 2, plankH - 2);

        // Soft natural wood grain
        ctx.fillStyle = 'rgba(120, 85, 50, 0.12)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(px + 2, y + 5 + i * 7, plankW - 4, 1);
        }

        // Soft seams
        ctx.strokeStyle = '#9c7d58';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, y + 0.5, plankW - 1, plankH - 1);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  static createNaturalWoodDesk() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm natural oak table surface
    ctx.fillStyle = '#c8a882';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(110, 80, 50, 0.14)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 512; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      const curve = Math.sin(i * 0.03) * 6 + Math.cos(i * 0.05) * 3;
      ctx.bezierCurveTo(i + curve, 170, i - curve, 340, i + curve * 0.5, 512);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createQuartzCounter() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm alabaster / clean warm white quartz
    ctx.fillStyle = '#f8f6f0';
    ctx.fillRect(0, 0, 512, 512);

    // Very subtle warm beige micro-veins
    ctx.strokeStyle = 'rgba(180, 165, 145, 0.15)';
    ctx.lineWidth = 2;
    for (let v = 0; v < 3; v++) {
      ctx.beginPath();
      let sx = v * 160 + 50;
      let sy = 0;
      ctx.moveTo(sx, sy);
      while (sy < 512) {
        sx += (Math.random() - 0.48) * 30;
        sy += 30 + Math.random() * 25;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createLinenFabric() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Cozy oatmeal / warm cream linen
    ctx.fillStyle = '#e8dfd5';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(150, 135, 120, 0.08)';
    for (let x = 0; x < 256; x += 3) ctx.fillRect(x, 0, 1.5, 256);
    for (let y = 0; y < 256; y += 3) ctx.fillRect(0, y, 256, 1.5);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }
}
