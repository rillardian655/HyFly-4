/**
 * High-End Atmospheric Scene Manager & Lighting for HyFly-4
 * Features:
 * - Natural Scandinavian & Japandi contemporary lighting scheme
 * - ACESFilmic Tone Mapping with balanced warm exposure
 * - Volumetric Sunlight Shafts (God Rays from skylights & panoramic windows)
 * - Atmospheric Floating Dust Motes (Golden sunlit specks drifting in 3D air)
 * - Day / Golden Hour Sunset / Cozy Night Environment Cycles
 * - 100% Native, reliable WebGL rendering without post-processing failure modes
 */
import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Lighting & Atmosphere
    this.ambientLight = null;
    this.hemiLight = null;
    this.sunLight = null;
    this.stars = null;
    this.dustParticles = null;
    this.dustBasePos = null;
    this.lightBeams = [];
    this.beamMat = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];

    this.envMode = 'day';

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd);

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
    this.renderer.toneMappingExposure = 1.08;

    this.setupLighting();
    this.setupStars();
    this.setupAtmosphericDust();
    this.setupSunlightShafts();
    this.setEnvironmentMode('day');

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Warm natural ambient bounce
    this.ambientLight = new THREE.AmbientLight(0xfff6ec, 0.85);
    this.scene.add(this.ambientLight);

    // Hemisphere light: soft warm sky and natural timber floor reflection (keeps character luminous)
    this.hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x8a7b6a, 0.72);
    this.scene.add(this.hemiLight);

    // Directional Sunlight pouring through skylights and panoramic south/east windows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
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
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Warm interior ceiling downlights (placed at y = 3.2m under the 3.4m ceiling)
    const livingLight = new THREE.PointLight(0xffeedd, 1.1, 12);
    livingLight.position.set(4.5, 3.2, -4.0);
    this.scene.add(livingLight);

    const kitchenLight = new THREE.PointLight(0xfff3e6, 1.1, 12);
    kitchenLight.position.set(-4.5, 3.2, 4.0);
    this.scene.add(kitchenLight);

    const bedroomLight = new THREE.PointLight(0xffe8d6, 1.0, 12);
    bedroomLight.position.set(4.5, 3.2, 4.0);
    this.scene.add(bedroomLight);

    const studioLight = new THREE.PointLight(0xfff5e4, 1.0, 12);
    studioLight.position.set(-4.5, 3.2, -4.0);
    this.scene.add(studioLight);

    const corridorLight = new THREE.PointLight(0xfff0dd, 0.9, 10);
    corridorLight.position.set(0, 3.2, 0);
    this.scene.add(corridorLight);
  }

  setupAtmosphericDust() {
    const count = 420;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    this.dustBasePos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16.5;
      const y = 0.25 + Math.random() * 3.0;
      const z = (Math.random() - 0.5) * 16.5;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      this.dustBasePos[i * 3] = x;
      this.dustBasePos[i * 3 + 1] = y;
      this.dustBasePos[i * 3 + 2] = z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    // Circular glowing particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 250, 230, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 235, 190, 0.65)');
    grad.addColorStop(1, 'rgba(255, 220, 150, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const dustTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      map: dustTex,
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  setupSunlightShafts() {
    this.lightBeams = [];

    // Smooth volumetric light gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255, 252, 235, 0.42)');
    grad.addColorStop(0.2, 'rgba(255, 245, 215, 0.30)');
    grad.addColorStop(0.7, 'rgba(255, 240, 200, 0.10)');
    grad.addColorStop(1, 'rgba(255, 235, 190, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
    const beamTex = new THREE.CanvasTexture(canvas);

    this.beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const createShaft = (x, z, angleX, angleZ, width, length) => {
      const group = new THREE.Group();
      group.position.set(x, 3.35, z);

      for (let rot = 0; rot < 2; rot++) {
        const geo = new THREE.PlaneGeometry(width, length);
        geo.translate(0, -length / 2, 0);
        const mesh = new THREE.Mesh(geo, this.beamMat);
        mesh.rotation.x = angleX;
        mesh.rotation.z = angleZ;
        mesh.rotation.y = rot * (Math.PI / 2);
        group.add(mesh);
      }

      this.scene.add(group);
      this.lightBeams.push(group);
    };

    // 1. Kitchen Skylight Beam
    createShaft(-5.5, 0, 0.20, -0.14, 3.4, 3.6);
    // 2. Living Room Skylight Beam
    createShaft(5.5, 0, 0.20, 0.14, 3.4, 3.6);
    // 3. Studio North Window Beam
    createShaft(-4.5, -8.7, -0.42, 0.10, 3.0, 3.5);
    // 4. Living Room North Window Beam
    createShaft(4.5, -8.7, -0.42, -0.10, 3.0, 3.5);
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
    switch (mode) {
      case 'day':
        this.scene.background.setHex(0x93c5fd); // Soft natural sky blue
        this.ambientLight.color.setHex(0xfff8ee);
        this.ambientLight.intensity = 0.85;
        if (this.hemiLight) this.hemiLight.intensity = 0.72;
        this.sunLight.color.setHex(0xfffaed);
        this.sunLight.intensity = 2.2;
        if (this.stars) this.stars.visible = false;
        if (this.beamMat) this.beamMat.color.setHex(0xfff5dd);
        if (this.dustParticles) this.dustParticles.material.color.setHex(0xfff0db);
        break;

      case 'sunset':
        this.scene.background.setHex(0xf97316); // Golden hour sunset
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.72;
        if (this.hemiLight) this.hemiLight.intensity = 0.55;
        this.sunLight.color.setHex(0xfb923c);
        this.sunLight.intensity = 1.85;
        if (this.stars) this.stars.visible = false;
        if (this.beamMat) this.beamMat.color.setHex(0xfb923c);
        if (this.dustParticles) this.dustParticles.material.color.setHex(0xfed7aa);
        break;

      case 'night':
      default:
        this.scene.background.setHex(0x0a101d); // Deep starry night
        this.ambientLight.color.setHex(0x334155);
        this.ambientLight.intensity = 0.42;
        if (this.hemiLight) this.hemiLight.intensity = 0.25;
        this.sunLight.color.setHex(0x94a3b8);
        this.sunLight.intensity = 0.55;
        if (this.stars) this.stars.visible = true;
        if (this.beamMat) this.beamMat.color.setHex(0x60a5fa);
        if (this.dustParticles) this.dustParticles.material.color.setHex(0x93c5fd);
        break;
    }
    return this.envMode;
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

  updateAtmosphere(clock = 0) {
    // 1. Gently animate floating dust motes in 3D air
    if (this.dustParticles && this.dustBasePos) {
      const attr = this.dustParticles.geometry.attributes.position;
      const arr = attr.array;
      const count = arr.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        arr[i3] = this.dustBasePos[i3] + Math.sin(clock * 0.35 + i) * 0.12;
        arr[i3 + 1] = this.dustBasePos[i3 + 1] + Math.sin(clock * 0.55 + i * 1.4) * 0.08;
        arr[i3 + 2] = this.dustBasePos[i3 + 2] + Math.cos(clock * 0.30 + i) * 0.12;
      }
      attr.needsUpdate = true;
    }

    // 2. Subtle shimmer on sunlight shafts
    if (this.beamMat) {
      const baseOpacity = (this.envMode === 'day') ? 0.20 : (this.envMode === 'sunset' ? 0.26 : 0.06);
      this.beamMat.opacity = baseOpacity + Math.sin(clock * 1.6) * 0.025;
    }
  }

  render(clock = 0) {
    this.updateAtmosphere(clock);
    this.renderer.render(this.scene, this.camera);
  }
}
