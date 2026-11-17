/**
 * Main Application Orchestrator for HyFly-4
 * Multi-Room House Exploration Game & 3D Interactive Hub
 */
import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { HouseBuilder } from './house.js';
import { PlayerController } from './player.js';
import { VirtualTerminal } from './terminal.js';
import { UIManager } from './ui.js';
import { soundEngine } from './audio.js';

function initApp() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error('Canvas #webgl-canvas element not found');
    return;
  }

  let sceneMgr;
  try {
    sceneMgr = new SceneManager(canvas);
  } catch (err) {
    console.error('Error initializing SceneManager / WebGL:', err);
    return;
  }

  // Build the whole house
  const houseBuilder = new HouseBuilder(sceneMgr.scene);
  const houseData = houseBuilder.build();
  sceneMgr.interactiveObjects = houseData.interactive;

  // Initialize Player Character
  const player = new PlayerController(sceneMgr.scene, sceneMgr.camera, canvas);
  player.colliders = houseData.colliders;

  // Initial player starting location (Central Corridor near the 3D name banner)
  player.position.set(1.5, 0, 1.5);

  const terminal = new VirtualTerminal();
  const ui = new UIManager(sceneMgr, houseBuilder);

  // Proximity interaction state
  let nearbyObject = null;
  const promptEl = document.getElementById('interaction-prompt');
  const worldPos = new THREE.Vector3();

  function checkProximity() {
    let closestObj = null;
    let closestDist = 3.2;

    for (const obj of houseData.interactive) {
      obj.getWorldPosition(worldPos);
      const dist = player.position.distanceTo(worldPos);
      if (dist < closestDist) {
        closestDist = dist;
        closestObj = obj;
      }
    }

    nearbyObject = closestObj;
    if (promptEl) {
      if (nearbyObject && !document.getElementById('pc-dialog')?.open) {
        promptEl.textContent = `[E] ${nearbyObject.userData.label || 'Interact'}`;
        promptEl.classList.add('visible');
      } else {
        promptEl.classList.remove('visible');
      }
    }
  }

  function triggerInteraction(obj) {
    if (!obj) return;
    const action = obj.userData.name;

    switch (action) {
      case 'lamp':
        const lampState = houseBuilder.toggleLamp();
        soundEngine.playLampClick(lampState);
        ui.showToast(lampState ? 'Desk lamp turned on' : 'Desk lamp turned off');
        break;

      case 'floor_lamp':
        const flState = houseBuilder.toggleFloorLamp();
        soundEngine.playLampClick(flState);
        ui.showToast(flState ? 'Living room standing lamp turned on' : 'Standing lamp turned off');
        break;

      case 'radio':
        const isPlaying = soundEngine.toggleMusic();
        ui.updateAudioUI(isPlaying);
        break;

      case 'pc':
        ui.openTerminalDialog();
        break;

      case 'tv':
        const ch = houseBuilder.toggleTV();
        soundEngine.playChime();
        ui.showToast(`TV Switched to Channel 0${ch + 1}`);
        break;

      case 'fridge':
        const isOpen = houseBuilder.toggleFridge();
        soundEngine.playMugSip();
        ui.showToast(isOpen ? 'Opened refrigerator: Grabbed an iced matcha latte' : 'Closed refrigerator');
        break;

      case 'stove':
        const flameOn = houseBuilder.toggleStove();
        soundEngine.playLampClick(flameOn);
        ui.showToast(flameOn ? 'Kitchen stove ignited (Blue cooking flame)' : 'Kitchen stove turned off');
        break;

      case 'sofa':
        soundEngine.playChime();
        ui.showToast('Relaxed on the living room sofa');
        break;

      case 'bed':
        soundEngine.playChime();
        ui.showToast('Rested comfortably on the platform bed');
        break;

      case 'window':
        const mode = sceneMgr.cycleEnvironment();
        soundEngine.playChime();
        const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);
        if (ui.envBtn) ui.envBtn.textContent = `Sky: ${modeLabel}`;
        ui.showToast(`Switched to ${modeLabel} view`);
        break;

      case 'coffee':
        soundEngine.playMugSip();
        ui.showToast('Took a warm sip of coffee');
        break;
    }
  }

  // Key 'E' triggers proximity interaction
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') {
      if (nearbyObject && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        triggerInteraction(nearbyObject);
      }
    }
  });

  // Direct Click interaction
  window.addEventListener('pointerup', (e) => {
    if (e.target.closest('.ui-layer') || document.getElementById('pc-dialog')?.open) {
      return;
    }
    const hit = sceneMgr.checkIntersection(e);
    if (hit) {
      triggerInteraction(hit);
    }
  });

  // Hover detection
  window.addEventListener('pointermove', (e) => {
    if (document.getElementById('pc-dialog')?.open) return;
    const hit = sceneMgr.checkIntersection(e);
    if (hit) {
      document.body.style.cursor = 'pointer';
      ui.updateTooltip(hit.userData.label, e.clientX, e.clientY);
    } else {
      document.body.style.cursor = 'default';
      ui.updateTooltip(null);
    }
  });

  // Main Loop
  let lastTime = performance.now();
  let clock = 0;

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    clock += dt;

    player.update(dt);
    checkProximity();
    houseBuilder.update(clock, soundEngine.isPlayingMusic);
    ui.updateVisualizer();
    sceneMgr.render();
  }

  requestAnimationFrame(animate);
}

// Ensure execution whether loaded before or after DOMContentLoaded
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
