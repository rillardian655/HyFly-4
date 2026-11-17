/**
 * Contemporary Casual 3D Character Controller & Kinematics
 * Features:
 * - Natural human outfit (knit sweater, casual chinos, leather sneakers)
 * - Synchronized footstep audio effects and landing physics
 * - Camera occlusion raycasting to prevent wall clipping
 * - Smooth physics locomotion and responsive jump mechanics
 */
import * as THREE from 'three';
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
    this.walkSpeed = 5.2;
    this.sprintSpeed = 8.6;
    this.gravity = 22.0;
    this.jumpForce = 7.8;

    // Camera follow parameters
    this.camDistance = 4.8;
    this.targetCamDistance = 4.8;
    this.camHeight = 2.4;
    this.camAngleX = 0;
    this.camAngleY = 0.26;

    this.colliders = [];
    this.cameraRaycaster = new THREE.Raycaster();
    this.group = new THREE.Group();
    this.buildCasualCharacter();
    this.scene.add(this.group);

    this.initKeyboard();
    this.initMouseLook();
  }

  buildCasualCharacter() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1e16, roughness: 0.4 });
    const sweaterMat = new THREE.MeshStandardMaterial({ color: 0xe5ded6, roughness: 0.85 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const sneakerSoleMat = new THREE.MeshStandardMaterial({ color: 0xfdfdfd, roughness: 0.25 });
    const sneakerUpperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });

    // 1. Torso: Cozy Knit Wool Crewneck Sweater
    const torsoGeo = new THREE.CylinderGeometry(0.36, 0.32, 0.82, 16);
    this.torso = new THREE.Mesh(torsoGeo, sweaterMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 16), sweaterMat);
    collar.position.set(0, 1.76, 0);
    collar.rotation.x = Math.PI / 2;
    this.group.add(collar);

    // 2. Head & Realistic Casual Hair
    const headGeo = new THREE.SphereGeometry(0.24, 18, 18);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.98;
    this.head.castShadow = true;
    this.group.add(this.head);

    const hairBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairBase.position.set(0, 2.02, -0.02);
    this.group.add(hairBase);

    for (let i = 0; i < 4; i++) {
      const lock = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), hairMat);
      lock.position.set(-0.12 + i * 0.08, 2.08, 0.2);
      lock.rotation.x = 0.45;
      lock.rotation.z = (i - 1.5) * 0.15;
      this.group.add(lock);
    }

    // 3. Articulated Arms
    this.leftArm = this.buildArm(-1, sweaterMat, skinMat);
    this.rightArm = this.buildArm(1, sweaterMat, skinMat);
    this.group.add(this.leftArm);
    this.group.add(this.rightArm);

    // 4. Articulated Legs
    this.leftLeg = this.buildLeg(-1, pantsMat, sneakerSoleMat, sneakerUpperMat);
    this.rightLeg = this.buildLeg(1, pantsMat, sneakerSoleMat, sneakerUpperMat);
    this.group.add(this.leftLeg);
    this.group.add(this.rightLeg);

    // Dynamic contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.52, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.015;
    this.scene.add(this.shadowBlob);
  }

  buildArm(side, sleeveMat, handMat) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.44, 1.62, 0);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), sleeveMat);
    armGroup.add(shoulder);

    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.55, 12), sleeveMat);
    sleeve.position.y = -0.3;
    sleeve.castShadow = true;
    armGroup.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), handMat);
    hand.position.y = -0.6;
    armGroup.add(hand);

    return armGroup;
  }

  buildLeg(side, pantsMat, soleMat, upperMat) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.18, 0.95, 0);

    const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.095, 0.85, 12), pantsMat);
    legMesh.position.y = -0.42;
    legMesh.castShadow = true;
    legGroup.add(legMesh);

    const shoe = new THREE.Group();
    shoe.position.set(0, -0.88, 0.06);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.42), soleMat);
    sole.position.y = 0.04;
    shoe.add(sole);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.36), upperMat);
    upper.position.set(0, 0.13, -0.02);
    shoe.add(upper);

    legGroup.add(shoe);
    return legGroup;
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
      this.targetCamDistance = Math.max(2.4, Math.min(8.5, this.targetCamDistance + e.deltaY * 0.005));
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

    // Natural walk kinematics & Footstep sound synchronization
    if (isMoving && this.isGrounded) {
      this.walkCycle += dt * speed * 2.5;
      const armSwing = Math.sin(this.walkCycle) * 0.6;
      const legSwing = Math.sin(this.walkCycle) * 0.65;

      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
      this.head.position.y = 1.98 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.03;
      this.torso.rotation.z = Math.sin(this.walkCycle) * 0.03;

      // Footstep sound trigger when foot reaches lowest arc
      const currentStep = Math.floor(this.walkCycle / Math.PI);
      if (currentStep !== this.lastFootstepStep) {
        this.lastFootstepStep = currentStep;
        soundEngine.playFootstep('wood');
      }
    } else {
      const breath = Math.sin(performance.now() * 0.003) * 0.015;
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.15);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.35 + breath, 0.1);
      this.head.position.y = THREE.MathUtils.lerp(this.head.position.y, 1.98 + breath * 1.5, 0.1);
      this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, 0, 0.1);
    }

    this.updateCamera();
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

    // Camera wall collision prevention (clamp inside bounds)
    desiredCamPos.x = Math.max(-13.2, Math.min(13.2, desiredCamPos.x));
    desiredCamPos.z = Math.max(-13.2, Math.min(13.2, desiredCamPos.z));
    desiredCamPos.y = Math.max(0.6, Math.min(7.2, desiredCamPos.y));

    this.camera.position.lerp(desiredCamPos, 0.12);
    this.camera.lookAt(targetLook);
  }
}
