/**
 * 3D Room Builder & Object Generator for HyFly-4
 * Uses procedural Three.js geometries and stylized PBR materials.
 */
import * as THREE from 'three';

export class RoomBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.lampLight = null;
    this.lampBulb = null;
    this.lampState = true;
    this.radioSpeakerLeft = null;
    this.radioSpeakerRight = null;
    this.steamParticles = null;
    this.screenCanvas = null;
    this.screenCtx = null;
    this.screenTexture = null;
    this.chairGroup = null;
    this.chairRotationSpeed = 0;
  }

  build() {
    this.buildRoomShell();
    this.buildWindow();
    this.buildDesk();
    this.buildChair();
    this.buildMonitors();
    this.buildComputerCase();
    this.buildKeyboardMouse();
    this.buildDeskLamp();
    this.buildRadioBoombox();
    this.buildShelvesAndDecor();
    this.buildCoffeeMug();
    this.buildPlant();
    return this.interactiveObjects;
  }

  buildRoomShell() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle floor grid accent
    const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    grid.position.y = 0.005;
    this.scene.add(grid);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x18202e,
      roughness: 0.85,
      metalness: 0.05
    });

    // Back wall (Z = -5)
    const backWallGeo = new THREE.BoxGeometry(16, 10, 0.4);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 5, -5);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall (X = -8)
    const leftWallGeo = new THREE.BoxGeometry(0.4, 10, 16);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-8, 5, 3);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Baseboards
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const bbBack = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 0.05), baseboardMat);
    bbBack.position.set(0, 0.175, -4.78);
    this.scene.add(bbBack);

    const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 16), baseboardMat);
    bbLeft.position.set(-7.78, 0.175, 3);
    this.scene.add(bbLeft);
  }

  buildWindow() {
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-4.2, 5.5, -4.75);

    // Window Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const frameGeo = new THREE.BoxGeometry(3.6, 3.8, 0.15);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    windowGroup.add(frame);

    // Inner Glass Pane
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      ior: 1.5
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.5), glassMat);
    glass.position.z = 0.08;
    windowGroup.add(glass);

    // Cross bars
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.5, 0.16), frameMat);
    barV.position.z = 0.08;
    windowGroup.add(barV);

    const barH = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.1, 0.16), frameMat);
    barH.position.z = 0.08;
    windowGroup.add(barH);

    // Tag as interactive
    windowGroup.userData = {
      interactive: true,
      name: 'window',
      label: 'Window (Click: Toggle Day / Sunset / Night)'
    };
    this.interactiveObjects.push(windowGroup);
    this.scene.add(windowGroup);
  }

  buildDesk() {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, -2.8);

    // Tabletop
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x241d17, // Deep rich walnut
      roughness: 0.45,
      metalness: 0.05
    });
    const topGeo = new THREE.BoxGeometry(5.2, 0.15, 2.4);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 2.85;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Legs (Matte black metal)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.8 });
    const legGeo = new THREE.BoxGeometry(0.12, 2.8, 2.2);

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-2.4, 1.4, 0);
    leftLeg.castShadow = true;
    deskGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(2.4, 1.4, 0);
    rightLeg.castShadow = true;
    deskGroup.add(rightLeg);

    // Cable tray / back modesty panel
    const panelGeo = new THREE.BoxGeometry(4.8, 0.8, 0.05);
    const panel = new THREE.Mesh(panelGeo, legMat);
    panel.position.set(0, 2.3, -1.0);
    panel.castShadow = true;
    deskGroup.add(panel);

    this.scene.add(deskGroup);
  }

  buildChair() {
    this.chairGroup = new THREE.Group();
    this.chairGroup.position.set(0, 0, -1.2);

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 });

    // Base stem & wheels
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12), chromeMat);
    stem.position.y = 0.7;
    stem.castShadow = true;
    this.chairGroup.add(stem);

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(1.6, 0.2, 1.6);
    const seat = new THREE.Mesh(seatGeo, chairMat);
    seat.position.y = 1.45;
    seat.castShadow = true;
    this.chairGroup.add(seat);

    // Ergonomic curved backrest
    const backGeo = new THREE.BoxGeometry(1.5, 1.8, 0.15);
    const back = new THREE.Mesh(backGeo, chairMat);
    back.position.set(0, 2.4, 0.75);
    back.rotation.x = -0.1;
    back.castShadow = true;
    this.chairGroup.add(back);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.8);
    const leftArm = new THREE.Mesh(armGeo, chairMat);
    leftArm.position.set(-0.85, 1.8, 0.1);
    this.chairGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, chairMat);
    rightArm.position.set(0.85, 1.8, 0.1);
    this.chairGroup.add(rightArm);

    this.chairGroup.userData = {
      interactive: true,
      name: 'chair',
      label: 'Ergonomic Chair (Click: Spin)'
    };
    this.interactiveObjects.push(this.chairGroup);
    this.scene.add(this.chairGroup);
  }

  buildMonitors() {
    const pcGroup = new THREE.Group();
    pcGroup.position.set(0, 2.93, -3.2);

    // Stand Base
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.6), standMat);
    base.position.y = 0.02;
    pcGroup.add(base);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), standMat);
    arm.position.set(0, 0.55, -0.15);
    pcGroup.add(arm);

    // Curved / Ultrawide Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 });
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 0.12), frameMat);
    screenFrame.position.set(0, 1.25, 0);
    screenFrame.castShadow = true;
    pcGroup.add(screenFrame);

    // Animated Canvas for screen display
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 256;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      toneMapped: false
    });

    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(2.88, 1.28), screenMat);
    screenSurface.position.set(0, 1.25, 0.065);
    pcGroup.add(screenSurface);

    pcGroup.userData = {
      interactive: true,
      name: 'pc',
      label: 'Virtual PC (Click: Launch Terminal & Workspace)'
    };
    this.interactiveObjects.push(pcGroup);
    this.scene.add(pcGroup);
  }

  updateScreenCanvas(time) {
    if (!this.screenCtx) return;
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    // Dark terminal background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Top status bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('HYFLY-4 WORKSTATION // ONLINE', 14, 19);

    // Simulated code / telemetry lines
    ctx.fillStyle = '#10b981';
    ctx.font = '12px monospace';
    const lines = [
      `[SYS] Kernel 6.12.4-rt ACTIVE`,
      `[UAV] SITL MAVLink Port: UDP 14550 OK`,
      `[SIM] Attitude: Roll 0.1° | Pitch -0.4°`,
      `[WAYPOINT] Target 04 reached (230m alt)`,
      `[SYNTH] Lo-Fi Audio Chords Synthesized`,
      `>> Press PC screen to open interactive terminal.`
    ];

    const offset = Math.floor(time * 2) % 3;
    lines.forEach((line, i) => {
      if (i === 5) {
        ctx.fillStyle = (Math.sin(time * 5) > 0) ? '#38bdf8' : '#94a3b8';
      } else {
        ctx.fillStyle = (i === offset) ? '#34d399' : '#64748b';
      }
      ctx.fillText(line, 16, 60 + i * 28);
    });

    // Small graphic chart
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 320; x < 490; x += 4) {
      const y = 140 + Math.sin((x + time * 60) * 0.05) * 25 + Math.cos((x * 0.02) + time) * 10;
      if (x === 320) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    this.screenTexture.needsUpdate = true;
  }

  buildComputerCase() {
    const pcCase = new THREE.Group();
    pcCase.position.set(2.2, 1.2, -2.7);

    // Tower chassis
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.8 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.7, 1.6), chassisMat);
    chassis.castShadow = true;
    pcCase.add(chassis);

    // Tempered Glass Side Panel
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.6
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), glassMat);
    glass.position.set(-0.41, 0, 0);
    glass.rotation.y = -Math.PI / 2;
    pcCase.add(glass);

    // Glowing RGB strip inside
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), ledMat);
    led.position.set(-0.35, 0, 0.6);
    pcCase.add(led);

    this.scene.add(pcCase);
  }

  buildKeyboardMouse() {
    const deskTopY = 2.93;

    // Desk Mat / Mousepad
    const matGeo = new THREE.BoxGeometry(2.5, 0.015, 1.0);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const mousepad = new THREE.Mesh(matGeo, matMat);
    mousepad.position.set(0, deskTopY + 0.008, -2.4);
    mousepad.receiveShadow = true;
    this.scene.add(mousepad);

    // Mechanical Keyboard
    const kbGeo = new THREE.BoxGeometry(1.4, 0.045, 0.48);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(-0.25, deskTopY + 0.03, -2.4);
    kb.castShadow = true;
    this.scene.add(kb);

    // Keycaps layer
    const keycapsGeo = new THREE.BoxGeometry(1.34, 0.02, 0.42);
    const keycapsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const keycaps = new THREE.Mesh(keycapsGeo, keycapsMat);
    keycaps.position.set(-0.25, deskTopY + 0.055, -2.4);
    this.scene.add(keycaps);

    // Ergonomic Mouse
    const mouseGeo = new THREE.BoxGeometry(0.22, 0.06, 0.36);
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const mouse = new THREE.Mesh(mouseGeo, mouseMat);
    mouse.position.set(0.85, deskTopY + 0.035, -2.4);
    mouse.castShadow = true;
    this.scene.add(mouse);
  }

  buildDeskLamp() {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-2.0, 2.93, -3.2);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.05, 16), metalMat);
    lampGroup.add(base);

    // Lower Arm
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), metalMat);
    arm1.position.set(0.08, 0.4, 0.08);
    arm1.rotation.z = -0.3;
    lampGroup.add(arm1);

    // Upper Arm
    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), metalMat);
    arm2.position.set(0.25, 0.95, 0.15);
    arm2.rotation.z = 0.5;
    lampGroup.add(arm2);

    // Lamp Shade
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.5 });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 16, 1, true), shadeMat);
    shade.position.set(0.42, 1.15, 0.2);
    shade.rotation.z = Math.PI - 0.7;
    lampGroup.add(shade);

    // Light Bulb
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bulbMat);
    this.lampBulb.position.set(0.42, 1.1, 0.2);
    lampGroup.add(this.lampBulb);

    // PointLight
    this.lampLight = new THREE.PointLight(0xffedd5, 1.8, 6.5, 1.5);
    this.lampLight.position.set(0.42, 1.05, 0.2);
    this.lampLight.castShadow = true;
    lampGroup.add(this.lampLight);

    lampGroup.userData = {
      interactive: true,
      name: 'lamp',
      label: 'Desk Lamp (Click: Toggle Light On/Off)'
    };
    this.interactiveObjects.push(lampGroup);
    this.scene.add(lampGroup);
  }

  toggleLamp() {
    this.lampState = !this.lampState;
    if (this.lampLight) {
      this.lampLight.intensity = this.lampState ? 1.8 : 0;
    }
    if (this.lampBulb) {
      this.lampBulb.material.color.setHex(this.lampState ? 0xfef08a : 0x475569);
    }
    return this.lampState;
  }

  buildRadioBoombox() {
    const radioGroup = new THREE.Group();
    radioGroup.position.set(-1.8, 2.93, -2.1);
    radioGroup.rotation.y = 0.4;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.3), bodyMat);
    body.position.y = 0.21;
    body.castShadow = true;
    radioGroup.add(body);

    // Speaker cones
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    this.radioSpeakerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), speakerMat);
    this.radioSpeakerLeft.rotation.x = Math.PI / 2;
    this.radioSpeakerLeft.position.set(-0.2, 0.2, 0.155);
    radioGroup.add(this.radioSpeakerLeft);

    this.radioSpeakerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), speakerMat);
    this.radioSpeakerRight.rotation.x = Math.PI / 2;
    this.radioSpeakerRight.position.set(0.2, 0.2, 0.155);
    radioGroup.add(this.radioSpeakerRight);

    // Tuning window
    const tunerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tuner = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.08), tunerMat);
    tuner.position.set(0, 0.25, 0.155);
    radioGroup.add(tuner);

    // Antenna
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), chromeMat);
    antenna.position.set(0.3, 0.6, -0.05);
    antenna.rotation.z = -0.3;
    radioGroup.add(antenna);

    radioGroup.userData = {
      interactive: true,
      name: 'radio',
      label: 'Lo-Fi Boombox (Click: Toggle Synth Beats)'
    };
    this.interactiveObjects.push(radioGroup);
    this.scene.add(radioGroup);
  }

  buildShelvesAndDecor() {
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x271f1a, roughness: 0.4 });

    // Upper Shelf
    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.6), shelfMat);
    shelf1.position.set(1.5, 6.2, -4.7);
    shelf1.castShadow = true;
    this.scene.add(shelf1);

    // Lower Shelf
    const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.6), shelfMat);
    shelf2.position.set(1.5, 5.0, -4.7);
    shelf2.castShadow = true;
    this.scene.add(shelf2);

    // Books on shelves
    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
    for (let i = 0; i < 7; i++) {
      const bookMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.5 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55 + (i % 3) * 0.08, 0.42), bookMat);
      book.position.set(0.3 + i * 0.16, 5.35, -4.68);
      book.castShadow = true;
      this.scene.add(book);
    }
  }

  buildCoffeeMug() {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(1.5, 2.93, -2.1);

    // Ceramic Mug
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.24, 16), ceramicMat);
    mug.position.y = 0.12;
    mug.castShadow = true;
    mugGroup.add(mug);

    // Liquid surface
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.3 });
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), coffeeMat);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.22;
    mugGroup.add(coffee);

    // Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16, Math.PI), handleMat);
    handle.position.set(0.13, 0.12, 0);
    handle.rotation.z = -Math.PI / 2;
    mugGroup.add(handle);

    // Animated Steam Particles
    const particleCount = 14;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 0.25 + (i / particleCount) * 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.35
    });

    this.steamParticles = new THREE.Points(geometry, pMat);
    mugGroup.add(this.steamParticles);

    mugGroup.userData = {
      interactive: true,
      name: 'coffee',
      label: 'Coffee Mug (Click: Take a Sip)'
    };
    this.interactiveObjects.push(mugGroup);
    this.scene.add(mugGroup);
  }

  buildPlant() {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(2.0, 2.93, -3.2);

    // Ceramic pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.32, 16), potMat);
    pot.position.y = 0.16;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Soil
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x1f1610, roughness: 0.9 });
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), soilMat);
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.31;
    plantGroup.add(soil);

    // Succulent leaves
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), leafMat);
      leaf.position.set(Math.cos(angle) * 0.1, 0.4, Math.sin(angle) * 0.1);
      leaf.rotation.x = Math.sin(angle) * 0.4;
      leaf.rotation.z = -Math.cos(angle) * 0.4;
      plantGroup.add(leaf);
    }

    this.scene.add(plantGroup);
  }

  spinChair() {
    this.chairRotationSpeed = 0.25;
  }

  update(time, audioPlaying) {
    this.updateScreenCanvas(time);

    // Steam particles rising
    if (this.steamParticles) {
      const positions = this.steamParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.003;
        positions[i] += Math.sin(time * 3 + i) * 0.0008;
        if (positions[i + 1] > 0.75) {
          positions[i + 1] = 0.25;
        }
      }
      this.steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Radio speaker vibration if music is playing
    if (audioPlaying && this.radioSpeakerLeft && this.radioSpeakerRight) {
      const scale = 1 + Math.sin(time * 24) * 0.06;
      this.radioSpeakerLeft.scale.set(scale, 1, scale);
      this.radioSpeakerRight.scale.set(scale, 1, scale);
    }

    // Chair spin damping
    if (this.chairGroup && this.chairRotationSpeed > 0.001) {
      this.chairGroup.rotation.y += this.chairRotationSpeed;
      this.chairRotationSpeed *= 0.96;
    }
  }
}

