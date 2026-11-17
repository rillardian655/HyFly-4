/**
 * 3D Player Character Controller & Third-Person Camera
 * Stylized humanoid avatar with walking kinematics and collision avoidance.
 */
import * as THREE from 'three';

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

    // Physics parameters
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.targetRotation = 0;
    this.isGrounded = true;
    this.walkCycle = 0;
    this.walkSpeed = 4.8;
    this.sprintSpeed = 8.2;
    this.gravity = 22.0;
    this.jumpForce = 7.5;

    // Camera follow parameters
    this.camDistance = 5.2;
    this.camHeight = 2.8;
    this.camAngleX = 0;
    this.camAngleY = 0.25;

    // Collision boxes (populated by house builder)
    this.colliders = [];

    this.group = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.group);

    this.initKeyboard();
    this.initMouseLook();
  }

  buildCharacterMesh() {
    // Stylized Cyber / Casual Explorer Avatar
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }); // Cyan jacket
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });  // Dark pants
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 });   // Stylized skin
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });   // Dark hair
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });   // White sneakers

    // Torso / Jacket
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.38);
    this.torso = new THREE.Mesh(torsoGeo, jacketMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Backpack
    const packGeo = new THREE.BoxGeometry(0.45, 0.55, 0.22);
    const packMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 1.25, -0.28);
    pack.castShadow = true;
    this.group.add(pack);

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.45, 0.42);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.9;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair / Cap
    const hairGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.05, 0.02);
    this.group.add(hair);

    // Visor / Eyes
    const visorGeo = new THREE.BoxGeometry(0.32, 0.09, 0.08);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.92, 0.21);
    this.group.add(visor);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);

    this.leftArm = new THREE.Mesh(armGeo, jacketMat);
    this.leftArm.position.set(-0.44, 1.25, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, jacketMat);
    this.rightArm.position.set(0.44, 1.25, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.24);

    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.19, 0.45, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.19, 0.45, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.25, 0.14, 0.35);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.19, 0.07, 0.05);
    this.group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.19, 0.07, 0.05);
    this.group.add(rightShoe);

    // Shadow blob
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.01;
    this.scene.add(this.shadowBlob);
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Don't capture keys if typing in dialog input/notes
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
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
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
      this.camAngleY = Math.max(0.05, Math.min(1.2, this.camAngleY + dy * 0.004));
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Zoom
    this.domElement.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(2.5, Math.min(9.0, this.camDistance + e.deltaY * 0.005));
    }, { passive: true });
  }

  update(dt) {
    // Determine movement direction relative to camera angle
    const moveZ = (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0);
    const moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    const isMoving = (moveX !== 0 || moveZ !== 0);

    const speed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

    if (isMoving) {
      // Camera-relative direction
      const forward = new THREE.Vector3(-Math.sin(this.camAngleX), 0, -Math.cos(this.camAngleX));
      const right = new THREE.Vector3(forward.z, 0, -forward.x);

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, moveZ)
        .addScaledVector(right, moveX)
        .normalize();

      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;

      // Face direction of movement
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
    }

    // Jumping & Gravity
    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }

    // Proposed next position
    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    const nextY = this.position.y + this.velocity.y * dt;

    // Collision check against bounding boxes
    const playerRadius = 0.45;
    let allowedX = nextX;
    let allowedZ = nextZ;

    for (const box of this.colliders) {
      // Check X axis
      if (
        allowedX + playerRadius > box.min.x &&
        allowedX - playerRadius < box.max.x &&
        this.position.z + playerRadius > box.min.z &&
        this.position.z - playerRadius < box.max.z
      ) {
        allowedX = this.position.x; // Block X
      }

      // Check Z axis
      if (
        allowedX + playerRadius > box.min.x &&
        allowedX - playerRadius < box.max.x &&
        allowedZ + playerRadius > box.min.z &&
        allowedZ - playerRadius < box.max.z
      ) {
        allowedZ = this.position.z; // Block Z
      }
    }

    // World floor bounds (-14 to +14 in X, -14 to +14 in Z)
    allowedX = Math.max(-13.5, Math.min(13.5, allowedX));
    allowedZ = Math.max(-13.5, Math.min(13.5, allowedZ));

    this.position.x = allowedX;
    this.position.z = allowedZ;

    // Floor landing
    if (nextY <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextY;
    }

    // Smooth rotation lerp
    let diff = this.targetRotation - this.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.rotation += diff * 12 * dt;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
    this.shadowBlob.position.set(this.position.x, 0.015, this.position.z);

    // Walk animation (limb swinging)
    if (isMoving && this.isGrounded) {
      this.walkCycle += dt * speed * 2.2;
      const swing = Math.sin(this.walkCycle) * 0.55;

      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      this.torso.position.y = 1.25 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
    } else {
      // Idle pose reset
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.15);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.25, 0.15);
    }

    // Third-person camera tracking
    this.updateCamera();
  }

  updateCamera() {
    const targetLook = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));

    // Spherical position offset
    const camOffset = new THREE.Vector3(
      Math.sin(this.camAngleX) * Math.cos(this.camAngleY) * this.camDistance,
      Math.sin(this.camAngleY) * this.camDistance + this.camHeight,
      Math.cos(this.camAngleX) * Math.cos(this.camAngleY) * this.camDistance
    );

    const desiredCamPos = this.position.clone().add(camOffset);
    this.camera.position.lerp(desiredCamPos, 0.1);
    this.camera.lookAt(targetLook);
  }
}

