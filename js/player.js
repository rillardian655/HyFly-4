/**
 * Elaina (Wandering Witch / Majo no Tabitabi) Character Controller
 * Loads the rigged FBX avatar with high-res anime textures,
 * procedural skeletal kinematics, synchronized footsteps, and third-person camera.
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
    this.sprintSpeed = 8.4;
    this.gravity = 22.0;
    this.jumpForce = 7.6;

    // Camera follow parameters
    this.camDistance = 4.4;
    this.targetCamDistance = 4.4;
    this.camHeight = 2.2;
    this.camAngleX = 0;
    this.camAngleY = 0.24;

    this.colliders = [];

    // Model & Bones
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.elainaMesh = null;
    this.bones = {};
    this.initBoneRotations = {};
    this.isLoaded = false;

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
    this.initMouseLook();
  }

  createPlaceholderProxy() {
    this.proxyGroup = new THREE.Group();

    // Body/Coat
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x242230,
      roughness: 0.6
    });
    const bodyGeo = new THREE.CylinderGeometry(0.16, 0.32, 0.85, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, coatMat);
    bodyMesh.position.y = 0.85;
    this.proxyGroup.add(bodyMesh);

    // Inner White Skirt
    const dressMat = new THREE.MeshStandardMaterial({
      color: 0xf5f3f0,
      roughness: 0.7
    });
    const skirtGeo = new THREE.ConeGeometry(0.36, 0.58, 16);
    const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
    skirtMesh.position.y = 0.52;
    this.proxyGroup.add(skirtMesh);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffe2c4,
      roughness: 0.5
    });
    const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 1.42;
    this.proxyGroup.add(headMesh);

    // Ash/Silver Hair (Elaina signature)
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0xe6e4e8,
      roughness: 0.5
    });
    const hairGeo = new THREE.SphereGeometry(0.18, 16, 16);
    hairGeo.scale(1, 1.25, 1.1);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.44, -0.04);
    this.proxyGroup.add(hairMesh);

    // Witch Hat
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0x1f1d28,
      roughness: 0.6
    });
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

          // Cache critical skeleton bones for procedural animation
          if (child.isBone) {
            const bName = child.name;
            this.bones[bName] = child;
            this.initBoneRotations[bName] = child.rotation.clone();
          }
        });

        // Natural rest pose: gently lower arms from horizontal T-pose down to sides
        this.relaxRestPose();

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

  relaxRestPose() {
    // Bring T-pose arms naturally down along the body
    if (this.bones['Upper_Arm_L']) {
      this.bones['Upper_Arm_L'].rotation.z = 1.25;
      this.bones['Upper_Arm_L'].rotation.y = -0.15;
    }
    if (this.bones['Upper_Arm_R']) {
      this.bones['Upper_Arm_R'].rotation.z = -1.25;
      this.bones['Upper_Arm_R'].rotation.y = 0.15;
    }
    if (this.bones['Lower_Arm_L']) {
      this.bones['Lower_Arm_L'].rotation.z = 0.2;
    }
    if (this.bones['Lower_Arm_R']) {
      this.bones['Lower_Arm_R'].rotation.z = -0.2;
    }
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.jump = true;
          e.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
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
      const right = new THREE.Vector3(forward.z, 0, -forward.x);

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

    // Procedural Elaina Skeletal Animation
    this.animateBones(isMoving, speed, dt);
    this.updateCamera();
  }

  animateBones(isMoving, speed, dt) {
    if (!this.isLoaded) return;

    const now = performance.now() * 0.001;

    if (isMoving && this.isGrounded) {
      this.walkCycle += dt * speed * 2.5;

      const legSwing = Math.sin(this.walkCycle) * 0.65;
      const armSwing = Math.sin(this.walkCycle) * 0.55;

      // Legs swing
      if (this.bones['Upper_Leg_L']) this.bones['Upper_Leg_L'].rotation.x = legSwing;
      if (this.bones['Upper_Leg_R']) this.bones['Upper_Leg_R'].rotation.x = -legSwing;
      if (this.bones['Lower_Leg_L']) this.bones['Lower_Leg_L'].rotation.x = Math.max(0, -legSwing * 0.7);
      if (this.bones['Lower_Leg_R']) this.bones['Lower_Leg_R'].rotation.x = Math.max(0, legSwing * 0.7);

      // Arms swing (modulated over resting pose)
      if (this.bones['Upper_Arm_L']) this.bones['Upper_Arm_L'].rotation.x = -armSwing;
      if (this.bones['Upper_Arm_R']) this.bones['Upper_Arm_R'].rotation.x = armSwing;

      // Spine & Hips gentle dynamic sway
      if (this.bones['Spine']) this.bones['Spine'].rotation.z = Math.sin(this.walkCycle) * 0.04;
      if (this.bones['Hips']) this.bones['Hips'].position.y = (Math.abs(Math.sin(this.walkCycle * 2)) * 0.03);

      // Footstep audio trigger
      const currentStep = Math.floor(this.walkCycle / Math.PI);
      if (currentStep !== this.lastFootstepStep) {
        this.lastFootstepStep = currentStep;
        soundEngine.playFootstep('wood');
      }
    } else {
      // Natural idle breathing pose
      const breath = Math.sin(now * 2.2) * 0.025;

      if (this.bones['Spine']) {
        this.bones['Spine'].rotation.x = breath;
        this.bones['Spine'].rotation.z = THREE.MathUtils.lerp(this.bones['Spine'].rotation.z, 0, 0.1);
      }
      if (this.bones['Head']) {
        this.bones['Head'].rotation.x = -breath * 0.5;
      }

      // Reset legs
      if (this.bones['Upper_Leg_L']) this.bones['Upper_Leg_L'].rotation.x = THREE.MathUtils.lerp(this.bones['Upper_Leg_L'].rotation.x, 0, 0.15);
      if (this.bones['Upper_Leg_R']) this.bones['Upper_Leg_R'].rotation.x = THREE.MathUtils.lerp(this.bones['Upper_Leg_R'].rotation.x, 0, 0.15);
      if (this.bones['Lower_Leg_L']) this.bones['Lower_Leg_L'].rotation.x = THREE.MathUtils.lerp(this.bones['Lower_Leg_L'].rotation.x, 0, 0.15);
      if (this.bones['Lower_Leg_R']) this.bones['Lower_Leg_R'].rotation.x = THREE.MathUtils.lerp(this.bones['Lower_Leg_R'].rotation.x, 0, 0.15);

      // Reset arms to relaxed posture
      if (this.bones['Upper_Arm_L']) this.bones['Upper_Arm_L'].rotation.x = THREE.MathUtils.lerp(this.bones['Upper_Arm_L'].rotation.x, 0, 0.15);
      if (this.bones['Upper_Arm_R']) this.bones['Upper_Arm_R'].rotation.x = THREE.MathUtils.lerp(this.bones['Upper_Arm_R'].rotation.x, 0, 0.15);
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
