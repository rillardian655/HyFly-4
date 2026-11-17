/**
 * Main Application Orchestrator for HyFly-4
 */
import { SceneManager } from './scene.js';
import { RoomBuilder } from './room.js';
import { VirtualTerminal } from './terminal.js';
import { UIManager } from './ui.js';
import { soundEngine } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const sceneMgr = new SceneManager(container);
  const roomBuilder = new RoomBuilder(sceneMgr.scene);
  const interactiveObjects = roomBuilder.build();
  sceneMgr.interactiveObjects = interactiveObjects;

  const terminal = new VirtualTerminal();
  const ui = new UIManager(sceneMgr, roomBuilder);

  // Mouse hover detection
  let currentHovered = null;
  window.addEventListener('pointermove', (e) => {
    // Only check if pointer isn't over open dialog or UI panels
    if (document.getElementById('pc-dialog')?.open) return;
    const hit = sceneMgr.checkIntersection(e);
    if (hit) {
      document.body.style.cursor = 'pointer';
      currentHovered = hit;
      ui.updateTooltip(hit.userData.label, e.clientX, e.clientY);
    } else {
      document.body.style.cursor = 'default';
      currentHovered = null;
      ui.updateTooltip(null);
    }
  });

  // Click interaction dispatch
  window.addEventListener('pointerup', (e) => {
    // Avoid triggering when interacting with UI or dragging camera
    if (e.target.closest('.ui-layer') || document.getElementById('pc-dialog')?.open) {
      return;
    }

    const hit = sceneMgr.checkIntersection(e);
    if (!hit) return;

    const action = hit.userData.name;
    switch (action) {
      case 'lamp':
        const state = roomBuilder.toggleLamp();
        soundEngine.playLampClick(state);
        ui.showToast(state ? 'Desk lamp turned on' : 'Desk lamp turned off');
        break;

      case 'radio':
        const isPlaying = soundEngine.toggleMusic();
        ui.updateAudioUI(isPlaying);
        break;

      case 'pc':
        ui.openTerminalDialog();
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

      case 'chair':
        roomBuilder.spinChair();
        ui.showToast('Spun the chair');
        break;
    }
  });

  // Animation Loop
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    roomBuilder.update(clock, soundEngine.isPlayingMusic);
    ui.updateVisualizer();
    sceneMgr.render();
  }

  animate();
});
