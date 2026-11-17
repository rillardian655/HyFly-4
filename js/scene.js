/**
 * Scene Manager & 3D Lighting Environment for HyFly-4
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.ambientLight = null;
    this.sunLight = null;
    this.stars = null;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.interactiveObjects = [];

    // Environment modes: 'day', 'sunset', 'night'
    this.envMode = 'night';

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f17);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(5.5, 5.2, 5.8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('webgl-canvas'),
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 2.5, -2.5);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera below floor
    this.controls.minDistance = 2.8;
    this.controls.maxDistance = 11.0;

    this.setupLighting();
    this.setupStars();
    this.setEnvironmentMode('night');

    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.4);
    this.scene.add(this.ambientLight);

    // Window Directional Sun/Moon Light
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    this.sunLight.position.set(-8, 9, -2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 25;
    this.sunLight.shadow.camera.left = -6;
    this.sunLight.shadow.camera.right = 6;
    this.sunLight.shadow.camera.top = 6;
    this.sunLight.shadow.camera.bottom = -6;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Ceiling soft fill light
    const ceilingLight = new THREE.PointLight(0x94a3b8, 0.6, 15);
    ceilingLight.position.set(0, 7.5, 0);
    this.scene.add(ceilingLight);
  }

  setupStars() {
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = -8 + (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = 4 + Math.random() * 8;
      positions[i * 3 + 2] = -9 - Math.random() * 6;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
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
        this.scene.background.setHex(0x38bdf8);
        this.ambientLight.color.setHex(0xe0f2fe);
        this.ambientLight.intensity = 0.7;
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 1.8;
        if (this.stars) this.stars.visible = false;
        break;

      case 'sunset':
        this.scene.background.setHex(0x9a3412);
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.5;
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.4;
        if (this.stars) this.stars.visible = false;
        break;

      case 'night':
      default:
        this.scene.background.setHex(0x060913);
        this.ambientLight.color.setHex(0x1e293b);
        this.ambientLight.intensity = 0.35;
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 0.45;
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

  resetCamera() {
    this.camera.position.set(5.5, 5.2, 5.8);
    this.controls.target.set(0, 2.5, -2.5);
    this.controls.update();
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
