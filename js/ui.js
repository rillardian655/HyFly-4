/**
 * UI Manager & Modern Web Guidelines Integration for HyFly-4
 */
import { soundEngine } from './audio.js';

export class UIManager {
  constructor(sceneMgr, roomBuilder) {
    this.sceneMgr = sceneMgr;
    this.roomBuilder = roomBuilder;

    this.tooltipEl = document.getElementById('hover-tooltip');
    this.toastContainer = document.getElementById('toast-container');
    this.dialogEl = document.getElementById('pc-dialog');
    this.audioBtn = document.getElementById('btn-audio');
    this.envBtn = document.getElementById('btn-env');
    this.muteBtn = document.getElementById('btn-mute');
    this.resetCamBtn = document.getElementById('btn-reset-cam');
    this.statusTextEl = document.getElementById('audio-track-name');
    this.visualizerBars = document.querySelectorAll('.visualizer-bar');

    this.initDialog();
    this.initButtons();
    this.initTabs();
  }

  initDialog() {
    if (!this.dialogEl) return;

    // Light dismiss fallback according to modern-web-guidance
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      this.dialogEl.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, this.dialogEl);
      });
      this.dialogEl.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, this.dialogEl)) {
          this.dialogEl.close();
        }
      });
    }

    this.dialogEl.addEventListener('close', () => {
      this.dialogEl.returnValue = '';
    });
  }

  openTerminalDialog() {
    if (!this.dialogEl) return;
    if (typeof this.dialogEl.showModal === 'function') {
      if (!this.dialogEl.open) {
        this.dialogEl.showModal();
        const input = document.getElementById('terminal-input');
        if (input) input.focus();
      }
    }
  }

  initButtons() {
    // Audio button
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', () => {
        const playing = soundEngine.toggleMusic();
        this.updateAudioUI(playing);
      });
    }

    // Mute button
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        const muted = soundEngine.toggleMute();
        this.muteBtn.textContent = muted ? 'Unmute' : 'Mute';
        this.showToast(muted ? 'Audio Muted' : 'Audio Unmuted');
      });
    }

    // Environment mode button
    if (this.envBtn) {
      this.envBtn.addEventListener('click', () => {
        const mode = this.sceneMgr.cycleEnvironment();
        soundEngine.playChime();
        const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);
        this.envBtn.textContent = `Sky: ${modeLabel}`;
        this.showToast(`Environment switched to ${modeLabel} mode`);
      });
    }

    // Reset camera button
    if (this.resetCamBtn) {
      this.resetCamBtn.addEventListener('click', () => {
        this.sceneMgr.resetCamera();
        this.showToast('Camera angle reset to workspace view');
      });
    }
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = {
      'terminal': document.getElementById('tab-terminal'),
      'notes': document.getElementById('tab-notes'),
      'specs': document.getElementById('tab-specs')
    };

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        Object.keys(tabPanels).forEach(key => {
          if (tabPanels[key]) {
            tabPanels[key].style.display = (key === targetTab) ? 'block' : 'none';
          }
        });

        if (targetTab === 'terminal') {
          const input = document.getElementById('terminal-input');
          if (input) input.focus();
        }
      });
    });
  }

  updateAudioUI(playing) {
    if (this.audioBtn) {
      this.audioBtn.classList.toggle('active', playing);
      this.audioBtn.textContent = playing ? 'Lo-Fi: Playing' : 'Lo-Fi: Paused';
    }
    if (this.statusTextEl) {
      this.statusTextEl.textContent = playing ? 'Track #1 - Midnight Code' : 'Audio Off';
    }
    this.showToast(playing ? 'Lo-Fi generative chords active' : 'Lo-Fi audio paused');
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  updateTooltip(text, x, y) {
    if (!this.tooltipEl) return;
    if (text) {
      this.tooltipEl.textContent = text;
      this.tooltipEl.style.left = `${x + 15}px`;
      this.tooltipEl.style.top = `${y + 15}px`;
      this.tooltipEl.classList.add('visible');
    } else {
      this.tooltipEl.classList.remove('visible');
    }
  }

  updateVisualizer() {
    if (!soundEngine.isPlayingMusic) {
      this.visualizerBars.forEach(bar => { bar.style.height = '3px'; });
      return;
    }

    const freqData = soundEngine.getFrequencyData();
    this.visualizerBars.forEach((bar, i) => {
      const val = freqData[i * 2] || 0;
      const h = Math.max(3, Math.min(14, (val / 255) * 14));
      bar.style.height = `${h}px`;
    });
  }
}
