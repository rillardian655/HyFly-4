/**
 * High-Fidelity Architectural 3D House Environment for HyFly-4
 * Enhanced materials, procedural textures, chamfered geometries,
 * and realistic modern interior design.
 */
import * as THREE from 'three';
import { create3DNameBanner } from './text3d.js';
import { TextureGenerator } from './textures.js';

export class HouseBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.colliders = [];

    // Procedural textures
    this.parquetTex = TextureGenerator.createParquetFloor();
    this.walnutTex = TextureGenerator.createWalnutDesk();
    this.marbleTex = TextureGenerator.createMarbleCounter();
    this.fabricTex = TextureGenerator.createFabricSofa();

    // States
    this.lampLight = null;
    this.lampBulb = null;
    this.lampState = true;

    this.floorLampLight = null;
    this.floorLampBulb = null;
    this.floorLampState = true;

    this.tvState = true;
    this.tvCanvas = null;
    this.tvCtx = null;
    this.tvTexture = null;
    this.tvChannel = 0;

    this.fridgeDoor = null;
    this.fridgeOpen = false;
    this.fridgeLight = null;

    this.stoveFlameLight = null;
    this.stoveFlameMesh = null;
    this.stoveState = false;

    this.radioSpeakerLeft = null;
    this.radioSpeakerRight = null;
    this.steamParticles = null;

    this.screenCanvas = null;
    this.screenCtx = null;
    this.screenTexture = null;

    this.pcFanMesh1 = null;
    this.pcFanMesh2 = null;
  }

  build() {
    this.buildHouseArchitecture();
    this.buildStudioZone();
    this.buildLivingRoomZone();
    this.buildKitchenZone();
    this.buildNameBannerZone();
    return {
      interactive: this.interactiveObjects,
      colliders: this.colliders
    };
  }

  addCollider(mesh, padding = 0.1) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    box.min.x -= padding;
    box.min.z -= padding;
    box.max.x += padding;
    box.max.z += padding;
    this.colliders.push(box);
  }

  /* =========================================================================
     ARCHITECTURE & STRUCTURE
     ========================================================================= */
  buildHouseArchitecture() {
    // 1. Luxury Hardwood Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(28, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.parquetTex,
      roughness: 0.35,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Perimeter Walls with Baseboards & Crown Moldings
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x171f2c, // Warm Scandinavian Deep Navy
      roughness: 0.85
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0b1019,
      roughness: 0.5
    });

    // North Wall (Z = -14)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.4), wallMat);
    northWall.position.set(0, 4, -14);
    northWall.receiveShadow = true;
    this.scene.add(northWall);
    this.addCollider(northWall);

    // South Wall (Z = 14)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.4), wallMat);
    southWall.position.set(0, 4, 14);
    southWall.receiveShadow = true;
    this.scene.add(southWall);
    this.addCollider(southWall);

    // West Wall (X = -14)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 28), wallMat);
    westWall.position.set(-14, 4, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);
    this.addCollider(westWall);

    // East Wall (X = 14)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 28), wallMat);
    eastWall.position.set(14, 4, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    this.addCollider(eastWall);

    // Baseboards around walls
    const bbN = new THREE.Mesh(new THREE.BoxGeometry(28, 0.35, 0.06), trimMat);
    bbN.position.set(0, 0.175, -13.77);
    this.scene.add(bbN);

    // 3. Interior Partition Walls
    // Partition 1: Separating Studio & Kitchen (Z = 0, West side)
    const part1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.5, 0.35), wallMat);
    part1.position.set(-8.75, 3.75, 0);
    this.scene.add(part1);
    this.addCollider(part1);

    // Partition 2 & 3: Central Wall dividing West wing and East Living Room
    const partNorth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 9.5), wallMat);
    partNorth.position.set(0, 3.75, -9.25);
    this.scene.add(partNorth);
    this.addCollider(partNorth);

    const partSouth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 8.5), wallMat);
    partSouth.position.set(0, 3.75, 9.75);
    this.scene.add(partSouth);
    this.addCollider(partSouth);

    // Architectural Panoramic Windows
    this.buildArchitecturalWindow(-7, 5.0, -13.8);
    this.buildArchitecturalWindow(7, 5.0, -13.8);
  }

  buildArchitecturalWindow(x, y, z) {
    const winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.8 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.2, 0.22), frameMat);
    winGroup.add(frame);

    // Inner mullions (grids)
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 0.18), frameMat);
    mullionH.position.z = 0.05;
    winGroup.add(mullionH);

    const mullionV1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.0, 0.18), frameMat);
    mullionV1.position.set(-1.5, 0, 0.05);
    winGroup.add(mullionV1);

    const mullionV2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.0, 0.18), frameMat);
    mullionV2.position.set(1.5, 0, 0.05);
    winGroup.add(mullionV2);

    // Physical Glass with IOR & Transmission
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.85,
      ior: 1.52
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.0), glassMat);
    glass.position.z = 0.06;
    winGroup.add(glass);

    winGroup.userData = {
      interactive: true,
      name: 'window',
      label: 'Panoramic Window (Press [E]: Cycle Sky Mode)'
    };
    this.interactiveObjects.push(winGroup);
    this.scene.add(winGroup);
  }

  /* =========================================================================
     ZONE 1: WORKSTATION / CYBER STUDIO
     ========================================================================= */
  buildStudioZone() {
    const zX = -7.0;
    const zZ = -7.0;

    // Premium Walnut Desk with chamfered edge
    const deskGroup = new THREE.Group();
    deskGroup.position.set(zX, 0, zZ);

    const topMat = new THREE.MeshStandardMaterial({
      map: this.walnutTex,
      roughness: 0.4,
      metalness: 0.05
    });
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.18, 2.5), topMat);
    top.position.y = 2.85;
    top.castShadow = true;
    deskGroup.add(top);

    // Matte Black Steel Desk Frame
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.85, roughness: 0.3 });
    const legGeo = new THREE.BoxGeometry(0.14, 2.76, 2.3);

    const legL = new THREE.Mesh(legGeo, steelMat);
    legL.position.set(-2.5, 1.38, 0);
    deskGroup.add(legL);

    const legR = new THREE.Mesh(legGeo, steelMat);
    legR.position.set(2.5, 1.38, 0);
    deskGroup.add(legR);

    // Cable organizer tray
    const tray = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 0.4), steelMat);
    tray.position.set(0, 2.4, -0.9);
    deskGroup.add(tray);

    this.scene.add(deskGroup);
    this.addCollider(deskGroup);

    // Ultrawide Curved OLED Monitor
    this.buildOledMonitor(zX, 2.94, zZ - 0.4);

    // Mechanical Keyboard & Gaming Mouse
    this.buildMechanicalKeyboard(zX - 0.25, 2.94, zZ + 0.35);

    // Custom Glass PC Tower with Spinning RGB Fans
    this.buildCustomPcChassis(zX + 2.2, 2.94, zZ - 0.4);

    // Articulated Desk Lamp
    this.buildDeskLamp(zX - 2.1, 2.94, zZ - 0.3);

    // Retro Boombox
    this.buildHiFiBoombox(zX - 1.9, 2.94, zZ + 0.6);

    // Steaming Ceramic Mug
    this.buildCoffeeMug(zX + 1.5, 2.94, zZ + 0.5);

    // Floating Bookshelves
    this.buildModernBookshelf(zX, 5.2, -13.7);
  }

  buildOledMonitor(x, y, z) {
    const pcGroup = new THREE.Group();
    pcGroup.position.set(x, y, z);

    const aluminumMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });

    // Monitor Arm / Articulated Mount
    const mountBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 16), aluminumMat);
    mountBase.position.y = 0.04;
    pcGroup.add(mountBase);

    const armStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 12), aluminumMat);
    armStem.position.set(0, 0.6, -0.2);
    pcGroup.add(armStem);

    // Curved Panel Housing
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.3 });
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.5, 0.08), bezelMat);
    screenFrame.position.set(0, 1.35, 0);
    screenFrame.castShadow = true;
    pcGroup.add(screenFrame);

    // Rear Ambient Glow (Simulating Philips Ambilight)
    const backGlow = new THREE.PointLight(0x38bdf8, 1.5, 4.5);
    backGlow.position.set(0, 1.35, -0.4);
    pcGroup.add(backGlow);

    // Screen Canvas
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 512;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTexture, toneMapped: false });
    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(3.52, 1.42), screenMat);
    screenSurface.position.set(0, 1.35, 0.045);
    pcGroup.add(screenSurface);

    pcGroup.userData = {
      interactive: true,
      name: 'pc',
      label: 'Workstation Terminal (Press [E] or Click to Launch)'
    };
    this.interactiveObjects.push(pcGroup);
    this.scene.add(pcGroup);
  }

  buildMechanicalKeyboard(x, y, z) {
    const kbGroup = new THREE.Group();
    kbGroup.position.set(x, y, z);

    // Leather Desk Pad
    const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.015, 1.2), padMat);
    pad.position.y = 0.008;
    pad.receiveShadow = true;
    kbGroup.add(pad);

    // Angled Keyboard Case
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
    const kbBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.52), caseMat);
    kbBody.position.set(0, 0.035, 0);
    kbBody.rotation.x = 0.08;
    kbGroup.add(kbBody);

    // Keycaps Plate
    const keycapsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const keyPlate = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.03, 0.46), keycapsMat);
    keyPlate.position.set(0, 0.065, 0);
    keyPlate.rotation.x = 0.08;
    kbGroup.add(keyPlate);

    // Ergonomic Mouse with Glowing Scroll Wheel
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 });
    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.38), mouseMat);
    mouse.position.set(0.95, 0.045, 0.05);
    kbGroup.add(mouse);

    const scrollWheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    scrollWheel.rotation.z = Math.PI / 2;
    scrollWheel.position.set(0.95, 0.085, -0.06);
    kbGroup.add(scrollWheel);

    this.scene.add(kbGroup);
  }

  buildCustomPcChassis(x, y, z) {
    const pc = new THREE.Group();
    pc.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 1.7), metalMat);
    body.position.y = 0.9;
    body.castShadow = true;
    pc.add(body);

    // Tempered Glass Side
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.6),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, transmission: 0.7 })
    );
    glass.position.set(-0.43, 0.9, 0);
    glass.rotation.y = -Math.PI / 2;
    pc.add(glass);

    // Animated RGB Fan Blades
    const fanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.pcFanMesh1 = new THREE.Mesh(new THREE.CircleGeometry(0.22, 4), fanMat);
    this.pcFanMesh1.position.set(-0.35, 1.35, 0.4);
    this.pcFanMesh1.rotation.y = -Math.PI / 2;
    pc.add(this.pcFanMesh1);

    this.pcFanMesh2 = new THREE.Mesh(new THREE.CircleGeometry(0.22, 4), fanMat);
    this.pcFanMesh2.position.set(-0.35, 0.75, 0.4);
    this.pcFanMesh2.rotation.y = -Math.PI / 2;
    pc.add(this.pcFanMesh2);

    this.scene.add(pc);
  }

  buildDeskLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 20), brassMat);
    lamp.add(base);

    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 10), brassMat);
    stem1.position.set(0.08, 0.42, 0.05);
    stem1.rotation.z = -0.3;
    lamp.add(stem1);

    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 10), brassMat);
    stem2.position.set(0.28, 0.98, 0.1);
    stem2.rotation.z = 0.52;
    lamp.add(stem2);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.42, 20, 1, true), brassMat);
    shade.position.set(0.46, 1.2, 0.14);
    shade.rotation.z = Math.PI - 0.7;
    lamp.add(shade);

    this.lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    this.lampBulb.position.set(0.46, 1.15, 0.14);
    lamp.add(this.lampBulb);

    this.lampLight = new THREE.PointLight(0xffedd5, 2.0, 7.5, 1.5);
    this.lampLight.position.set(0.46, 1.1, 0.14);
    this.lampLight.castShadow = true;
    lamp.add(this.lampLight);

    lamp.userData = {
      interactive: true,
      name: 'lamp',
      label: 'Brass Desk Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
  }

  buildHiFiBoombox(x, y, z) {
    const radio = new THREE.Group();
    radio.position.set(x, y, z);
    radio.rotation.y = 0.35;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.44, 0.32), bodyMat);
    body.position.y = 0.22;
    radio.add(body);

    const coneMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6 });
    this.radioSpeakerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), coneMat);
    this.radioSpeakerLeft.rotation.x = Math.PI / 2;
    this.radioSpeakerLeft.position.set(-0.22, 0.22, 0.165);
    radio.add(this.radioSpeakerLeft);

    this.radioSpeakerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), coneMat);
    this.radioSpeakerRight.rotation.x = Math.PI / 2;
    this.radioSpeakerRight.position.set(0.22, 0.22, 0.165);
    radio.add(this.radioSpeakerRight);

    radio.userData = {
      interactive: true,
      name: 'radio',
      label: 'Hi-Fi Audio Boombox (Press [E]: Toggle Lo-Fi)'
    };
    this.interactiveObjects.push(radio);
    this.scene.add(radio);
  }

  buildCoffeeMug(x, y, z) {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(x, y, z);

    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.1, 0.26, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.05 })
    );
    mug.position.y = 0.13;
    mugGroup.add(mug);

    // Steam particles
    const particleCount = 18;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.09;
      positions[i * 3 + 1] = 0.25 + (i / particleCount) * 0.45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.09;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.steamParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.4 }));
    mugGroup.add(this.steamParticles);

    mugGroup.userData = {
      interactive: true,
      name: 'coffee',
      label: 'Espresso Mug (Press [E]: Take a Sip)'
    };
    this.interactiveObjects.push(mugGroup);
    this.scene.add(mugGroup);
  }

  buildModernBookshelf(x, y, z) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 0.65), woodMat);
    shelf.position.set(x, y, z);
    this.scene.add(shelf);

    const palette = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4];
    for (let i = 0; i < 11; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.65 + (i % 3) * 0.12, 0.48),
        new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.4 })
      );
      book.position.set(x - 1.8 + i * 0.26, y + 0.4, z);
      this.scene.add(book);
    }
  }

  /* =========================================================================
     ZONE 2: LIVING ROOM (RUANG TAMU)
     ========================================================================= */
  buildLivingRoomZone() {
    const zX = 7.0;
    const zZ = -5.0;

    // Soft Designer Rug
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.02, 6.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
    );
    rug.position.set(zX, 0.01, zZ);
    this.scene.add(rug);

    // Sectional L-Sofa with Textured Fabric & Rounded Cushions
    const sofa = new THREE.Group();
    sofa.position.set(zX, 0, zZ - 1.2);

    const sofaMat = new THREE.MeshStandardMaterial({
      map: this.fabricTex,
      roughness: 0.8
    });
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.7
    });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.52, 1.9), sofaMat);
    base.position.y = 0.26;
    sofa.add(base);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.25, 0.45), sofaMat);
    back.position.set(0, 1.05, -0.72);
    sofa.add(back);

    // Chaise lounge section
    const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.52, 2.4), sofaMat);
    chaise.position.set(-1.7, 0.26, 1.35);
    sofa.add(chaise);

    // Rounded soft cushions
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 1.25), cushionMat);
      c.position.set(-1.25 + i * 1.35, 0.6, 0.12);
      sofa.add(c);
    }

    // Mid-Century Walnut Wooden Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x271f1a, roughness: 0.4 });
    for (const [lx, lz] of [[-2.4, -0.8], [2.4, -0.8], [-2.4, 1.8], [2.4, 0.8]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.25, 10), legMat);
      leg.position.set(lx, 0.12, lz);
      sofa.add(leg);
    }

    sofa.userData = {
      interactive: true,
      name: 'sofa',
      label: 'Plush Sectional Sofa (Press [E]: Sit & Relax)'
    };
    this.interactiveObjects.push(sofa);
    this.scene.add(sofa);
    this.addCollider(sofa);

    // Marble Coffee Table
    const table = new THREE.Group();
    table.position.set(zX + 0.3, 0, zZ + 1.3);

    const marbleTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.09, 1.5),
      new THREE.MeshStandardMaterial({ map: this.marbleTex, roughness: 0.2, metalness: 0.1 })
    );
    marbleTop.position.y = 0.65;
    table.add(marbleTop);

    const brassLegMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    for (const [tx, tz] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.65, 10), brassLegMat);
      leg.position.set(tx, 0.32, tz);
      table.add(leg);
    }

    this.scene.add(table);
    this.addCollider(table);

    // 85-Inch Smart TV
    this.buildOledSmartTV(13.7, 3.8, zZ);

    // Standing Tripod Floor Lamp
    this.buildTripodFloorLamp(zX - 2.9, 0, zZ - 2.4);

    // Cozy Fireplace
    this.buildFireplace(13.4, 0, -11.0);
  }

  buildOledSmartTV(x, y, z) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, y, z);
    tvGroup.rotation.y = -Math.PI / 2;

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x050810, metalness: 0.9, roughness: 0.2 });
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 0.1), bezelMat);
    tvGroup.add(tvFrame);

    // TV Ambilight
    const ambilight = new THREE.PointLight(0x38bdf8, 1.8, 6.0);
    ambilight.position.set(0, 0, -0.3);
    tvGroup.add(ambilight);

    this.tvCanvas = document.createElement('canvas');
    this.tvCanvas.width = 1024;
    this.tvCanvas.height = 576;
    this.tvCtx = this.tvCanvas.getContext('2d');
    this.tvTexture = new THREE.CanvasTexture(this.tvCanvas);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(5.04, 2.84),
      new THREE.MeshBasicMaterial({ map: this.tvTexture, toneMapped: false })
    );
    tvScreen.position.z = 0.06;
    tvGroup.add(tvScreen);

    tvGroup.userData = {
      interactive: true,
      name: 'tv',
      label: '85" Smart TV (Press [E]: Switch Channels)'
    };
    this.interactiveObjects.push(tvGroup);
    this.scene.add(tvGroup);
  }

  buildTripodFloorLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x271f1a, roughness: 0.4 });
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });

    // Tripod legs
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 4.2, 10), woodMat);
      leg.position.set(Math.cos(angle) * 0.45, 2.1, Math.sin(angle) * 0.45);
      leg.rotation.x = Math.sin(angle) * 0.12;
      leg.rotation.z = -Math.cos(angle) * 0.12;
      lamp.add(leg);
    }

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.75, 20), shadeMat);
    shade.position.y = 4.2;
    lamp.add(shade);

    this.floorLampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    this.floorLampBulb.position.y = 4.2;
    lamp.add(this.floorLampBulb);

    this.floorLampLight = new THREE.PointLight(0xffedd5, 2.4, 10.5);
    this.floorLampLight.position.y = 4.2;
    lamp.add(this.floorLampLight);

    lamp.userData = {
      interactive: true,
      name: 'floor_lamp',
      label: 'Tripod Floor Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
    this.addCollider(lamp);
  }

  buildFireplace(x, y, z) {
    const fp = new THREE.Group();
    fp.position.set(x, y, z);
    fp.rotation.y = -Math.PI / 2;

    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 1.3), graniteMat);
    mantle.position.y = 1.0;
    fp.add(mantle);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.9), new THREE.MeshBasicMaterial({ color: 0x050505 }));
    hearth.position.set(0, 0.7, 0.3);
    fp.add(hearth);

    const emberLight = new THREE.PointLight(0xf97316, 1.8, 8);
    emberLight.position.set(0, 0.7, 0.5);
    fp.add(emberLight);

    this.scene.add(fp);
    this.addCollider(fp);
  }

  /* =========================================================================
     ZONE 3: KITCHEN & DINING (DAPUR)
     ========================================================================= */
  buildKitchenZone() {
    const zX = -7.0;
    const zZ = 7.0;

    // Kitchen Island with Calacatta Marble Countertop
    const island = new THREE.Group();
    island.position.set(zX, 0, zZ);

    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const marbleMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      roughness: 0.2,
      metalness: 0.1
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.65, 2.3), cabinetMat);
    base.position.y = 1.32;
    island.add(base);

    // Countertop with bevel
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 2.5), marbleMat);
    top.position.y = 2.74;
    top.castShadow = true;
    island.add(top);

    // Chrome Sink & Gooseneck Faucet
    const sinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const sink = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.95), sinkMat);
    sink.position.set(-1.4, 2.83, 0);
    island.add(sink);

    const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 10, 20, Math.PI), sinkMat);
    faucet.position.set(-1.4, 3.15, -0.3);
    faucet.rotation.z = Math.PI;
    island.add(faucet);

    // Cast-Iron Induction / Gas Range
    const stoveMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
    const stove = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.035, 1.05), stoveMat);
    stove.position.set(1.3, 2.84, 0);
    island.add(stove);

    // Heavy Burner Grates
    for (let i = 0; i < 2; i++) {
      const grate = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.22, 20), stoveMat);
      grate.rotation.x = -Math.PI / 2;
      grate.position.set(0.95 + i * 0.7, 2.86, 0);
      island.add(grate);
    }

    // Dynamic Blue Flame
    this.stoveFlameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.32, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.stoveFlameMesh.position.set(0.95, 3.02, 0);
    this.stoveFlameMesh.visible = false;
    island.add(this.stoveFlameMesh);

    this.stoveFlameLight = new THREE.PointLight(0x38bdf8, 0, 4.5);
    this.stoveFlameLight.position.set(0.95, 3.05, 0);
    island.add(this.stoveFlameLight);

    island.userData = {
      interactive: true,
      name: 'stove',
      label: 'Kitchen Stove Range (Press [E]: Ignite Flame)'
    };
    this.interactiveObjects.push(island);
    this.scene.add(island);
    this.addCollider(island);

    // French-Door Stainless Steel Refrigerator
    this.buildStainlessRefrigerator(zX - 5.5, 0, zZ);

    // Designer Bar Stools with Leather Seats
    for (let i = 0; i < 3; i++) {
      this.buildBarStool(zX - 1.6 + i * 1.6, 0, zZ + 1.9);
    }
  }

  buildStainlessRefrigerator(x, y, z) {
    const fridge = new THREE.Group();
    fridge.position.set(x, 0, z);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.4, 1.9), steelMat);
    body.position.y = 2.7;
    fridge.add(body);

    // Door Hinged
    this.fridgeDoor = new THREE.Group();
    this.fridgeDoor.position.set(0.95, 0, 0.95);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.35, 0.16), steelMat);
    doorLeaf.position.set(-0.95, 2.7, 0);
    this.fridgeDoor.add(doorLeaf);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    handle.position.set(-1.7, 2.7, 0.14);
    this.fridgeDoor.add(handle);

    fridge.add(this.fridgeDoor);

    this.fridgeLight = new THREE.PointLight(0xe0f2fe, 0, 3.5);
    this.fridgeLight.position.set(0, 2.7, 0.4);
    fridge.add(this.fridgeLight);

    fridge.userData = {
      interactive: true,
      name: 'fridge',
      label: 'Smart Refrigerator (Press [E]: Open Door)'
    };
    this.interactiveObjects.push(fridge);
    this.scene.add(fridge);
    this.addCollider(fridge);
  }

  buildBarStool(x, y, z) {
    const stool = new THREE.Group();
    stool.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Caramel leather

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 10), metalMat);
    stem.position.y = 0.85;
    stool.add(stem);

    // Footrest ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 16), metalMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.65;
    stool.add(ring);

    // Curved saddle seat
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.14, 20), seatMat);
    seat.position.y = 1.77;
    stool.add(seat);

    this.scene.add(stool);
    this.addCollider(stool, 0.05);
  }

  /* =========================================================================
     ZONE 4: SHOWCASE BANNER "XIANLY RUNA"
     ========================================================================= */
  buildNameBannerZone() {
    // High-resolution extruded vector 3D lettering banner
    const banner = create3DNameBanner("XIANLY RUNA", new THREE.Vector3(0.24, 4.9, 0));
    banner.rotation.y = Math.PI / 2;
    this.scene.add(banner);
  }

  /* =========================================================================
     INTERACTIONS & UPDATES
     ========================================================================= */
  toggleLamp() {
    this.lampState = !this.lampState;
    if (this.lampLight) this.lampLight.intensity = this.lampState ? 2.0 : 0;
    if (this.lampBulb) this.lampBulb.material.color.setHex(this.lampState ? 0xfef08a : 0x475569);
    return this.lampState;
  }

  toggleFloorLamp() {
    this.floorLampState = !this.floorLampState;
    if (this.floorLampLight) this.floorLampLight.intensity = this.floorLampState ? 2.4 : 0;
    if (this.floorLampBulb) this.floorLampBulb.material.color.setHex(this.floorLampState ? 0xfef08a : 0x475569);
    return this.floorLampState;
  }

  toggleTV() {
    this.tvChannel = (this.tvChannel + 1) % 2;
    return this.tvChannel;
  }

  toggleFridge() {
    this.fridgeOpen = !this.fridgeOpen;
    if (this.fridgeLight) this.fridgeLight.intensity = this.fridgeOpen ? 1.8 : 0;
    return this.fridgeOpen;
  }

  toggleStove() {
    this.stoveState = !this.stoveState;
    if (this.stoveFlameMesh) this.stoveFlameMesh.visible = this.stoveState;
    if (this.stoveFlameLight) this.stoveFlameLight.intensity = this.stoveState ? 1.6 : 0;
    return this.stoveState;
  }

  updateScreenCanvas(time) {
    if (!this.screenCtx) return;
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 44);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('HYFLY-4 WORKSTATION // ARCHITECT: XIANLY RUNA', 24, 30);

    ctx.fillStyle = '#10b981';
    ctx.font = '18px monospace';
    const lines = [
      `[SYS] Kernel 6.12.4-rt ACTIVE`,
      `[UAV] SITL MAVLink Port: UDP 14550 OK`,
      `[SIM] Attitude: Roll 0.1° | Pitch -0.4°`,
      `[NAV] Waypoint 04 reached (230m altitude)`,
      `[SYNTH] Procedural Lo-Fi Chords Active`,
      `>> Press [E] or Click to open interactive terminal.`
    ];

    const offset = Math.floor(time * 2) % 3;
    lines.forEach((line, i) => {
      ctx.fillStyle = (i === 5)
        ? (Math.sin(time * 5) > 0 ? '#38bdf8' : '#94a3b8')
        : (i === offset ? '#34d399' : '#64748b');
      ctx.fillText(line, 24, 95 + i * 42);
    });

    // Waveform
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 620; x < 980; x += 6) {
      const y = 260 + Math.sin((x + time * 60) * 0.04) * 45 + Math.cos(x * 0.02 + time) * 20;
      if (x === 620) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    this.screenTexture.needsUpdate = true;
  }

  updateTVCanvas(time) {
    if (!this.tvCtx) return;
    const ctx = this.tvCtx;
    const w = this.tvCanvas.width;
    const h = this.tvCanvas.height;

    if (this.tvChannel === 0) {
      // Channel 01: Synthwave Horizon Flight
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#581c87');
      grad.addColorStop(0.5, '#e11d48');
      grad.addColorStop(1, '#f97316');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Glowing Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.55, 120, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Grid
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      for (let i = 0; i < w; i += 48) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.65);
        ctx.lineTo(i * 2 - w / 2, h);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('HYFLY BROADCAST // CH.01 SYNTHWAVE HORIZON', 32, 50);
    } else {
      // Channel 02: Tactical Drone Radar
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 140, 0, Math.PI * 2);
      ctx.stroke();

      const sweep = time * 3.5;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(sweep) * 140, h / 2 + Math.sin(sweep) * 140);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('TACTICAL UAV RADAR // CH.02 AUTONOMOUS FLIGHT', 50, 75);
      ctx.fillText('ALT: 245m   SPEED: 22.4 m/s   HEADING: 178°', 50, h - 60);
    }

    this.tvTexture.needsUpdate = true;
  }

  update(time, audioPlaying) {
    this.updateScreenCanvas(time);
    this.updateTVCanvas(time);

    // PC Chassis fan rotation
    if (this.pcFanMesh1 && this.pcFanMesh2) {
      this.pcFanMesh1.rotation.z = time * 12;
      this.pcFanMesh2.rotation.z = time * 12;
    }

    // Steam particles
    if (this.steamParticles) {
      const positions = this.steamParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.003;
        positions[i] += Math.sin(time * 3 + i) * 0.0008;
        if (positions[i + 1] > 0.8) {
          positions[i + 1] = 0.25;
        }
      }
      this.steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Boombox speaker pulse
    if (audioPlaying && this.radioSpeakerLeft && this.radioSpeakerRight) {
      const scale = 1 + Math.sin(time * 24) * 0.08;
      this.radioSpeakerLeft.scale.set(scale, 1, scale);
      this.radioSpeakerRight.scale.set(scale, 1, scale);
    }

    // Fridge door smooth swing
    if (this.fridgeDoor) {
      const targetAngle = this.fridgeOpen ? 1.45 : 0;
      this.fridgeDoor.rotation.y = THREE.MathUtils.lerp(this.fridgeDoor.rotation.y, targetAngle, 0.1);
    }

    // Stove flame flicker
    if (this.stoveState && this.stoveFlameMesh) {
      this.stoveFlameMesh.scale.y = 1 + Math.sin(time * 30) * 0.28;
    }
  }
}
