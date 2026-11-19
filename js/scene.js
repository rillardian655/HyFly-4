/**
 * Studio & Architectural Scene Manager & PBR Lighting for HyFly-4
 * Features:
 * - Dynamic PMREM Architectural HDRI Environment Map (realistic reflections on floor, glass, metals, counters)
 * - ACESFilmic Tone Mapping with crisp, vibrant color space
 * - High-resolution soft shadow maps with optimized bias (no acne, no Peter-Panning)
 * - Day / Golden Hour Sunset / Deep Starry Night Lighting & Atmosphere
 * - Clean, particle-free, distraction-free architectural aesthetic
 */
import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Lighting & Environment
    this.ambientLight = null;
    this.hemiLight = null;
    this.sunLight = null;
    this.stars = null;
    this.envMap = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];

    this.envMode = 'day';

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa7cbf5);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 150);
    this.camera.position.set(0, 3.2, 5.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.setupLighting();
    this.setupStars();
    this.setupEnvironmentMap('day');
    this.setEnvironmentMode('day');

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Natural ambient fill with balanced contrast
    this.ambientLight = new THREE.AmbientLight(0xfff6ea, 0.45);
    this.scene.add(this.ambientLight);

    // Hemisphere light: soft daylight sky bounce + warm timber floor bounce
    this.hemiLight = new THREE.HemisphereLight(0xbad7f8, 0x6e523b, 0.38);
    this.scene.add(this.hemiLight);

    // Directional Sunlight pouring through skylights and panoramic windows
    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 1.9);
    this.sunLight.position.set(-6, 12, -4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1.0;
    this.sunLight.shadow.camera.far = 40;
    this.sunLight.shadow.camera.left = -11;
    this.sunLight.shadow.camera.right = 11;
    this.sunLight.shadow.camera.top = 11;
    this.sunLight.shadow.camera.bottom = -11;
    this.sunLight.shadow.bias = -0.00015;
    this.sunLight.shadow.normalBias = 0.025;
    this.sunLight.shadow.radius = 2.0;
    this.scene.add(this.sunLight);

    // Architectural downlights (placed at y = 3.2m under ceiling)
    const livingLight = new THREE.PointLight(0xffeedd, 0.85, 12, 2);
    livingLight.position.set(4.5, 3.2, -4.0);
    this.scene.add(livingLight);

    const kitchenLight = new THREE.PointLight(0xfff3e6, 0.85, 12, 2);
    kitchenLight.position.set(-4.5, 3.2, 4.0);
    this.scene.add(kitchenLight);

    const bedroomLight = new THREE.PointLight(0xffe8d6, 0.80, 12, 2);
    bedroomLight.position.set(4.5, 3.2, 4.0);
    this.scene.add(bedroomLight);

    const studioLight = new THREE.PointLight(0xfff5e4, 0.80, 12, 2);
    studioLight.position.set(-4.5, 3.2, -4.0);
    this.scene.add(studioLight);

    const corridorLight = new THREE.PointLight(0xfff0dd, 0.75, 10, 2);
    corridorLight.position.set(0, 3.2, 0);
    this.scene.add(corridorLight);
  }

  setupEnvironmentMap(mode = 'day') {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sky & Ceiling gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 256);
    if (mode === 'day') {
      skyGrad.addColorStop(0, '#c7e0ff');
      skyGrad.addColorStop(0.5, '#f4f6fa');
      skyGrad.addColorStop(1, '#e5e7eb');
    } else if (mode === 'sunset') {
      skyGrad.addColorStop(0, '#ea580c');
      skyGrad.addColorStop(0.4, '#fed7aa');
      skyGrad.addColorStop(1, '#ffedd5');
    } else {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.5, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 256);

    // Softbox studio lighting highlights in reflections
    const drawSoftbox = (cx, cy, rx, ry, color) => {
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, rx);
      g.addColorStop(0, color);
      g.addColorStop(0.6, 'rgba(255, 255, 255, 0.45)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    if (mode === 'day') {
      drawSoftbox(256, 100, 160, 60, '#ffffff');
      drawSoftbox(768, 100, 160, 60, '#fffbeb');
      drawSoftbox(512, 50, 200, 40, '#fef3c7');
    } else if (mode === 'sunset') {
      drawSoftbox(256, 120, 180, 70, '#fbbf24');
      drawSoftbox(768, 120, 180, 70, '#f97316');
    } else {
      drawSoftbox(512, 110, 140, 50, '#38bdf8');
    }

    // Warm floor reflection bounce (lower half)
    const floorGrad = ctx.createLinearGradient(0, 256, 0, 512);
    if (mode === 'night') {
      floorGrad.addColorStop(0, '#2d241c');
      floorGrad.addColorStop(1, '#110d0a');
    } else {
      floorGrad.addColorStop(0, '#cda77d');
      floorGrad.addColorStop(0.5, '#ab8256');
      floorGrad.addColorStop(1, '#785635');
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 256, 1024, 256);

    // Subtle horizon transition
    ctx.fillStyle = (mode === 'night') ? 'rgba(50, 40, 30, 0.4)' : 'rgba(220, 205, 190, 0.4)';
    ctx.fillRect(0, 250, 1024, 12);

    const envTexture = new THREE.CanvasTexture(canvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;

    if (this.envMap) {
      this.envMap.dispose();
    }
    this.envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    this.scene.environment = this.envMap;

    pmremGenerator.dispose();
    envTexture.dispose();
  }

  setupStars() {
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 12 + Math.random() * 25;
      positions[i * 3 + 2] = -25 - Math.random() * 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  setEnvironmentMode(mode) {
    this.envMode = mode;
    this.setupEnvironmentMap(mode);

    switch (mode) {
      case 'day':
        this.scene.background.setHex(0xa7cbf5); // Natural bright sky
        this.ambientLight.color.setHex(0xfff6ea);
        this.ambientLight.intensity = 0.45;
        if (this.hemiLight) this.hemiLight.intensity = 0.38;
        this.sunLight.color.setHex(0xfff8ee);
        this.sunLight.intensity = 1.9;
        this.renderer.toneMappingExposure = 1.0;
        if (this.stars) this.stars.visible = false;
        break;

      case 'sunset':
        this.scene.background.setHex(0xf97316); // Golden hour sunset
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.40;
        if (this.hemiLight) this.hemiLight.intensity = 0.32;
        this.sunLight.color.setHex(0xfb923c);
        this.sunLight.intensity = 1.6;
        this.renderer.toneMappingExposure = 1.05;
        if (this.stars) this.stars.visible = false;
        break;

      case 'night':
      default:
        this.scene.background.setHex(0x0a101d); // Deep starry night
        this.ambientLight.color.setHex(0x384152);
        this.ambientLight.intensity = 0.28;
        if (this.hemiLight) this.hemiLight.intensity = 0.18;
        this.sunLight.color.setHex(0x94a3b8);
        this.sunLight.intensity = 0.45;
        this.renderer.toneMappingExposure = 1.10;
        if (this.stars) this.stars.visible = true;
        break;
    }
    return this.envMode;
  }

  toggleWeather() {
    this.weather = (this.weather === 'rain') ? 'clear' : 'rain';
    if (this.weather === 'rain') {
      this.scene.background.setHex(0x374151);
      this.ambientLight.intensity = 0.25;
      this.sunLight.intensity = 0.6;
    } else {
      this.setEnvironmentMode(this.envMode);
    }
    return this.weather;
  }

  cycleEnvironment() {
    const modes = ['day', 'sunset', 'night'];
    const nextIdx = (modes.indexOf(this.envMode) + 1) % modes.length;
    return this.setEnvironmentMode(modes[nextIdx]);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  checkIntersection(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && !target.userData.interactive) {
        target = target.parent;
      }
      return target && target.userData.interactive ? target : null;
    }
    return null;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
