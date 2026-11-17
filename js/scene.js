/**
 * Scene Manager & 3D Lighting Environment for HyFly-4
 * Enhanced for full multi-room house scale (28m x 28m)
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

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];

    // Environment modes: 'night', 'day', 'sunset'
    this.envMode = 'night';

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 150);
    this.camera.position.set(0, 3.5, 6.0);

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
    this.setEnvironmentMode('night');

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.45);
    this.scene.add(this.ambientLight);

    // Directional Sun/Moon light for the whole house
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    this.sunLight.position.set(-16, 22, -10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1.0;
    this.sunLight.shadow.camera.far = 60;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Ceiling chandeliers / ambient fill lights in key zones
    // Living Room Ceiling Light
    const livingLight = new THREE.PointLight(0xfef08a, 0.8, 16);
    livingLight.position.set(7.0, 6.5, -4.0);
    this.scene.add(livingLight);

    // Kitchen Ceiling Light
    const kitchenLight = new THREE.PointLight(0xe0f2fe, 0.8, 16);
    kitchenLight.position.set(-7.0, 6.5, 7.0);
    this.scene.add(kitchenLight);

    // Central Corridor Light
    const corridorLight = new THREE.PointLight(0x38bdf8, 0.6, 14);
    corridorLight.position.set(0, 6.5, 0);
    this.scene.add(corridorLight);
  }

  setupStars() {
    const starCount = 500;
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
      opacity: 0.85
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  setEnvironmentMode(mode) {
    this.envMode = mode;
    switch (mode) {
      case 'day':
        this.scene.background.setHex(0x38bdf8);
        this.ambientLight.color.setHex(0xe0f2fe);
        this.ambientLight.intensity = 0.75;
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 1.9;
        if (this.stars) this.stars.visible = false;
        break;

      case 'sunset':
        this.scene.background.setHex(0x9a3412);
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.55;
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.5;
        if (this.stars) this.stars.visible = false;
        break;

      case 'night':
      default:
        this.scene.background.setHex(0x060913);
        this.ambientLight.color.setHex(0x1e293b);
        this.ambientLight.intensity = 0.4;
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 0.5;
        if (this.stars) this.stars.visible = true;
        break;
    }
    return this.envMode;
  }

  cycleEnvironment() {
    const modes = ['night', 'day', 'sunset'];
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
