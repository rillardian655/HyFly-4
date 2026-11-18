/**
 * Elaina (Wandering Witch / Majo no Tabitabi) Character Controller
 * Loads the authentic PC model from the original asset package (Elaina (VRChat).fbx),
 * official Wand.fbx, official Broom.fbx, and 2K/4K cel-shaded textures.
 * Features fluid locomotion kinematics (dynamic arm swinging, elbow flexion,
 * leg steps, knee bending, stride bobbing, forward lean, turn banking, idle breathing),
 * synchronized wooden footstep audio, jump physics, and third-person camera.
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
    this.walkSpeed = 1.8;
    this.sprintSpeed = 3.6;
    this.gravity = 22.0;
    this.jumpForce = 7.6;

    // Camera follow parameters (Optimized for full-body view of Elaina)
    this.camDistance = 3.6;
    this.targetCamDistance = 3.6;
    this.camHeight = 1.0;
    this.camAngleX = 0;
    this.camAngleY = 0.28;
    this.cameraMode = 'full'; // 'full' | 'topdown' | 'closeup'

    this.colliders = [];

    // Root Group & Model Hierarchy
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Inner model container for fluid locomotion bobbing and tilt
    this.modelContainer = new THREE.Group();
    this.group.add(this.modelContainer);

    this.elainaMesh = null;
    this.wandMesh = null;
    this.broomMesh = null;
    this.baseModelY = 0;
    this.rootBones = {};
    this.initBoneRotations = {};
    this.isLoaded = false;

    // Kinematic Animation & Emote State
    this.currentEmote = null; // 'wave' | 'cast' | null
    this.emoteTimer = 0;
    this.isFlying = false;
    this.flightHoverY = 1.4;

    // Soft ambient foot contact occlusion (subtle, lets dynamic sun shadows shine)
    const shadowGeo = new THREE.CircleGeometry(0.28, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
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

    this.modelContainer.add(this.proxyGroup);
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
      Body: loadTex('Body.png'),
      Brooch: loadTex('Brooch.png', true),
      BroomWand: loadTex('Broom_Wand.png', true)
    };

    const loader = new FBXLoader();

    // 1. Load the authentic PC Elaina model from the zip
    const modelUrl = 'assets/elaina/elaina_pc.fbx';

    loader.load(
      modelUrl,
      (fbx) => {
        this.elainaMesh = fbx;

        // Clean scale calculation to 1.62m human height
        fbx.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(fbx);
        const size = new THREE.Vector3();
        box.getSize(size);

        const targetHeight = 1.62;
        const scaleFactor = (size.y > 0.1 && Number.isFinite(size.y)) ? (targetHeight / size.y) : 0.00854;
        fbx.scale.setScalar(scaleFactor);
        fbx.updateMatrixWorld(true);

        // Center feet firmly on ground y = 0
        const scaledBox = new THREE.Box3().setFromObject(fbx);
        if (Number.isFinite(scaledBox.min.y)) {
          fbx.position.y = -scaledBox.min.y;
          this.baseModelY = fbx.position.y;
        }

        // Apply authentic textures and cel-shading materials
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const applyMat = (mat) => {
              if (!mat) return mat;
              const name = (mat.name || '').toLowerCase();

              // Clean anime cel outlines
              if (name.includes('outline')) {
                return new THREE.MeshBasicMaterial({
                  color: 0x1f1917,
                  side: THREE.BackSide,
                  transparent: true,
                  opacity: 0.65,
                  depthWrite: true
                });
              }

              // Texture matching from author's texture pack
              let map = null;
              let isAlpha = false;
              if (name.includes('face')) { map = textures.Face; }
              else if (name.includes('hair')) { map = textures.Hair; isAlpha = true; }
              else if (name.includes('coat')) { map = textures.Coat; }
              else if (name.includes('dress') || name.includes('cloth') || name.includes('shirt')) { map = textures.Dress; }
              else if (name.includes('body') || name.includes('skin')) { map = textures.Body; }
              else if (name.includes('brooch')) { map = textures.Brooch; isAlpha = true; }
              else { map = textures.Coat; }

              let roughness = 0.6;
              let metalness = 0.04;
              if (name.includes('face') || name.includes('skin') || name.includes('body')) {
                roughness = 0.82;
                metalness = 0.0;
              } else if (name.includes('hair')) {
                roughness = 0.42;
                metalness = 0.08;
              } else if (name.includes('brooch') || name.includes('metal') || name.includes('gold')) {
                roughness = 0.22;
                metalness = 0.92;
              } else if (name.includes('dress')) {
                roughness = 0.72;
              }

              return new THREE.MeshStandardMaterial({
                map: map,
                roughness: roughness,
                metalness: metalness,
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

          // Capture ONLY the single root bone for each joint (prevents nested duplicate 5x multiplier)
          if (child.isBone && (!child.parent || child.parent.name !== child.name)) {
            if (!this.rootBones[child.name]) {
              this.rootBones[child.name] = child;
              this.initBoneRotations[child.name] = {
                x: child.rotation.x,
                y: child.rotation.y,
                z: child.rotation.z
              };
            }
          }
        });

        // Initialize relaxed arms hanging naturally at her sides upon spawn (no T-pose)
        const spawnArmRestX = 1.05;
        if (this.rootBones['Upper_Arm_L'] && this.initBoneRotations['Upper_Arm_L']) {
          this.rootBones['Upper_Arm_L'].rotation.x = this.initBoneRotations['Upper_Arm_L'].x + spawnArmRestX;
        }
        if (this.rootBones['Upper_Arm_R'] && this.initBoneRotations['Upper_Arm_R']) {
          this.rootBones['Upper_Arm_R'].rotation.x = this.initBoneRotations['Upper_Arm_R'].x + spawnArmRestX;
        }
        fbx.updateMatrixWorld(true);

        // 2. Load the official Wand.fbx from author's zip
        loader.load(
          'assets/elaina/wand.fbx',
          (wand) => {
            this.wandMesh = wand;
            const wBox = new THREE.Box3().setFromObject(wand);
            const wSize = new THREE.Vector3();
            wBox.getSize(wSize);
            const maxDim = Math.max(wSize.x, wSize.y, wSize.z);
            const wScale = (0.55 / (maxDim || 442));
            wand.scale.setScalar(wScale);

            wand.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.material = new THREE.MeshStandardMaterial({
                  map: textures.BroomWand,
                  roughness: 0.4,
                  metalness: 0.2
                });
              }
            });

            // Glowing magical starlight crystal at the tip of Elaina's wand
            const crystalGeo = new THREE.OctahedronGeometry(18, 0);
            const crystalMat = new THREE.MeshStandardMaterial({
              color: 0xdbeafe,
              emissive: 0x60a5fa,
              emissiveIntensity: 2.2,
              roughness: 0.1,
              metalness: 0.2
            });
            this.wandCrystal = new THREE.Mesh(crystalGeo, crystalMat);
            this.wandCrystal.position.set(0, (wBox.max.y || 220) * 0.96, 0);
            wand.add(this.wandCrystal);

            // Position wand naturally at her right hand in relaxed side posture
            wand.position.set(-0.16, 0.74, 0.08);
            wand.rotation.set(-0.25, 0.15, -0.12);
            this.modelContainer.add(wand);
          },
          undefined,
          (err) => console.log('Wand load notice:', err.message)
        );

        // 3. Load the official Broom.fbx from author's zip
        loader.load(
          'assets/elaina/broom.fbx',
          (broom) => {
            this.broomMesh = broom;
            const bBox = new THREE.Box3().setFromObject(broom);
            const bSize = new THREE.Vector3();
            bBox.getSize(bSize);
            const maxDim = Math.max(bSize.x, bSize.y, bSize.z);
            const bScale = (1.28 / (maxDim || 1178));
            broom.scale.setScalar(bScale);

            broom.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.material = new THREE.MeshStandardMaterial({
                  map: textures.BroomWand,
                  roughness: 0.55,
                  metalness: 0.1
                });
              }
            });

            // Sling broom gracefully across her back at a stylish diagonal angle
            broom.position.set(-0.16, 0.95, -0.16);
            broom.rotation.set(0.38, 0.25, 0.82);
            this.modelContainer.add(broom);
          },
          undefined,
          (err) => console.log('Broom load notice:', err.message)
        );

        // Remove proxy mesh and add authentic Elaina model
        if (this.proxyGroup) {
          this.modelContainer.remove(this.proxyGroup);
          this.proxyGroup = null;
        }

        this.modelContainer.add(fbx);
        this.isLoaded = true;
      },
      undefined,
      (err) => {
        console.error('Failed to load Elaina PC FBX, checking fallback:', err);
      }
    );
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
      } else if (code === 'Digit1') {
        this.playEmote('wave');
      } else if (code === 'Digit2') {
        this.playEmote('cast');
      } else if (code === 'Digit3' || code === 'KeyF') {
        this.toggleFlight();
      } else if (code === 'KeyV') {
        this.cycleCameraView();
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

    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, textarea, dialog, .modal-dialog') || document.getElementById('pc-dialog')?.open) return;
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

      // Horizontal orbit around character
      this.camAngleX -= dx * 0.005;

      // Vertical pitch: Moving mouse UP raises camera to look down at character, moving mouse DOWN lowers camera
      this.camAngleY = THREE.MathUtils.clamp(this.camAngleY - dy * 0.005, -0.28, 1.38);
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    window.addEventListener('pointercancel', () => {
      isDragging = false;
    });

    // Smooth scroll wheel zoom
    window.addEventListener('wheel', (e) => {
      if (document.getElementById('pc-dialog')?.open) return;
      this.targetCamDistance = THREE.MathUtils.clamp(this.targetCamDistance + e.deltaY * 0.003, 1.5, 7.5);
    }, { passive: true });
  }

  cycleCameraView() {
    const modes = ['full', 'topdown', 'closeup'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.cameraMode = modes[nextIdx];

    if (this.cameraMode === 'full') {
      this.targetCamDistance = 3.6;
      this.camAngleY = 0.28;
      this.camHeight = 1.0;
    } else if (this.cameraMode === 'topdown') {
      this.targetCamDistance = 4.4;
      this.camAngleY = 1.18; // Looking down from above
      this.camHeight = 1.2;
    } else if (this.cameraMode === 'closeup') {
      this.targetCamDistance = 1.9;
      this.camAngleY = 0.12;
      this.camHeight = 0.85;
    }
    soundEngine.playChime();
    return this.cameraMode;
  }

  playEmote(type) {
    if (this.currentEmote === type) {
      this.currentEmote = null;
      return;
    }
    this.currentEmote = type;
    this.emoteTimer = (type === 'wave') ? 3.2 : 3.5;
    soundEngine.playChime();
  }

  toggleFlight() {
    this.isFlying = !this.isFlying;
    soundEngine.playChime();
    if (this.isFlying) {
      this.position.y = Math.max(1.2, this.position.y);
      this.velocity.set(0, 0, 0);
      this.isGrounded = false;
    } else {
      this.velocity.set(0, 0, 0);
      if (this.broomMesh) {
        this.broomMesh.position.set(-0.16, 0.95, -0.16);
        this.broomMesh.rotation.set(0.38, 0.25, 0.82);
      }
    }
  }

  update(dt) {
    const moveZ = (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0);
    const moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    const isMoving = (moveX !== 0 || moveZ !== 0);

    const speed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (this.isFlying) {
      const flySpeed = this.keys.sprint ? 9.5 : 5.8;
      if (isMoving) {
        const forward = new THREE.Vector3(-Math.sin(this.camAngleX), 0, -Math.cos(this.camAngleX));
        const right = new THREE.Vector3(-forward.z, 0, forward.x);

        const moveDir = new THREE.Vector3()
          .addScaledVector(forward, moveZ)
          .addScaledVector(right, moveX)
          .normalize();

        this.velocity.x = moveDir.x * flySpeed;
        this.velocity.z = moveDir.z * flySpeed;
        this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
      } else {
        this.velocity.x *= 0.85;
        this.velocity.z *= 0.85;
      }

      if (this.keys.jump) {
        this.velocity.y = 3.2;
      } else if (this.keys.sprint) {
        this.velocity.y = -2.5;
      } else {
        this.velocity.y *= 0.8;
      }

      const nextX = THREE.MathUtils.clamp(this.position.x + this.velocity.x * dt, -8.6, 8.6);
      const nextZ = THREE.MathUtils.clamp(this.position.z + this.velocity.z * dt, -8.6, 8.6);
      const nextY = THREE.MathUtils.clamp(this.position.y + this.velocity.y * dt, 0.4, 3.2);

      this.position.set(nextX, nextY, nextZ);
      this.isGrounded = false;
    } else {
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

      const pRadius = 0.38;
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

      allowedX = Math.max(-8.6, Math.min(8.6, allowedX));
      allowedZ = Math.max(-8.6, Math.min(8.6, allowedZ));

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
    }

    // Smooth turning interpolation
    let diff = this.targetRotation - this.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.rotation += diff * 14 * dt;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
    this.shadowBlob.position.set(this.position.x, 0.015, this.position.z);

    // Fluid locomotion kinematics & arm/leg animation
    this.updateLocomotion(isMoving, speed, dt, diff);
    this.updateCamera();
  }

  setBoneRotation(name, axis, targetVal, lerpFactor = 0.25) {
    const b = this.rootBones[name];
    if (!b) return;
    b.rotation[axis] = THREE.MathUtils.lerp(b.rotation[axis], targetVal, lerpFactor);
  }

  updateLocomotion(isMoving, speed, dt, turnDiff) {
    const now = performance.now() * 0.001;

    // Tick emote timer
    if (this.currentEmote) {
      this.emoteTimer -= dt;
      if (this.emoteTimer <= 0) {
        this.currentEmote = null;
      }
    }

    // Gentle natural arm rest angle (hangs naturally beside her body, NO folded arms or T-pose)
    const armRestX = 1.05;
    const baseArmLX = this.initBoneRotations['Upper_Arm_L']?.x ?? 0.157;
    const baseArmLZ = this.initBoneRotations['Upper_Arm_L']?.z ?? 0.068;
    const baseArmRX = this.initBoneRotations['Upper_Arm_R']?.x ?? 0.157;
    const baseArmRZ = this.initBoneRotations['Upper_Arm_R']?.z ?? -0.068;
    const baseElbowLZ = this.initBoneRotations['Lower_Arm_L']?.z ?? 0.164;
    const baseElbowRZ = this.initBoneRotations['Lower_Arm_R']?.z ?? -0.164;

    const baseLegLX = this.initBoneRotations['Upper_Leg_L']?.x ?? 3.08;
    const baseKneeLX = this.initBoneRotations['Lower_Leg_L']?.x ?? 0.045;
    const baseKneeLZ = this.initBoneRotations['Lower_Leg_L']?.z ?? 0.021;
    const baseLegRX = this.initBoneRotations['Upper_Leg_R']?.x ?? 3.08;
    const baseKneeRX = this.initBoneRotations['Lower_Leg_R']?.x ?? 0.055;
    const baseKneeRZ = this.initBoneRotations['Lower_Leg_R']?.z ?? -0.029;

    if (this.isFlying) {
      // Broom flight locomotion: Mount broom, hover smoothly
      const flyBob = Math.sin(now * 3.5) * 0.06;
      const flyPitch = isMoving ? 0.18 : 0.04;
      const flyRoll = THREE.MathUtils.clamp(-turnDiff * 0.25, -0.25, 0.25);

      this.modelContainer.position.y = THREE.MathUtils.lerp(this.modelContainer.position.y, this.baseModelY + flyBob, 0.2);
      this.modelContainer.position.x = THREE.MathUtils.lerp(this.modelContainer.position.x, 0, 0.2);
      this.modelContainer.rotation.x = THREE.MathUtils.lerp(this.modelContainer.rotation.x, flyPitch, 0.2);
      this.modelContainer.rotation.z = THREE.MathUtils.lerp(this.modelContainer.rotation.z, flyRoll, 0.2);

      // Mount broom horizontally between legs
      if (this.broomMesh) {
        this.broomMesh.position.set(0, 0.52, 0.12);
        this.broomMesh.rotation.set(-0.25, 0, 0);
      }

      // Hands grip broom handle
      this.setBoneRotation('Upper_Arm_L', 'x', baseArmLX + 0.35, 0.2);
      this.setBoneRotation('Upper_Arm_L', 'z', baseArmLZ + 0.35, 0.2);
      this.setBoneRotation('Lower_Arm_L', 'z', baseElbowLZ, 0.2);

      this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX + 0.35, 0.2);
      this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ - 0.35, 0.2);
      this.setBoneRotation('Lower_Arm_R', 'z', baseElbowRZ, 0.2);

      // Legs tuck gracefully into flying riding pose
      const flyBend = 0.35;
      this.setBoneRotation('Upper_Leg_L', 'x', baseLegLX - 0.25, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'x', baseKneeLX + flyBend * 0.36, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'z', baseKneeLZ + flyBend, 0.2);

      this.setBoneRotation('Upper_Leg_R', 'x', baseLegRX - 0.25, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'x', baseKneeRX + flyBend * 0.36, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'z', baseKneeRZ - flyBend, 0.2);

      // Subtle hair flutter in the wind
      const windFlutter = Math.sin(now * 14) * 0.08;
      ['HairBack_01', 'HairBack_02'].forEach((bName) => {
        const baseX = this.initBoneRotations[bName]?.x || 0;
        this.setBoneRotation(bName, 'x', baseX - 0.2 + windFlutter, 0.2);
      });
    } else if (isMoving && this.isGrounded) {
      // Fixed cadence gait: DECOUPLED from speed so foot cycle stays visually natural
      // Target: ~0.85 full strides/second walking (~1.7 rad/s), ~1.3 strides/sec sprinting
      const WALK_HZ = 0.85;   // strides per second (slow, human indoor walking)
      const SPRINT_HZ = 1.30; // strides per second when sprinting
      const strideHz = this.keys.sprint ? SPRINT_HZ : WALK_HZ;
      this.walkCycle += dt * strideHz * Math.PI * 2; // constant regardless of speed value

      // Two-phase gait calculation (0 to 2*PI per full stride)
      const TWO_PI = Math.PI * 2;
      let tL = this.walkCycle % TWO_PI;
      if (tL < 0) tL += TWO_PI;
      const tR = (tL + Math.PI) % TWO_PI;

      const strideSpeed = this.keys.sprint ? 1.20 : 1.0;
      const strideAmp = 0.22 * strideSpeed;
      const kneeBendAmp = 0.32 * strideSpeed;

      // 1. Pelvis vertical bobbing & lateral weight transfer
      // Bobbing is dual-frequency (highest at mid-stance, lowest at touchdown)
      const strideBob = -Math.cos(tL * 2) * 0.024;
      const strideSway = Math.sin(tL) * 0.018;
      const forwardLean = this.keys.sprint ? 0.08 : 0.04;
      const turnBank = THREE.MathUtils.clamp(-turnDiff * 0.15, -0.1, 0.1);

      this.modelContainer.position.y = THREE.MathUtils.lerp(this.modelContainer.position.y, this.baseModelY + strideBob, 0.25);
      this.modelContainer.position.x = THREE.MathUtils.lerp(this.modelContainer.position.x, strideSway, 0.25);
      this.modelContainer.rotation.x = THREE.MathUtils.lerp(this.modelContainer.rotation.x, forwardLean, 0.2);
      this.modelContainer.rotation.z = THREE.MathUtils.lerp(this.modelContainer.rotation.z, turnBank, 0.2);

      // 2. Thigh forward & backward stride
      const thighL = Math.cos(tL) * strideAmp;
      const thighR = Math.cos(tR) * strideAmp;
      this.setBoneRotation('Upper_Leg_L', 'x', baseLegLX - thighL, 0.3);
      this.setBoneRotation('Upper_Leg_R', 'x', baseLegRX - thighR, 0.3);

      // 3. Natural knee flexion during forward swing phase (lifts foot smoothly)
      let kneeL = 0;
      if (tL >= Math.PI) {
        const sL = (tL - Math.PI) / Math.PI;
        kneeL = Math.sin(sL * Math.PI) * kneeBendAmp;
      }
      this.setBoneRotation('Lower_Leg_L', 'x', baseKneeLX + kneeL * 0.36, 0.3);
      this.setBoneRotation('Lower_Leg_L', 'z', baseKneeLZ + kneeL, 0.3);

      let kneeR = 0;
      if (tR >= Math.PI) {
        const sR = (tR - Math.PI) / Math.PI;
        kneeR = Math.sin(sR * Math.PI) * kneeBendAmp;
      }
      this.setBoneRotation('Lower_Leg_R', 'x', baseKneeRX + kneeR * 0.36, 0.3);
      this.setBoneRotation('Lower_Leg_R', 'z', baseKneeRZ - kneeR, 0.3);

      // 4. Natural arm pendulum swing — CORRECT anti-phase:
      //    Left leg forward → Right arm forward (opposite side)
      //    tL = left leg phase, tR = right leg phase (tL + PI)
      //    Left arm uses RIGHT leg phase → anti-phase with left leg
      //    Right arm uses LEFT leg phase → anti-phase with right leg
      const armSwingAmp = this.keys.sprint ? 0.17 : 0.13; // subtle, human-scale swing

      // sin() gives smoother start/end compared to cos()
      const armSwingL = Math.sin(tR) * armSwingAmp; // left arm = right leg phase
      const armSwingR = Math.sin(tL) * armSwingAmp; // right arm = left leg phase

      // Slight elbow flex when arm swings forward (looks natural)
      const elbowFlexL = Math.max(0, armSwingL) * 0.25;
      const elbowFlexR = Math.max(0, armSwingR) * 0.25;

      if (!this.currentEmote) {
        // Left arm — hangs at armRestX offset, swings forward/back via Z
        this.setBoneRotation('Upper_Arm_L', 'x', baseArmLX + armRestX, 0.22);
        this.setBoneRotation('Upper_Arm_L', 'z', baseArmLZ + armSwingL, 0.22);
        this.setBoneRotation('Lower_Arm_L', 'z', baseElbowLZ + elbowFlexL, 0.22);

        // Right arm — mirrors left, swings in opposite direction
        this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX + armRestX, 0.22);
        this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ - armSwingR, 0.22);
        this.setBoneRotation('Lower_Arm_R', 'z', baseElbowRZ - elbowFlexR, 0.22);
      }

      // 5. Subtle hair flutter
      const flutter = Math.sin(this.walkCycle * 2) * 0.04;
      ['HairBack_01', 'HairBack_02'].forEach((bName) => {
        const baseX = this.initBoneRotations[bName]?.x || 0;
        this.setBoneRotation(bName, 'x', baseX - 0.08 + flutter, 0.2);
      });

      // 6. Dynamic wand and broom
      if (this.broomMesh) {
        this.broomMesh.rotation.z = 0.82 + Math.sin(this.walkCycle) * 0.04;
      }
      if (this.wandMesh && !this.currentEmote) {
        // Wand follows right arm swing (armSwingR)
        this.wandMesh.position.set(-0.16, 0.74 + strideBob * 0.5, 0.08 - armSwingR * 0.15);
        this.wandMesh.rotation.set(-0.25 - armSwingR * 0.15, 0.15, -0.12);
      }

      // Footstep audio on downbeat (heel strike when foot touches ground)
      const currentStep = Math.floor((this.walkCycle / Math.PI) % 100000);
      if (currentStep !== this.lastFootstepStep) {
        this.lastFootstepStep = currentStep;
        soundEngine.playFootstep('wood');
      }
    } else {
      // Natural Idle Breathing & Gentle Weight Shift (Completely relaxed arms at sides)
      const breath = Math.sin(now * 1.6) * 0.009;  // slower, calmer breathing
      const idleSway = Math.sin(now * 0.9) * 0.006;

      this.modelContainer.position.y = THREE.MathUtils.lerp(this.modelContainer.position.y, this.baseModelY + breath, 0.1);
      this.modelContainer.position.x = THREE.MathUtils.lerp(this.modelContainer.position.x, 0, 0.1);
      this.modelContainer.rotation.x = THREE.MathUtils.lerp(this.modelContainer.rotation.x, breath * 0.2, 0.1);
      this.modelContainer.rotation.z = THREE.MathUtils.lerp(this.modelContainer.rotation.z, idleSway, 0.1);

      // Spine & chest idle breath
      const baseChestX = this.initBoneRotations['Chest']?.x || -0.236;
      this.setBoneRotation('Chest', 'x', baseChestX + breath * 0.3, 0.1);

      // Beautiful relaxed arm pose at her sides (arms rest naturally beside hips)
      if (!this.currentEmote) {
        this.setBoneRotation('Upper_Arm_L', 'x', baseArmLX + armRestX, 0.15);
        this.setBoneRotation('Upper_Arm_L', 'z', baseArmLZ, 0.15);
        this.setBoneRotation('Lower_Arm_L', 'z', baseElbowLZ, 0.15);

        this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX + armRestX, 0.15);
        this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ, 0.15);
        this.setBoneRotation('Lower_Arm_R', 'z', baseElbowRZ, 0.15);
      }

      // Smoothly return legs to neutral standing pose (straight, unbent)
      this.setBoneRotation('Upper_Leg_L', 'x', baseLegLX, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'x', baseKneeLX, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'z', baseKneeLZ, 0.2);

      this.setBoneRotation('Upper_Leg_R', 'x', baseLegRX, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'x', baseKneeRX, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'z', baseKneeRZ, 0.2);

      // Reset hair
      ['HairBack_01', 'HairBack_02'].forEach((bName) => {
        const baseX = this.initBoneRotations[bName]?.x || 0;
        this.setBoneRotation(bName, 'x', baseX, 0.1);
      });

      if (this.broomMesh) {
        this.broomMesh.rotation.z = THREE.MathUtils.lerp(this.broomMesh.rotation.z, 0.82, 0.1);
        this.broomMesh.position.set(-0.16, 0.95, -0.16);
      }
      if (this.wandMesh && !this.currentEmote) {
        this.wandMesh.position.set(-0.16, 0.74 + breath * 0.3, 0.08);
        this.wandMesh.rotation.set(-0.25, 0.15, -0.12);
      }
    }

    // Mid-air Jump Pose
    if (!this.isGrounded && !this.isFlying) {
      this.setBoneRotation('Upper_Arm_L', 'x', baseArmLX + armRestX, 0.2);
      this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX + armRestX, 0.2);
      this.setBoneRotation('Upper_Arm_L', 'z', baseArmLZ - 0.25, 0.2);
      this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ - 0.25, 0.2);

      this.setBoneRotation('Upper_Leg_L', 'x', baseLegLX - 0.2, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'x', baseKneeLX + 0.3 * 0.36, 0.2);
      this.setBoneRotation('Lower_Leg_L', 'z', baseKneeLZ + 0.3, 0.2);

      this.setBoneRotation('Upper_Leg_R', 'x', baseLegRX - 0.1, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'x', baseKneeRX + 0.2 * 0.36, 0.2);
      this.setBoneRotation('Lower_Leg_R', 'z', baseKneeRZ - 0.2, 0.2);
    }

    // Emotes overrides
    if (this.currentEmote === 'wave') {
      const wavePhase = Math.sin(now * 12);
      // Raise right arm up into waving salute
      this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX - 1.25, 0.25);
      this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ + 0.3, 0.25);
      this.setBoneRotation('Wrist_R', 'z', (this.initBoneRotations['Wrist_R']?.z || 0) + wavePhase * 0.35, 0.3);
      if (this.wandMesh) {
        this.wandMesh.position.set(-0.22, 1.45, 0.2);
        this.wandMesh.rotation.set(0.2, 0.1, 0.3);
      }
    } else if (this.currentEmote === 'cast') {
      // Point wand forward for starlight spell
      this.setBoneRotation('Upper_Arm_R', 'x', baseArmRX + 0.15, 0.25);
      this.setBoneRotation('Upper_Arm_R', 'z', baseArmRZ - 0.75, 0.25);
      this.setBoneRotation('Lower_Arm_R', 'z', baseElbowRZ - 0.45, 0.25);
      if (this.wandMesh) {
        this.wandMesh.position.set(-0.16, 0.95, 0.45);
        this.wandMesh.rotation.set(1.2, 0, 0);
      }
      if (this.wandCrystal) {
        this.wandCrystal.material.emissiveIntensity = 3.8 + Math.sin(now * 18) * 1.8;
      }
    }

    if (this.wandCrystal && this.currentEmote !== 'cast') {
      this.wandCrystal.material.emissiveIntensity = 1.8 + Math.sin(now * 3.5) * 0.4;
    }
  }

  updateCamera() {
    this.camDistance = THREE.MathUtils.lerp(this.camDistance, this.targetCamDistance, 0.1);
    
    // Target her torso center (y = 0.92m) so the entire character head-to-toe is beautifully centered
    const targetLook = this.position.clone().add(new THREE.Vector3(0, 0.92, 0));

    const horizDist = Math.cos(this.camAngleY) * this.camDistance;
    const camOffset = new THREE.Vector3(
      Math.sin(this.camAngleX) * horizDist,
      Math.sin(this.camAngleY) * this.camDistance + this.camHeight,
      Math.cos(this.camAngleX) * horizDist
    );

    const desiredCamPos = this.position.clone().add(camOffset);

    // Wall collision clamping to 18m house perimeter and ceiling
    desiredCamPos.x = Math.max(-8.4, Math.min(8.4, desiredCamPos.x));
    desiredCamPos.z = Math.max(-8.4, Math.min(8.4, desiredCamPos.z));
    desiredCamPos.y = Math.max(0.35, Math.min(3.25, desiredCamPos.y));

    this.camera.position.lerp(desiredCamPos, 0.14);
    this.camera.lookAt(targetLook);
  }
}
