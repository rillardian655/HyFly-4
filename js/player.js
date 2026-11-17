/**
 * Elaina (Wandering Witch / Majo no Tabitabi) Character Controller
 * Loads the rigged FBX avatar with high-res anime textures,
 * procedural skeletal kinematics (legs, knees, feet, hips, spine, hair, hat, coat),
 * rich accessories (magic wand, broomstick, travel satchel, potion vials, floating grimoire, mana particles),
 * synchronized footstep audio, and third-person camera.
 */
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { soundEngine } from './audio.js';

export class PlayerController {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // Movement states
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false
    };

    // Physics
    this.position = new THREE.Vector3(1.5, 0, 1.5);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.targetRotation = 0;
    this.isGrounded = true;
    this.wasGrounded = true;
    this.walkCycle = 0;
    this.lastFootstepStep = 0;
    this.walkSpeed = 5.0;
    this.sprintSpeed = 8.5;
    this.gravity = 22.0;
    this.jumpForce = 7.6;

    // Camera follow parameters
    this.camDistance = 4.4;
    this.targetCamDistance = 4.4;
    this.camHeight = 2.2;
    this.camAngleX = 0;
    this.camAngleY = 0.24;

    this.colliders = [];

    // Model & Multi-Armature Bones
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.elainaMesh = null;
    this.boneGroups = {}; // bName -> Array of Bone objects across all SkinnedMeshes
    this.initBoneRotations = {}; // bName -> { x, y, z }
    this.initHipsPos = null;
    this.isLoaded = false;

    // Accessories
    this.floatingBook = null;
    this.manaParticles = null;
    this.wandLight = null;

    // Contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.55, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.015;
    this.scene.add(this.shadowBlob);

    this.proxyGroup = null;
    this.createPlaceholderProxy();
    this.loadElainaModel();
    this.initKeyboard();
    this.initDPad();
    this.initMouseLook();
  }

  createPlaceholderProxy() {
    this.proxyGroup = new THREE.Group();

    // Body / Coat
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x242230, roughness: 0.6 });
    const bodyGeo = new THREE.CylinderGeometry(0.16, 0.32, 0.85, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, coatMat);
    bodyMesh.position.y = 0.85;
    this.proxyGroup.add(bodyMesh);

    // Inner White Skirt
    const dressMat = new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.7 });
    const skirtGeo = new THREE.ConeGeometry(0.36, 0.58, 16);
    const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
    skirtMesh.position.y = 0.52;
    this.proxyGroup.add(skirtMesh);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffe2c4, roughness: 0.5 });
    const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.42;
    this.proxyGroup.add(headMesh);

    // Ash / Silver Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe6e4e8, roughness: 0.5 });
    const hairGeo = new THREE.SphereGeometry(0.18, 16, 16);
    hairGeo.scale(1, 1.25, 1.1);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.44, -0.04);
    this.proxyGroup.add(hairMesh);

    // Witch Hat
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1f1d28, roughness: 0.6 });
    const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.03, 24);
    const brimMesh = new THREE.Mesh(brimGeo, hatMat);
    brimMesh.position.y = 1.56;
    brimMesh.rotation.x = 0.08;
    this.proxyGroup.add(brimMesh);

    const coneGeo = new THREE.ConeGeometry(0.24, 0.45, 16);
    const coneMesh = new THREE.Mesh(coneGeo, hatMat);
    coneMesh.position.set(0, 1.78, -0.04);
    coneMesh.rotation.x = -0.15;
    this.proxyGroup.add(coneMesh);

    this.proxyGroup.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    this.group.add(this.proxyGroup);
  }

  loadElainaModel() {
    const texLoader = new THREE.TextureLoader();
    const loadTex = (file, alpha = false) => {
      const tex = texLoader.load(`assets/elaina/textures/${file}`);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    const textures = {
      Coat: loadTex('Coat.png'),
      Face: loadTex('Face.png'),
      Hair: loadTex('Hair.png', true),
      Dress: loadTex('Dress.png', true),
      body: loadTex('body.png'),
      broom: loadTex('broom.png', true),
      Brooch: loadTex('brooch_3.png', true)
    };

    const loader = new FBXLoader();
    loader.load(
      'assets/elaina/elaina.fbx',
      (fbx) => {
        this.elainaMesh = fbx;

        // Bounding box scale calculation to 1.62m human height
        fbx.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(fbx);
        const size = new THREE.Vector3();
        box.getSize(size);

        const targetHeight = 1.62;
        const scaleFactor = (size.y > 0.01 && Number.isFinite(size.y)) ? (targetHeight / size.y) : 0.00128;
        fbx.scale.setScalar(scaleFactor);
        fbx.updateMatrixWorld(true);

        // Center bottom feet on floor y = 0
        const scaledBox = new THREE.Box3().setFromObject(fbx);
        if (Number.isFinite(scaledBox.min.y)) {
          fbx.position.y = -scaledBox.min.y;
        }

        // Map textures & materials
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const applyMat = (mat) => {
              if (!mat) return mat;
              const name = (mat.name || '').toLowerCase();

              // Outlines
              if (name.includes('outline')) {
                return new THREE.MeshBasicMaterial({
                  color: 0x1f1917,
                  side: THREE.BackSide,
                  transparent: true,
                  opacity: 0.6,
                  depthWrite: true
                });
              }

              // Texture matching
              let map = null;
              let isAlpha = false;
              if (name.includes('face')) { map = textures.Face; }
              else if (name.includes('hair')) { map = textures.Hair; isAlpha = true; }
              else if (name.includes('coat')) { map = textures.Coat; }
              else if (name.includes('dress') || name.includes('cloth') || name.includes('shirt') || name.includes('skirt')) { map = textures.Dress; }
              else if (name.includes('body') || name.includes('skin')) { map = textures.body; }
              else if (name.includes('broom') || name.includes('wand')) { map = textures.broom; isAlpha = true; }
              else if (name.includes('brooch')) { map = textures.Brooch; isAlpha = true; }
              else { map = textures.Coat; }

              return new THREE.MeshStandardMaterial({
                map: map,
                roughness: 0.6,
                metalness: 0.05,
                alphaTest: isAlpha ? 0.45 : 0.0,
                transparent: isAlpha,
                depthWrite: true
              });
            };

            if (Array.isArray(child.material)) {
              child.material = child.material.map(applyMat);
            } else {
              child.material = applyMat(child.material);
            }
          }

          // Group ALL duplicate bones across all 7 SkinnedMeshes so they animate together
          if (child.isBone) {
            const bName = child.name;
            if (!this.boneGroups[bName]) {
              this.boneGroups[bName] = [];
              this.initBoneRotations[bName] = {
                x: child.rotation.x,
                y: child.rotation.y,
                z: child.rotation.z
              };
            }
            this.boneGroups[bName].push(child);
            if (bName === 'Hips' && !this.initHipsPos) {
              this.initHipsPos = child.position.clone();
            }
          }
        });

        // Natural rest pose: lower arms from horizontal T-pose down to sides
        this.relaxRestPose();

        // Build rich magical accessories
        this.buildAccessories(fbx);

        // Remove proxy mesh and add full FBX avatar
        if (this.proxyGroup) {
          this.group.remove(this.proxyGroup);
          this.proxyGroup = null;
        }

        this.group.add(fbx);
        this.isLoaded = true;
      },
      undefined,
      (err) => {
        console.error('Failed to load Elaina FBX, keeping placeholder proxy:', err);
      }
    );
  }

  setBoneRelative(bName, dx = 0, dy = 0, dz = 0) {
    const list = this.boneGroups[bName];
    if (!list) return;
    const init = this.initBoneRotations[bName];
    const ix = init ? init.x : 0;
    const iy = init ? init.y : 0;
    const iz = init ? init.z : 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      b.rotation.x = ix + dx;
      b.rotation.y = iy + dy;
      b.rotation.z = iz + dz;
    }
  }

  setBoneRelativeLerp(bName, targetDx = 0, targetDy = 0, targetDz = 0, alpha = 0.15) {
    const list = this.boneGroups[bName];
    if (!list) return;
    const init = this.initBoneRotations[bName];
    const ix = init ? init.x : 0;
    const iy = init ? init.y : 0;
    const iz = init ? init.z : 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, ix + targetDx, alpha);
      b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, iy + targetDy, alpha);
      b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, iz + targetDz, alpha);
    }
  }

  relaxRestPose() {
    // Bring T-pose arms naturally down along the coat/dress across ALL duplicate bone instances
    const armL = this.boneGroups['Upper_Arm_L'];
    if (armL) {
      for (const b of armL) {
        b.rotation.z = 1.25;
        b.rotation.y = -0.15;
      }
      this.initBoneRotations['Upper_Arm_L'].z = 1.25;
      this.initBoneRotations['Upper_Arm_L'].y = -0.15;
    }

    const armR = this.boneGroups['Upper_Arm_R'];
    if (armR) {
      for (const b of armR) {
        b.rotation.z = -1.25;
        b.rotation.y = 0.15;
      }
      this.initBoneRotations['Upper_Arm_R'].z = -1.25;
      this.initBoneRotations['Upper_Arm_R'].y = 0.15;
    }

    const lowL = this.boneGroups['Lower_Arm_L'];
    if (lowL) {
      for (const b of lowL) b.rotation.z = 0.2;
      this.initBoneRotations['Lower_Arm_L'].z = 0.2;
    }

    const lowR = this.boneGroups['Lower_Arm_R'];
    if (lowR) {
      for (const b of lowR) b.rotation.z = -0.2;
      this.initBoneRotations['Lower_Arm_R'].z = -0.2;
    }
  }

  buildAccessories(fbx) {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    // 1. Witch Magic Wand with glowing cyan crystal gem
    const wandGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(12, 16, 680, 12);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.35,
      metalness: 0.15
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 340;
    wandGroup.add(shaft);

    // Wand Spiral Brass Filigree
    const spiralGeo = new THREE.TorusGeometry(20, 4, 8, 24);
    const spiral = new THREE.Mesh(spiralGeo, goldMat);
    spiral.position.y = 520;
    spiral.rotation.x = 0.4;
    wandGroup.add(spiral);

    // Wand Star Finial & Glowing Gem
    const starGeo = new THREE.OctahedronGeometry(42);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x5ce1e6,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.1
    });
    const gem = new THREE.Mesh(starGeo, gemMat);
    gem.position.y = 690;
    wandGroup.add(gem);

    // Celestial Wand PointLight
    this.wandLight = new THREE.PointLight(0x00e5ff, 1.2, 3.5);
    this.wandLight.position.set(0, 700, 0);
    wandGroup.add(this.wandLight);

    // Attach Wand to Right Hand Wrist bone
    const wristR = this.boneGroups['Wrist_R']?.[0];
    if (wristR) {
      wandGroup.position.set(0, -120, 60);
      wandGroup.rotation.set(-Math.PI / 2 + 0.3, 0, 0.4);
      wristR.add(wandGroup);
    }

    // 2. Signature Witch's Broomstick slung across her back
    const broomGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(18, 22, 1300, 12);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0xc49a45,
      roughness: 0.45
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    broomGroup.add(pole);

    const bristleGeo = new THREE.ConeGeometry(140, 440, 16);
    const bristleMat = new THREE.MeshStandardMaterial({
      color: 0x9e7330,
      roughness: 0.85
    });
    const bristles = new THREE.Mesh(bristleGeo, bristleMat);
    bristles.position.y = -620;
    bristles.rotation.x = Math.PI;
    broomGroup.add(bristles);

    // Ribbon tie on broom
    const ribbonGeo = new THREE.TorusGeometry(32, 8, 8, 24);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x80142b,
      roughness: 0.4
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.y = -440;
    broomGroup.add(ribbonMesh);

    // Attach Broom diagonally to Spine bone
    const spineBone = this.boneGroups['Spine']?.[0];
    if (spineBone) {
      broomGroup.position.set(60, -80, -150);
      broomGroup.rotation.set(0.35, 0.3, 0.72);
      spineBone.add(broomGroup);
    }

    // 3. Adventurer Travel Satchel & Alchemical Potions on Hip
    const satchelGroup = new THREE.Group();
    const bagGeo = new THREE.BoxGeometry(180, 210, 80);
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x4a2815,
      roughness: 0.65
    });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    satchelGroup.add(bag);

    // Flap & Brass Buckle
    const flapGeo = new THREE.BoxGeometry(184, 90, 84);
    const flap = new THREE.Mesh(flapGeo, bagMat);
    flap.position.set(0, 55, 2);
    satchelGroup.add(flap);

    const buckleGeo = new THREE.BoxGeometry(32, 28, 88);
    const buckle = new THREE.Mesh(buckleGeo, goldMat);
    buckle.position.set(0, 30, 0);
    satchelGroup.add(buckle);

    // Glowing Potion Vial 1: Teal Mana Elixir
    const vialGeo = new THREE.CylinderGeometry(20, 20, 65, 12);
    const manaMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.0,
      roughness: 0.1
    });
    const manaVial = new THREE.Mesh(vialGeo, manaMat);
    manaVial.position.set(100, 20, 0);
    satchelGroup.add(manaVial);

    // Glowing Potion Vial 2: Amethyst Health Elixir
    const healthMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xa21caf,
      emissiveIntensity: 1.0,
      roughness: 0.1
    });
    const healthVial = new THREE.Mesh(vialGeo, healthMat);
    healthVial.position.set(-100, 20, 0);
    satchelGroup.add(healthVial);

    // Attach Satchel to Hips bone
    const hipsBone = this.boneGroups['Hips']?.[0];
    if (hipsBone) {
      satchelGroup.position.set(-140, -60, 20);
      satchelGroup.rotation.set(0, 0.25, 0.1);
      hipsBone.add(satchelGroup);
    }

    // 4. Floating Arcane Grimoire / Spellbook
    this.floatingBook = new THREE.Group();
    const bookCoverGeo = new THREE.BoxGeometry(0.24, 0.32, 0.055);
    const bookCoverMat = new THREE.MeshStandardMaterial({
      color: 0x2e1b40,
      roughness: 0.4,
      metalness: 0.25
    });
    const bookCover = new THREE.Mesh(bookCoverGeo, bookCoverMat);
    this.floatingBook.add(bookCover);

    // Gilded Pages
    const pagesGeo = new THREE.BoxGeometry(0.22, 0.3, 0.045);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedc,
      roughness: 0.8
    });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.set(0.01, 0, 0);
    this.floatingBook.add(pages);

    // Arcane Golden Cover Sigil
    const sigilGeo = new THREE.RingGeometry(0.04, 0.07, 16);
    const sigilMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xd4af37,
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide
    });
    const sigil = new THREE.Mesh(sigilGeo, sigilMat);
    sigil.position.set(0, 0, 0.029);
    this.floatingBook.add(sigil);

    this.floatingBook.position.set(-0.55, 1.25, 0.15);
    this.group.add(this.floatingBook);

    // 5. Magical Mana Sparkles / Stardust Aura
    const particleCount = 36;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.45 + Math.random() * 0.35;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = 0.2 + Math.random() * 1.4;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.manaParticles = new THREE.Points(pGeo, pMat);
    this.group.add(this.manaParticles);
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const pcDialog = document.getElementById('pc-dialog');
      if (pcDialog && pcDialog.open) return;

      // Blur background inputs if modal is closed so game controls take priority
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        document.activeElement.blur();
      }

      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') {
        this.keys.forward = true;
      } else if (code === 'KeyS' || key === 's' || code === 'ArrowDown') {
        this.keys.backward = true;
      } else if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') {
        this.keys.left = true;
      } else if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') {
        this.keys.right = true;
      } else if (code === 'Space') {
        this.keys.jump = true;
        e.preventDefault();
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.keys.sprint = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') {
        this.keys.forward = false;
      } else if (code === 'KeyS' || key === 's' || code === 'ArrowDown') {
        this.keys.backward = false;
      } else if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') {
        this.keys.left = false;
      } else if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') {
        this.keys.right = false;
      } else if (code === 'Space') {
        this.keys.jump = false;
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.keys.sprint = false;
      }
    });
  }

  initDPad() {
    const dpad = document.getElementById('dpad-container');
    if (!dpad) return;

    const handlePress = (target, isPressed) => {
      const btn = target.closest('.dpad-btn');
      if (!btn) return;
      const key = btn.dataset.key;
      if (!key) return;

      if (isPressed) {
        btn.classList.add('pressed');
        if (key === 'forward') this.keys.forward = true;
        else if (key === 'backward') this.keys.backward = true;
        else if (key === 'left') this.keys.left = true;
        else if (key === 'right') this.keys.right = true;
        else if (key === 'jump') this.keys.jump = true;
      } else {
        btn.classList.remove('pressed');
        if (key === 'forward') this.keys.forward = false;
        else if (key === 'backward') this.keys.backward = false;
        else if (key === 'left') this.keys.left = false;
        else if (key === 'right') this.keys.right = false;
        else if (key === 'jump') this.keys.jump = false;
      }
    };

    dpad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handlePress(e.target, true);
    });

    window.addEventListener('pointerup', () => {
      const pressedBtns = dpad.querySelectorAll('.dpad-btn.pressed');
      pressedBtns.forEach((btn) => handlePress(btn, false));
    });

    dpad.addEventListener('pointerleave', () => {
      const pressedBtns = dpad.querySelectorAll('.dpad-btn.pressed');
      pressedBtns.forEach((btn) => handlePress(btn, false));
    });
  }

  initMouseLook() {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    this.domElement.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ui-layer') || document.getElementById('pc-dialog')?.open) return;
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      this.camAngleX -= dx * 0.005;
      this.camAngleY = Math.max(0.06, Math.min(1.15, this.camAngleY + dy * 0.004));
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    this.domElement.addEventListener('wheel', (e) => {
      this.targetCamDistance = Math.max(2.4, Math.min(8.0, this.targetCamDistance + e.deltaY * 0.005));
    }, { passive: true });
  }

  update(dt) {
    const moveZ = (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0);
    const moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    const isMoving = (moveX !== 0 || moveZ !== 0);

    const speed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (isMoving) {
      const forward = new THREE.Vector3(-Math.sin(this.camAngleX), 0, -Math.cos(this.camAngleX));
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, moveZ)
        .addScaledVector(right, moveX)
        .normalize();

      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
    }

    // Jump
    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      soundEngine.playJump();
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }

    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    const nextY = this.position.y + this.velocity.y * dt;

    const pRadius = 0.42;
    let allowedX = nextX;
    let allowedZ = nextZ;

    for (const box of this.colliders) {
      if (
        allowedX + pRadius > box.min.x &&
        allowedX - pRadius < box.max.x &&
        this.position.z + pRadius > box.min.z &&
        this.position.z - pRadius < box.max.z
      ) {
        allowedX = this.position.x;
      }

      if (
        allowedX + pRadius > box.min.x &&
        allowedX - pRadius < box.max.x &&
        allowedZ + pRadius > box.min.z &&
        allowedZ - pRadius < box.max.z
      ) {
        allowedZ = this.position.z;
      }
    }

    allowedX = Math.max(-13.4, Math.min(13.4, allowedX));
    allowedZ = Math.max(-13.4, Math.min(13.4, allowedZ));

    this.position.x = allowedX;
    this.position.z = allowedZ;

    // Ground check & Land sound
    this.wasGrounded = this.isGrounded;
    if (nextY <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (!this.wasGrounded) {
        soundEngine.playLand();
      }
    } else {
      this.position.y = nextY;
    }

    let diff = this.targetRotation - this.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.rotation += diff * 14 * dt;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
    this.shadowBlob.position.set(this.position.x, 0.015, this.position.z);

    // Procedural Skeletal & Accessory Kinematics
    this.animateBones(isMoving, speed, dt);
    this.updateCamera();
  }

  animateBones(isMoving, speed, dt) {
    const now = performance.now() * 0.001;

    // Floating Spellbook & Stardust particle orbit kinematics
    if (this.floatingBook) {
      const bookBob = Math.sin(now * 2.5) * 0.06;
      this.floatingBook.position.y = 1.25 + bookBob;
      this.floatingBook.rotation.y = Math.sin(now * 1.2) * 0.25;
      this.floatingBook.rotation.z = Math.cos(now * 1.5) * 0.08;
    }

    if (this.manaParticles) {
      this.manaParticles.rotation.y = now * 0.6;
    }

    if (this.wandLight) {
      this.wandLight.intensity = 1.1 + Math.sin(now * 4.0) * 0.25;
    }

    // Fallback proxy animation if model is still parsing
    if (!this.isLoaded) {
      if (this.proxyGroup) {
        if (isMoving) {
          this.walkCycle += dt * speed * 2.5;
          this.proxyGroup.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.06;
          this.proxyGroup.rotation.z = Math.sin(this.walkCycle) * 0.05;
          this.proxyGroup.rotation.x = 0.06;
          const currentStep = Math.floor(this.walkCycle / Math.PI);
          if (currentStep !== this.lastFootstepStep) {
            this.lastFootstepStep = currentStep;
            soundEngine.playFootstep('wood');
          }
        } else {
          this.proxyGroup.position.y = THREE.MathUtils.lerp(this.proxyGroup.position.y, 0, 0.1);
          this.proxyGroup.rotation.z = THREE.MathUtils.lerp(this.proxyGroup.rotation.z, 0, 0.1);
          this.proxyGroup.rotation.x = Math.sin(now * 2.2) * 0.02;
        }
      }
      return;
    }

    if (isMoving && this.isGrounded) {
      this.walkCycle += dt * speed * 2.6;

      const legSwing = Math.sin(this.walkCycle) * 0.75;
      const legSpread = Math.cos(this.walkCycle) * 0.04;
      const armSwing = Math.sin(this.walkCycle) * 0.55;

      // 1. LEGS (Thighs / Upper Leg) - Swing across all 7 duplicate skeleton instances
      this.setBoneRelative('Upper_Leg_L', legSwing, 0, legSpread);
      this.setBoneRelative('Upper_Leg_R', -legSwing, 0, -legSpread);

      // 2. KNEES (Lower Leg) - Realistic human knee flexion (only bends backward!)
      const kneeBendL = legSwing < 0 ? (-legSwing * 1.15) : (Math.sin(this.walkCycle * 2) * 0.15);
      const kneeBendR = legSwing > 0 ? (legSwing * 1.15) : (Math.sin(this.walkCycle * 2) * 0.15);
      this.setBoneRelative('Lower_Leg_L', Math.max(0, kneeBendL), 0, 0);
      this.setBoneRelative('Lower_Leg_R', Math.max(0, kneeBendR), 0, 0);

      // 3. ANKLES & FEET (Foot & Toe) - Dynamic foot planting and heel liftoff (getaran kaki)
      const footL = legSwing > 0 ? (-legSwing * 0.45) : (legSwing * 0.65);
      const footR = legSwing < 0 ? (legSwing * 0.45) : (-legSwing * 0.65);
      this.setBoneRelative('Foot_L', footL, 0, 0);
      this.setBoneRelative('Foot_R', footR, 0, 0);
      this.setBoneRelative('Toe_L', Math.max(0, footL * 0.5), 0, 0);
      this.setBoneRelative('Toe_R', Math.max(0, footR * 0.5), 0, 0);

      // 4. HIPS & PELVIS - Vertical bounce (bobbing) & lateral sway (getaran tubuh & getaran langkah)
      const hipBounce = Math.abs(Math.sin(this.walkCycle)) * 0.045;
      const hipSway = Math.sin(this.walkCycle) * 0.055;
      const hipRoll = Math.cos(this.walkCycle) * 0.045;
      this.setBoneRelative('Hips', hipRoll, hipSway, -hipRoll);
      const hipsList = this.boneGroups['Hips'];
      if (hipsList && this.initHipsPos) {
        for (const h of hipsList) {
          h.position.y = this.initHipsPos.y + hipBounce;
        }
      }

      // 5. SPINE & CHEST - Counter-rotation against hips
      const spineLean = 0.08;
      this.setBoneRelative('Spine', spineLean + Math.sin(this.walkCycle * 2) * 0.025, -hipSway * 0.8, -hipRoll * 0.6);
      this.setBoneRelative('Chest', Math.sin(this.walkCycle * 2) * 0.02, -hipSway * 0.5, 0);

      // 6. HEAD & NECK - Stabilized gaze with gentle natural head bob
      this.setBoneRelative('Neck', -spineLean * 0.5, hipSway * 0.4, 0);
      this.setBoneRelative('Head', -spineLean * 0.5 + Math.sin(this.walkCycle * 2) * 0.025, hipSway * 0.3, 0);

      // 7. ARMS & SHOULDERS - Natural arm swing with relaxed elbows
      this.setBoneRelative('Shoulder_L', 0, 0, -Math.sin(this.walkCycle) * 0.04);
      this.setBoneRelative('Shoulder_R', 0, 0, Math.sin(this.walkCycle) * 0.04);
      this.setBoneRelative('Upper_Arm_L', -armSwing, 0, 0);
      this.setBoneRelative('Upper_Arm_R', armSwing, 0, 0);
      this.setBoneRelative('Lower_Arm_L', Math.max(0, armSwing * 0.35), 0, 0);
      this.setBoneRelative('Lower_Arm_R', Math.max(0, -armSwing * 0.35), 0, 0);
      this.setBoneRelative('Wrist_L', Math.sin(this.walkCycle - 0.4) * 0.15, 0, 0);
      this.setBoneRelative('Wrist_R', -Math.sin(this.walkCycle - 0.4) * 0.15, 0, 0);

      // 8. DYNAMIC FLOWING ANIME HAIR (Jiggle & Secondary Motion)
      const hairWave1 = Math.sin(this.walkCycle - 0.3) * 0.18;
      const hairWave2 = Math.sin(this.walkCycle - 0.6) * 0.22;
      const hairWave3 = Math.sin(this.walkCycle - 0.9) * 0.25;
      this.setBoneRelative('HairBack_01', hairWave1, 0, 0);
      this.setBoneRelative('HairBack_02', hairWave2, 0, 0);
      this.setBoneRelative('HairBack_03', hairWave3, 0, 0);
      this.setBoneRelative('HairSide_Braid_01', 0, 0, Math.sin(this.walkCycle) * 0.08);
      this.setBoneRelative('HairSide_Braid_02', 0, 0, Math.sin(this.walkCycle - 0.4) * 0.12);
      this.setBoneRelative('HairSide_Left_01', Math.sin(this.walkCycle) * 0.06, 0, 0);
      this.setBoneRelative('HairSide_Right_01', -Math.sin(this.walkCycle) * 0.06, 0, 0);

      // 9. WITCH HAT JIGGLE & TIP DYNAMICS
      const hatTip = Math.sin(this.walkCycle * 2) * 0.08;
      this.setBoneRelative('Hat_01', hatTip * 0.3, 0, 0);
      this.setBoneRelative('Hat_02', hatTip * 0.5, 0, 0);
      this.setBoneRelative('Hat_03', hatTip * 0.7, 0, 0);
      this.setBoneRelative('Hat_04', hatTip * 0.9, 0, 0);

      // 10. SKIRT & COAT FLUTTER
      this.setBoneRelative('Skirt_L_Front', Math.max(0, legSwing * 0.6), 0, 0);
      this.setBoneRelative('Skirt_R_Front', Math.max(0, -legSwing * 0.6), 0, 0);
      this.setBoneRelative('Skirt_L_Back', Math.max(0, -legSwing * 0.5), 0, 0);
      this.setBoneRelative('Skirt_R_Back', Math.max(0, legSwing * 0.5), 0, 0);

      const coatSway = Math.sin(this.walkCycle - 0.5) * 0.22;
      this.setBoneRelative('Coat_L_Back_01', coatSway, 0, 0);
      this.setBoneRelative('Coat_R_Back_01', coatSway, 0, 0);
      this.setBoneRelative('Coat_L_Side_01', 0, 0, Math.sin(this.walkCycle) * 0.1);
      this.setBoneRelative('Coat_R_Side_01', 0, 0, -Math.sin(this.walkCycle) * 0.1);

      // Footstep audio on heel strike
      const currentStep = Math.floor(this.walkCycle / Math.PI);
      if (currentStep !== this.lastFootstepStep) {
        this.lastFootstepStep = currentStep;
        soundEngine.playFootstep('wood');
      }
    } else {
      // DETAILED IDLE ANIMATION: Breathing, subtle weight shift, hair drift
      const breath = Math.sin(now * 2.2) * 0.035;
      const microShift = Math.sin(now * 1.1) * 0.02;

      this.setBoneRelativeLerp('Spine', breath, microShift * 0.5, 0, 0.12);
      this.setBoneRelativeLerp('Chest', breath * 1.2, 0, 0, 0.12);
      this.setBoneRelativeLerp('Head', -breath * 0.6, -microShift * 0.4, 0, 0.12);
      this.setBoneRelativeLerp('Hips', 0, microShift, 0, 0.12);

      // Soft gentle hair breathing sway
      const hairBreeze = Math.sin(now * 1.8) * 0.05;
      this.setBoneRelativeLerp('HairBack_01', hairBreeze, 0, 0, 0.1);
      this.setBoneRelativeLerp('HairBack_02', hairBreeze * 1.4, 0, 0, 0.1);
      this.setBoneRelativeLerp('Hat_03', hairBreeze * 0.5, 0, 0, 0.1);

      // Smoothly return legs & feet to neutral upright stance
      this.setBoneRelativeLerp('Upper_Leg_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Upper_Leg_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Lower_Leg_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Lower_Leg_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Foot_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Foot_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Toe_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Toe_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Upper_Arm_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Upper_Arm_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Lower_Arm_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Lower_Arm_R', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Wrist_L', 0, 0, 0, 0.15);
      this.setBoneRelativeLerp('Wrist_R', 0, 0, 0, 0.15);
    }
  }

  updateCamera() {
    this.camDistance = THREE.MathUtils.lerp(this.camDistance, this.targetCamDistance, 0.1);
    const targetLook = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));

    const camOffset = new THREE.Vector3(
      Math.sin(this.camAngleX) * Math.cos(this.camAngleY) * this.camDistance,
      Math.sin(this.camAngleY) * this.camDistance + this.camHeight,
      Math.cos(this.camAngleX) * Math.cos(this.camAngleY) * this.camDistance
    );

    const desiredCamPos = this.position.clone().add(camOffset);

    // Wall collision clamping
    desiredCamPos.x = Math.max(-13.2, Math.min(13.2, desiredCamPos.x));
    desiredCamPos.z = Math.max(-13.2, Math.min(13.2, desiredCamPos.z));
    desiredCamPos.y = Math.max(0.6, Math.min(7.2, desiredCamPos.y));

    this.camera.position.lerp(desiredCamPos, 0.12);
    this.camera.lookAt(targetLook);
  }
}
