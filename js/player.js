/**
 * Advanced Stylized 3D Character Controller & Kinematics
 * Modern streetwear aesthetic with rounded geometric limbs, headphones, and smooth gait.
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

    // Physics
    this.position = new THREE.Vector3(1.5, 0, 1.5);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.targetRotation = 0;
    this.isGrounded = true;
    this.walkCycle = 0;
    this.walkSpeed = 5.2;
    this.sprintSpeed = 8.8;
    this.gravity = 22.0;
    this.jumpForce = 7.8;

    // Camera follow parameters
    this.camDistance = 4.8;
    this.camHeight = 2.4;
    this.camAngleX = 0;
    this.camAngleY = 0.28;

    this.colliders = [];
    this.group = new THREE.Group();
    this.buildStylizedCharacter();
    this.scene.add(this.group);

    this.initKeyboard();
    this.initMouseLook();
  }

  buildStylizedCharacter() {
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.6 });
    const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 }); // Cobalt Blue
    const darkHoodieMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });  // Dark Slate
    const shoeSoleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }); // Chunky White Soles
    const shoeUpperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }); // Amber Accents
    const headphoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });
    const neonGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // 1. Torso / Oversized Hoodie
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.85, 12);
    this.torso = new THREE.Mesh(torsoGeo, hoodieMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Hoodie Collar / Hood bunch behind neck
    const hoodCollar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.1, 8, 16), darkHoodieMat);
    hoodCollar.position.set(0, 1.74, -0.06);
    hoodCollar.rotation.x = Math.PI / 2.3;
    this.group.add(hoodCollar);

    // Tech Sling Bag across chest
    const bagGeo = new THREE.BoxGeometry(0.38, 0.28, 0.14);
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.set(0.08, 1.35, 0.28);
    bag.rotation.z = -0.2;
    this.group.add(bag);

    // 2. Head & Hair
    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.0;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Stylized Layered Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.3 });
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hairCap.position.set(0, 2.05, -0.02);
    this.group.add(hairCap);

    // Hair Fringe Tufts
    for (let i = 0; i < 4; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), hairMat);
      tuft.position.set(-0.12 + i * 0.08, 2.12, 0.22);
      tuft.rotation.x = 0.5;
      tuft.rotation.z = (i - 1.5) * 0.2;
      this.group.add(tuft);
    }

    // Modern Cyber Visor
    const visorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16, 1, false, -Math.PI * 0.4, Math.PI * 0.8);
    const visor = new THREE.Mesh(visorGeo, neonGlowMat);
    visor.position.set(0, 2.0, 0.06);
    this.group.add(visor);

    // 3. Wireless Over-Ear Headphones with Glowing Rings
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.03, 8, 16, Math.PI), headphoneMat);
    band.position.set(0, 2.08, 0);
    band.rotation.z = Math.PI;
    this.group.add(band);

    // Earcups
    for (const side of [-1, 1]) {
      const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16), headphoneMat);
      earcup.rotation.z = Math.PI / 2;
      earcup.position.set(side * 0.29, 2.0, 0);
      this.group.add(earcup);

      const neonRing = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.07, 16), neonGlowMat);
      neonRing.rotation.y = (side === -1) ? -Math.PI / 2 : Math.PI / 2;
      neonRing.position.set(side * 0.33, 2.0, 0);
      this.group.add(neonRing);
    }

    // 4. Articulated Arms (Shoulders, Sleeves, Hands)
    this.leftArm = this.buildArm(-1, hoodieMat, skinMat);
    this.rightArm = this.buildArm(1, hoodieMat, skinMat);
    this.group.add(this.leftArm);
    this.group.add(this.rightArm);

    // 5. Articulated Legs (Tapered Streetwear Pants)
    this.leftLeg = this.buildLeg(-1, pantsMat, shoeSoleMat, shoeUpperMat);
    this.rightLeg = this.buildLeg(1, pantsMat, shoeSoleMat, shoeUpperMat);
    this.group.add(this.leftLeg);
    this.group.add(this.rightLeg);

    // Dynamic contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.015;
    this.scene.add(this.shadowBlob);
  }

  buildArm(side, sleeveMat, handMat) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.46, 1.62, 0);

    // Shoulder cap
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), sleeveMat);
    armGroup.add(shoulder);

    // Sleeve
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 12), sleeveMat);
    sleeve.position.y = -0.3;
    sleeve.castShadow = true;
    armGroup.add(sleeve);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), handMat);
    hand.position.y = -0.62;
    armGroup.add(hand);

    return armGroup;
  }

  buildLeg(side, pantsMat, soleMat, upperMat) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.18, 0.95, 0);

    // Thigh & Calf (Tapered)
    const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.85, 12), pantsMat);
    legMesh.position.y = -0.42;
    legMesh.castShadow = true;
    legGroup.add(legMesh);

    // Chunky Designer Sneaker
    const sneakerGroup = new THREE.Group();
    sneakerGroup.position.set(0, -0.88, 0.06);

    // White chunky sculpted sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.44), soleMat);
    sole.position.y = 0.05;
    sneakerGroup.add(sole);

    // Upper shoe
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.38), upperMat);
    upper.position.set(0, 0.14, -0.02);
    sneakerGroup.add(upper);

    legGroup.add(sneakerGroup);
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
      this.camAngleY = Math.max(0.06, Math.min(1.15, this.camAngleY + dy * 0.004));
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    this.domElement.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(2.4, Math.min(8.5, this.camDistance + e.deltaY * 0.005));
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

    // Jump & Gravity
    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }

    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    const nextY = this.position.y + this.velocity.y * dt;

    // AABB Obstacle Collision
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

    if (nextY <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextY;
    }

    // Smooth character rotation
    let diff = this.targetRotation - this.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.rotation += diff * 14 * dt;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
    this.shadowBlob.position.set(this.position.x, 0.015, this.position.z);

    // Natural walk kinematics
    if (isMoving && this.isGrounded) {
      this.walkCycle += dt * speed * 2.5;
      const armSwing = Math.sin(this.walkCycle) * 0.65;
      const legSwing = Math.sin(this.walkCycle) * 0.7;

      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Slight natural vertical bounce and shoulder sway
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
      this.head.position.y = 2.0 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.03;
      this.torso.rotation.z = Math.sin(this.walkCycle) * 0.04;
    } else {
      // Natural idle breathing
      const breath = Math.sin(performance.now() * 0.003) * 0.015;
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.15);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.35 + breath, 0.1);
      this.head.position.y = THREE.MathUtils.lerp(this.head.position.y, 2.0 + breath * 1.5, 0.1);
      this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, 0, 0.1);
    }

    this.updateCamera();
  }

  updateCamera() {
    const targetLook = this.position.clone().add(new THREE.Vector3(0, 1.45, 0));

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
