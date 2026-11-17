/**
 * Audio Engine for HyFly-4 Virtual Workspace
 * Procedural Lo-Fi Chords & Web Audio Synthesizer
 * 100% self-contained without external audio files.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.analyser = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.noiseNode = null;
    this.stepTimer = null;
    this.currentChordIndex = 0;

    // Chord progressions in frequency (Hz)
    // Progression 1: Fmaj7 - Em7 - Dm7 - Cmaj7
    // Progression 2: Dm9 - G13 - Cmaj9 - Am9
    this.progressions = [
      [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [164.81, 196.00, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.00, 261.63], // Dm7
        [130.81, 164.81, 196.00, 246.94]  // Cmaj7
      ],
      [
        [146.83, 220.00, 261.63, 329.63, 370.00], // Dm9
        [196.00, 246.94, 329.63, 392.00],         // G13
        [130.81, 196.00, 246.94, 293.66, 392.00], // Cmaj9
        [110.00, 164.81, 196.00, 261.63, 329.63]  // Am9
      ]
    ];
    this.currentProgressionIndex = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.initVinylCrackle();
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initVinylCrackle() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      let crackle = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 0.4 : 0;
      output[i] = white * 0.015 + crackle;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.musicGain);

    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  toggleMusic() {
    this.ensureContext();
    if (this.isPlayingMusic) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isPlayingMusic;
  }

  startMusic() {
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.currentChordIndex = 0;
    this.playChordStep();
    this.stepTimer = setInterval(() => {
      this.playChordStep();
    }, 3800);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  playChordStep() {
    if (!this.ctx || !this.isPlayingMusic) return;
    const prog = this.progressions[this.currentProgressionIndex];
    const chord = prog[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % prog.length;

    const now = this.ctx.currentTime;
    const duration = 3.6;

    // Filtered lowpass bus for warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 1.5);
    filter.frequency.exponentialRampToValueAtTime(550, now + duration);
    filter.connect(this.musicGain);

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle LFO vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(3.5, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      // Envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.35 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now + idx * 0.04);
      osc.stop(now + duration);
    });

    // Sub-bass kick accent
    if (this.currentChordIndex === 1 || this.currentChordIndex === 3) {
      this.playSubKick(now);
    }
  }

  playSubKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.3);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  switchTrack() {
    this.currentProgressionIndex = (this.currentProgressionIndex + 1) % this.progressions.length;
    this.currentChordIndex = 0;
    if (this.isPlayingMusic) {
      this.playChordStep();
    }
    return this.currentProgressionIndex;
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Sound FX
  playLampClick(isTurnedOn) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTurnedOn ? 880 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(isTurnedOn ? 1320 : 330, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playKeyClick() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playMugSip() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playChime() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.08, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(8);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const soundEngine = new SoundEngine();
