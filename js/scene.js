/**
 * Natural Warm Scene Manager & Lighting for HyFly-4
 * Scandinavian & Japandi contemporary lighting scheme.
 */
import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.ambientLight = null;
    this.sunLight = null;
    this.stars = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];

    this.envMode = 'day'; // Default to a gorgeous warm bright day!

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbde0fe);

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
    this.renderer.toneMappingExposure = 1.05;

    this.setupLighting();
    this.setupStars();
    this.setEnvironmentMode('day');

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Warm natural ambient bounce & skylight illumination
    this.ambientLight = new THREE.AmbientLight(0xfff6ec, 0.75);
    this.scene.add(this.ambientLight);

    // Hemisphere light: soft warm sky and natural timber floor reflection (keeps character face luminous)
    this.hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x8a7b6a, 0.65);
    this.scene.add(this.hemiLight);

    // Directional Sunlight pouring through skylights and panoramic south/east windows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
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
    const livingLight = new THREE.PointLight(0xffeedd, 1.0, 12);
    livingLight.position.set(4.5, 3.2, -4.0);
    this.scene.add(livingLight);

    const kitchenLight = new THREE.PointLight(0xfff3e6, 1.0, 12);
    kitchenLight.position.set(-4.5, 3.2, 4.0);
    this.scene.add(kitchenLight);

    const bedroomLight = new THREE.PointLight(0xffe8d6, 0.9, 12);
    bedroomLight.position.set(4.5, 3.2, 4.0);
    this.scene.add(bedroomLight);

    const studioLight = new THREE.PointLight(0xfff5e4, 0.9, 12);
    studioLight.position.set(-4.5, 3.2, -4.0);
    this.scene.add(studioLight);

    const corridorLight = new THREE.PointLight(0xfff0dd, 0.8, 10);
    corridorLight.position.set(0, 3.2, 0);
    this.scene.add(corridorLight);
  }

  setupStars() {
    const starCount = 400;
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
        if (this.hemiLight) this.hemiLight.intensity = 0.65;
        this.sunLight.color.setHex(0xfffaed);
        this.sunLight.intensity = 2.0;
        if (this.stars) this.stars.visible = false;
        break;

      case 'sunset':
        this.scene.background.setHex(0xf97316); // Golden hour sunset
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.7;
        if (this.hemiLight) this.hemiLight.intensity = 0.5;
        this.sunLight.color.setHex(0xfb923c);
        this.sunLight.intensity = 1.7;
        if (this.stars) this.stars.visible = false;
        break;

      case 'night':
      default:
        this.scene.background.setHex(0x0f172a); // Deep cozy night
        this.ambientLight.color.setHex(0x334155);
        this.ambientLight.intensity = 0.45;
        if (this.hemiLight) this.hemiLight.intensity = 0.25;
        this.sunLight.color.setHex(0x94a3b8);
        this.sunLight.intensity = 0.5;
        if (this.stars) this.stars.visible = true;
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

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
