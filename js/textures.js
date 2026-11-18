/**
 * Warm & Natural Procedural Textures for HyFly-4
 * Scandinavian & Japandi Aesthetic:
 * Light Oak, Quartz, Linen Bouclé, Framed Gallery Art, and Contact Shadow Decals.
 */
import * as THREE from 'three';

export class TextureGenerator {
  static createNaturalOakFloor() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#c7ab88';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankW = 128;
    const plankH = 32;

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (Math.floor(y / plankH) % 2) * (plankW / 2);
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offsetX;
        const jitter = Math.sin(px * 17 + y * 11) * 0.5 + 0.5;
        const r = Math.floor(198 + jitter * 16);
        const g = Math.floor(168 + jitter * 14);
        const b = Math.floor(134 + jitter * 12);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px + 1, y + 1, plankW - 2, plankH - 2);

        // Wood grain
        ctx.fillStyle = 'rgba(125, 90, 55, 0.1)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(px + 2, y + 5 + i * 7, plankW - 4, 1);
        }

        ctx.strokeStyle = '#a68761';
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

    ctx.fillStyle = '#caa983';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(115, 85, 55, 0.15)';
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

    ctx.fillStyle = '#faf8f4';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(195, 180, 160, 0.16)';
    ctx.lineWidth = 2.5;
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

    ctx.fillStyle = '#eae2d9';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(145, 130, 115, 0.09)';
    for (let x = 0; x < 256; x += 3) ctx.fillRect(x, 0, 1.5, 256);
    for (let y = 0; y < 256; y += 3) ctx.fillRect(0, y, 256, 1.5);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  static createAbstractArt(variant = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Warm minimalist art canvas
    ctx.fillStyle = '#f5ede3';
    ctx.fillRect(0, 0, 512, 700);

    if (variant === 1) {
      // Modern Bauhaus / Japandi Arch & Moon
      ctx.fillStyle = '#c47b59'; // Terracotta circle
      ctx.beginPath();
      ctx.arc(256, 280, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d241e'; // Charcoal arch
      ctx.beginPath();
      ctx.arc(256, 460, 110, Math.PI, 0);
      ctx.lineTo(366, 620);
      ctx.lineTo(146, 620);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d4af37'; // Gold crescent
      ctx.beginPath();
      ctx.arc(220, 240, 45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Scandinavian Organic Botanical Lines
      ctx.fillStyle = '#607255'; // Olive sage oval
      ctx.beginPath();
      ctx.ellipse(256, 380, 150, 220, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#2d241e'; // Elegant line leaf
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(256, 600);
      ctx.quadraticCurveTo(256, 350, 280, 160);
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = 240 + i * 70;
        ctx.moveTo(260, y);
        ctx.quadraticCurveTo(340, y - 40, 390, y - 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(255, y + 25);
        ctx.quadraticCurveTo(180, y - 15, 130, y);
        ctx.stroke();
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  static createFloorContactShadow() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  static createNaturalOakFloorBump() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Neutral gray mid-height
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankW = 128;
    const plankH = 32;

    for (let y = 0; y < 1024; y += plankH) {
      const offsetX = (Math.floor(y / plankH) % 2) * (plankW / 2);
      for (let x = -plankW; x < 1024 + plankW; x += plankW) {
        const px = x + offsetX;
        
        // Deep groove between planks
        ctx.strokeStyle = '#202020';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 0.5, y + 0.5, plankW - 1, plankH - 1);

        // Plank surface grain elevation
        ctx.fillStyle = 'rgba(210, 210, 210, 0.12)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(px + 2, y + 4 + i * 7, plankW - 4, 1.5);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  static createPlasterWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm Japanese/Scandinavian lime plaster base
    ctx.fillStyle = '#f3ede3';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle trowel mottling
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 30 + Math.random() * 60;
      const alpha = 0.03 + Math.random() * 0.04;
      const isWarm = Math.random() > 0.5;

      const grad = ctx.createRadialGradient(x, y, 4, x, y, r);
      grad.addColorStop(0, isWarm ? `rgba(238, 226, 212, ${alpha})` : `rgba(255, 252, 246, ${alpha})`);
      grad.addColorStop(1, 'rgba(243, 237, 227, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Micro-sand grain
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    return tex;
  }

  static createPlasterWallBump() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 24;
      const v = Math.min(255, Math.max(0, 128 + n));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    return tex;
  }

  static createBoucleFabricBump() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#b0b0b0';
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 1;

    for (let y = 4; y < 256; y += 8) {
      for (let x = 4; x < 256; x += 8) {
        const ox = (Math.random() - 0.5) * 3;
        const oy = (Math.random() - 0.5) * 3;
        const r = 2.5 + Math.random() * 1.5;

        ctx.beginPath();
        ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }
}
