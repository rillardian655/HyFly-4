/**
 * Architectural Scandinavian & Japandi 3D Residence for HyFly-4
 * Enhanced Multi-Room Interior:
 * 1. Creative Studio & Workstation
 * 2. Scandinavian Living Room with Fireplace & OLED TV
 * 3. Modern Kitchen with Refrigerator & Gas Cooktop
 * 4. Cozy Master Bedroom with Platform Bed
 * 5. Architectural Ceiling Fans, Framed Wall Art & Contact Shadows
 * 6. Central Feature Wall with 3D Brass Typography "XIANLY RUNA"
 */
import * as THREE from 'three';
import { create3DNameBanner } from './text3d.js';
import { TextureGenerator } from './textures.js';

export class HouseBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.colliders = [];

    // Natural textures
    this.oakFloorTex = TextureGenerator.createNaturalOakFloor();
    this.oakWoodTex = TextureGenerator.createNaturalWoodDesk();
    this.quartzTex = TextureGenerator.createQuartzCounter();
    this.linenTex = TextureGenerator.createLinenFabric();
    this.artTex1 = TextureGenerator.createAbstractArt(1);
    this.artTex2 = TextureGenerator.createAbstractArt(2);
    this.shadowTex = TextureGenerator.createFloorContactShadow();

    // Appliance, Water & Fan states
    this.lampLight = null;
    this.lampBulb = null;
    this.lampState = true;

    this.floorLampLight = null;
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

    this.waterStream = null;
    this.waterRunning = false;

    this.ceilingFan1 = null;
    this.ceilingFan2 = null;

    this.radioSpeaker = null;
    this.steamParticles = null;

    this.screenCanvas = null;
    this.screenCtx = null;
    this.screenTexture = null;
  }

  build() {
    this.buildHouseArchitecture();
    this.buildStudioZone();
    this.buildLivingRoomZone();
    this.buildKitchenZone();
    this.buildBedroomZone();
    this.buildNameBannerZone();
    this.buildCeilingFans();
    this.buildFramedArtwork();
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

  addContactShadow(x, z, width, length, opacity = 0.35) {
    const shadowGeo = new THREE.PlaneGeometry(width, length);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTex,
      transparent: true,
      opacity: opacity,
      depthWrite: false
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.012, z);
    this.scene.add(shadow);
  }

  /* =========================================================================
     ARCHITECTURE (SCANDINAVIAN STRUCTURE)
     ========================================================================= */
  buildHouseArchitecture() {
    // 1. Natural Light Oak Floor
    const floorGeo = new THREE.PlaneGeometry(28, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.oakFloorTex,
      roughness: 0.45,
      metalness: 0.02
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Warm Off-White / Greige Plaster Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2d8,
      roughness: 0.9
    });
    const oakTrimMat = new THREE.MeshStandardMaterial({
      color: 0x9c7d58,
      roughness: 0.6
    });

    // Perimeter Walls
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.4), wallMat);
    northWall.position.set(0, 4, -14);
    northWall.receiveShadow = true;
    this.scene.add(northWall);
    this.addCollider(northWall);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 0.4), wallMat);
    southWall.position.set(0, 4, 14);
    southWall.receiveShadow = true;
    this.scene.add(southWall);
    this.addCollider(southWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 28), wallMat);
    westWall.position.set(-14, 4, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);
    this.addCollider(westWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 28), wallMat);
    eastWall.position.set(14, 4, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    this.addCollider(eastWall);

    // Natural Oak Baseboards
    const bbN = new THREE.Mesh(new THREE.BoxGeometry(28, 0.28, 0.05), oakTrimMat);
    bbN.position.set(0, 0.14, -13.78);
    this.scene.add(bbN);

    // Interior Partition Walls
    const part1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.5, 0.35), wallMat);
    part1.position.set(-8.75, 3.75, 0);
    this.scene.add(part1);
    this.addCollider(part1);

    const partNorth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 9.5), wallMat);
    partNorth.position.set(0, 3.75, -9.25);
    this.scene.add(partNorth);
    this.addCollider(partNorth);

    const partSouth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 8.5), wallMat);
    partSouth.position.set(0, 3.75, 9.75);
    this.scene.add(partSouth);
    this.addCollider(partSouth);

    // Architectural Windows
    this.buildWarmWindow(-7, 4.8, -13.8);
    this.buildWarmWindow(7, 4.8, -13.8);
    this.buildWarmWindow(13.8, 4.8, 7.0, true);
  }

  buildWarmWindow(x, y, z, rotateY = false) {
    const win = new THREE.Group();
    win.position.set(x, y, z);
    if (rotateY) win.rotation.y = -Math.PI / 2;

    const woodFrameMat = new THREE.MeshStandardMaterial({ color: 0x2d241e, roughness: 0.5 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.5, 0.2), woodFrameMat);
    win.add(frame);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.5
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.3), glassMat);
    glass.position.z = 0.06;
    win.add(glass);

    win.userData = {
      interactive: true,
      name: 'window',
      label: 'Large Window (Press [E]: Cycle Sky Mode)'
    };
    this.interactiveObjects.push(win);
    this.scene.add(win);
  }

  /* =========================================================================
     ZONE 1: WORKSTATION / CREATIVE STUDIO (NW)
     ========================================================================= */
  buildStudioZone() {
    const zX = -7.0;
    const zZ = -7.0;

    this.addContactShadow(zX, zZ, 6.0, 3.2, 0.4);

    // Natural Solid Oak Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(zX, 0, zZ);

    const topMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTex,
      roughness: 0.45
    });
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 2.4), topMat);
    top.position.y = 2.85;
    top.castShadow = true;
    deskGroup.add(top);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4, metalness: 0.7 });
    for (const [lx, lz] of [[-2.4, -1.0], [2.4, -1.0], [-2.4, 1.0], [2.4, 1.0]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 2.76, 16), legMat);
      leg.position.set(lx, 1.38, lz);
      deskGroup.add(leg);
    }

    this.scene.add(deskGroup);
    this.addCollider(deskGroup);

    this.buildMinimalistMonitor(zX, 2.93, zZ - 0.4);
    this.buildMinimalKeyboard(zX - 0.2, 2.93, zZ + 0.35);
    this.buildWarmDeskLamp(zX - 2.0, 2.93, zZ - 0.3);
    this.buildVintageWoodRadio(zX - 1.8, 2.93, zZ + 0.6);
    this.buildCoffeeMug(zX + 1.4, 2.93, zZ + 0.5);
    this.buildIndoorPlant(zX + 2.0, 2.93, zZ - 0.4);
    this.buildOakBookshelves(zX, 5.2, -13.7);
  }

  buildMinimalistMonitor(x, y, z) {
    const pcGroup = new THREE.Group();
    pcGroup.position.set(x, y, z);

    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd4d8de, metalness: 0.85, roughness: 0.25 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.02, 0.55), silverMat);
    base.position.y = 0.01;
    pcGroup.add(base);

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.06), silverMat);
    stem.position.set(0, 0.48, -0.15);
    stem.rotation.x = -0.06;
    pcGroup.add(stem);

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.6, 0.06), bezelMat);
    screenFrame.position.set(0, 1.25, 0);
    pcGroup.add(screenFrame);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 512;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTexture, toneMapped: false });
    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(3.34, 1.54), screenMat);
    screenSurface.position.set(0, 1.25, 0.035);
    pcGroup.add(screenSurface);

    pcGroup.userData = {
      interactive: true,
      name: 'pc',
      label: 'Studio Workspace PC (Press [E]: Open Terminal)'
    };
    this.interactiveObjects.push(pcGroup);
    this.scene.add(pcGroup);
  }

  buildMinimalKeyboard(x, y, z) {
    const kb = new THREE.Group();
    kb.position.set(x, y, z);

    const feltMat = new THREE.MeshStandardMaterial({ color: 0x3e3a36, roughness: 0.9 });
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.015, 1.1), feltMat);
    mat.position.y = 0.008;
    mat.receiveShadow = true;
    kb.add(mat);

    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8dce2, metalness: 0.8, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.03, 0.44), silverMat);
    body.position.set(0, 0.025, 0);
    kb.add(body);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.34), silverMat);
    mouse.position.set(0.85, 0.04, 0.04);
    kb.add(mouse);

    this.scene.add(kb);
  }

  buildWarmDeskLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8c6d48, roughness: 0.5 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.85 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), woodMat);
    base.position.y = 0.03;
    lamp.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 10), woodMat);
    stem.position.set(0, 0.58, 0);
    lamp.add(stem);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.55, 20), paperMat);
    shade.position.y = 1.15;
    lamp.add(shade);

    this.lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
    this.lampBulb.position.y = 1.15;
    lamp.add(this.lampBulb);

    this.lampLight = new THREE.PointLight(0xffecd2, 1.8, 6.5, 1.4);
    this.lampLight.position.set(0, 1.15, 0);
    this.lampLight.castShadow = true;
    lamp.add(this.lampLight);

    lamp.userData = {
      interactive: true,
      name: 'lamp',
      label: 'Pleated Desk Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
  }

  buildVintageWoodRadio(x, y, z) {
    const radio = new THREE.Group();
    radio.position.set(x, y, z);
    radio.rotation.y = 0.35;

    const walnutMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.4 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xc8bda8, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.3), walnutMat);
    body.position.y = 0.21;
    radio.add(body);

    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.24), clothMat);
    cloth.position.set(-0.06, 0.22, 0.155);
    radio.add(cloth);

    const brassDial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
    brassDial.rotation.x = Math.PI / 2;
    brassDial.position.set(0.24, 0.28, 0.16);
    radio.add(brassDial);

    this.radioSpeaker = cloth;

    radio.userData = {
      interactive: true,
      name: 'radio',
      label: 'Acoustic Wood Radio (Press [E]: Toggle Music)'
    };
    this.interactiveObjects.push(radio);
    this.scene.add(radio);
  }

  buildCoffeeMug(x, y, z) {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(x, y, z);

    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xede4d8, roughness: 0.3 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.24, 16), ceramicMat);
    mug.position.y = 0.12;
    mugGroup.add(mug);

    const corkMat = new THREE.MeshStandardMaterial({ color: 0x9c7a54, roughness: 0.9 });
    const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16), corkMat);
    coaster.position.y = 0.01;
    mugGroup.add(coaster);

    const particleCount = 14;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 0.24 + (i / particleCount) * 0.42;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.steamParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.35 }));
    mugGroup.add(this.steamParticles);

    mugGroup.userData = {
      interactive: true,
      name: 'coffee',
      label: 'Espresso Mug (Press [E]: Take a Sip)'
    };
    this.interactiveObjects.push(mugGroup);
    this.scene.add(mugGroup);
  }

  buildIndoorPlant(x, y, z) {
    const plant = new THREE.Group();
    plant.position.set(x, y, z);

    const potMat = new THREE.MeshStandardMaterial({ color: 0xc47b59, roughness: 0.8 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.35, 16), potMat);
    pot.position.y = 0.175;
    plant.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d6647, roughness: 0.5 });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), leafMat);
      leaf.scale.set(1.4, 0.2, 0.9);
      leaf.position.set(Math.cos(angle) * 0.2, 0.42 + (i % 2) * 0.1, Math.sin(angle) * 0.2);
      leaf.rotation.y = angle;
      leaf.rotation.z = -0.35;
      plant.add(leaf);
    }

    this.scene.add(plant);
  }

  buildOakBookshelves(x, y, z) {
    const oakMat = new THREE.MeshStandardMaterial({ color: 0x8c6d48, roughness: 0.5 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 0.6), oakMat);
    shelf.position.set(x, y, z);
    this.scene.add(shelf);

    const colors = [0x5c4d3c, 0x8a7b6a, 0x48584e, 0x7a6352, 0xd4c5b3];
    for (let i = 0; i < 11; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.6 + (i % 3) * 0.1, 0.44),
        new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.6 })
      );
      book.position.set(x - 1.8 + i * 0.25, y + 0.35, z);
      this.scene.add(book);
    }
  }

  /* =========================================================================
     ZONE 2: SCANDINAVIAN LIVING ROOM (NE)
     ========================================================================= */
  buildLivingRoomZone() {
    const zX = 7.0;
    const zZ = -5.0;

    this.addContactShadow(zX, zZ, 8.0, 7.0, 0.35);

    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.02, 6.5),
      new THREE.MeshStandardMaterial({ color: 0xd6ccc2, roughness: 0.95 })
    );
    rug.position.set(zX, 0.01, zZ);
    this.scene.add(rug);

    const sofa = new THREE.Group();
    sofa.position.set(zX, 0, zZ - 1.2);

    const boucléMat = new THREE.MeshStandardMaterial({
      map: this.linenTex,
      roughness: 0.85
    });
    const woodLegMat = new THREE.MeshStandardMaterial({ color: 0x785a3c, roughness: 0.5 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 1.9), boucléMat);
    base.position.y = 0.25;
    sofa.add(base);

    const back = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 0.45), boucléMat);
    back.position.set(0, 1.05, -0.72);
    sofa.add(back);

    const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 2.4), boucléMat);
    chaise.position.set(-1.7, 0.25, 1.35);
    sofa.add(chaise);

    const pillowMat = new THREE.MeshStandardMaterial({ color: 0x937860, roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), pillowMat);
      c.position.set(-1.25 + i * 1.35, 0.58, 0.12);
      sofa.add(c);
    }

    for (const [lx, lz] of [[-2.4, -0.8], [2.4, -0.8], [-2.4, 1.8], [2.4, 0.8]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.25, 10), woodLegMat);
      leg.position.set(lx, 0.12, lz);
      sofa.add(leg);
    }

    sofa.userData = {
      interactive: true,
      name: 'sofa',
      label: 'Bouclé Sofa (Press [E]: Sit & Relax)'
    };
    this.interactiveObjects.push(sofa);
    this.scene.add(sofa);
    this.addCollider(sofa);

    // Round Solid Oak Coffee Table
    const table = new THREE.Group();
    table.position.set(zX + 0.3, 0, zZ + 1.2);

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 0.08, 32),
      new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.4 })
    );
    tableTop.position.y = 0.65;
    table.add(tableTop);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.65, 10), woodLegMat);
      leg.position.set(Math.cos(a) * 0.9, 0.32, Math.sin(a) * 0.9);
      table.add(leg);
    }

    this.scene.add(table);
    this.addCollider(table);

    this.buildOledMediaConsole(13.6, 0, zZ);
    this.buildPaperFloorLamp(zX - 2.8, 0, zZ - 2.2);
    this.buildNaturalFireplace(13.4, 0, -11.0);
  }

  buildOledMediaConsole(x, y, z) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, y, z);
    tvGroup.rotation.y = -Math.PI / 2;

    const oakMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.45 });
    const credenza = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.1, 1.4), oakMat);
    credenza.position.y = 0.55;
    credenza.castShadow = true;
    tvGroup.add(credenza);

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.7, 0.08), bezelMat);
    tvFrame.position.set(0, 3.2, 0);
    tvGroup.add(tvFrame);

    this.tvCanvas = document.createElement('canvas');
    this.tvCanvas.width = 1024;
    this.tvCanvas.height = 576;
    this.tvCtx = this.tvCanvas.getContext('2d');
    this.tvTexture = new THREE.CanvasTexture(this.tvCanvas);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.68, 2.58),
      new THREE.MeshBasicMaterial({ map: this.tvTexture, toneMapped: false })
    );
    tvScreen.position.set(0, 3.2, 0.045);
    tvGroup.add(tvScreen);

    tvGroup.userData = {
      interactive: true,
      name: 'tv',
      label: 'Smart TV (Press [E]: Switch Channels)'
    };
    this.interactiveObjects.push(tvGroup);
    this.scene.add(tvGroup);
    this.addCollider(tvGroup);
  }

  buildPaperFloorLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const wireMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.7 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.85 });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.8, 8), wireMat);
      leg.position.set(Math.cos(a) * 0.35, 1.9, Math.sin(a) * 0.35);
      lamp.add(leg);
    }

    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 20), paperMat);
    shade.scale.set(1.0, 1.25, 1.0);
    shade.position.y = 3.8;
    lamp.add(shade);

    this.floorLampLight = new THREE.PointLight(0xffeedd, 2.2, 9.5);
    this.floorLampLight.position.y = 3.8;
    lamp.add(this.floorLampLight);

    lamp.userData = {
      interactive: true,
      name: 'floor_lamp',
      label: 'Paper Lantern Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
    this.addCollider(lamp);
  }

  buildNaturalFireplace(x, y, z) {
    const fp = new THREE.Group();
    fp.position.set(x, y, z);
    fp.rotation.y = -Math.PI / 2;

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdcd5ca, roughness: 0.85 });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 1.2), stoneMat);
    mantle.position.y = 1.0;
    fp.add(mantle);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.9), new THREE.MeshBasicMaterial({ color: 0x181512 }));
    hearth.position.set(0, 0.7, 0.3);
    fp.add(hearth);

    const warmLight = new THREE.PointLight(0xf59e0b, 1.6, 7.5);
    warmLight.position.set(0, 0.7, 0.5);
    fp.add(warmLight);

    this.scene.add(fp);
    this.addCollider(fp);
  }

  /* =========================================================================
     ZONE 3: KITCHEN & DINING (SW)
     ========================================================================= */
  buildKitchenZone() {
    const zX = -7.0;
    const zZ = 7.0;

    this.addContactShadow(zX, zZ, 6.2, 3.2, 0.4);

    const island = new THREE.Group();
    island.position.set(zX, 0, zZ);

    const oakBaseMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });
    const quartzMat = new THREE.MeshStandardMaterial({
      map: this.quartzTex,
      roughness: 0.25,
      metalness: 0.05
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.65, 2.3), oakBaseMat);
    base.position.y = 1.32;
    island.add(base);

    const top = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 2.5), quartzMat);
    top.position.y = 2.73;
    top.castShadow = true;
    island.add(top);

    const blackSteel = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.3 });
    const sink = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.95), blackSteel);
    sink.position.set(-1.4, 2.82, 0);
    island.add(sink);

    const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 10, 20, Math.PI), blackSteel);
    faucet.position.set(-1.4, 3.12, -0.3);
    faucet.rotation.z = Math.PI;
    island.add(faucet);

    // Interactive running water jet
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      transmission: 0.8,
      roughness: 0.1
    });
    this.waterStream = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8), waterMat);
    this.waterStream.position.set(-1.4, 2.95, -0.08);
    this.waterStream.visible = false;
    island.add(this.waterStream);

    const stove = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 1.0), blackSteel);
    stove.position.set(1.3, 2.83, 0);
    island.add(stove);

    for (let i = 0; i < 2; i++) {
      const grate = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.22, 20), blackSteel);
      grate.rotation.x = -Math.PI / 2;
      grate.position.set(0.95 + i * 0.7, 2.85, 0);
      island.add(grate);
    }

    this.stoveFlameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.3, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.stoveFlameMesh.position.set(0.95, 3.0, 0);
    this.stoveFlameMesh.visible = false;
    island.add(this.stoveFlameMesh);

    this.stoveFlameLight = new THREE.PointLight(0x38bdf8, 0, 4.0);
    this.stoveFlameLight.position.set(0.95, 3.02, 0);
    island.add(this.stoveFlameLight);

    island.userData = {
      interactive: true,
      name: 'stove',
      label: 'Kitchen Stove Range (Press [E]: Ignite Flame)'
    };
    this.interactiveObjects.push(island);
    this.scene.add(island);
    this.addCollider(island);

    this.buildModernRefrigerator(zX - 5.5, 0, zZ);

    for (let i = 0; i < 3; i++) {
      this.buildWoodCounterStool(zX - 1.6 + i * 1.6, 0, zZ + 1.9);
    }
  }

  buildModernRefrigerator(x, y, z) {
    const fridge = new THREE.Group();
    fridge.position.set(x, y, z);

    const matteWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: 0.35 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x9c7d58, roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.4, 1.9), matteWhiteMat);
    body.position.y = 2.7;
    fridge.add(body);

    this.fridgeDoor = new THREE.Group();
    this.fridgeDoor.position.set(0.95, 0, 0.95);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.35, 0.16), matteWhiteMat);
    doorLeaf.position.set(-0.95, 2.7, 0);
    this.fridgeDoor.add(doorLeaf);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 10), handleMat);
    handle.position.set(-1.7, 2.7, 0.14);
    this.fridgeDoor.add(handle);

    fridge.add(this.fridgeDoor);

    this.fridgeLight = new THREE.PointLight(0xfff3e0, 0, 3.5);
    this.fridgeLight.position.set(0, 2.7, 0.4);
    fridge.add(this.fridgeLight);

    fridge.userData = {
      interactive: true,
      name: 'fridge',
      label: 'Refrigerator (Press [E]: Open Door)'
    };
    this.interactiveObjects.push(fridge);
    this.scene.add(fridge);
    this.addCollider(fridge);
  }

  buildWoodCounterStool(x, y, z) {
    const stool = new THREE.Group();
    stool.position.set(x, y, z);

    const oakMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 10), blackMat);
    stem.position.y = 0.85;
    stool.add(stem);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 16), blackMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.65;
    stool.add(ring);

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.12, 20), oakMat);
    seat.position.y = 1.76;
    stool.add(seat);

    this.scene.add(stool);
    this.addCollider(stool, 0.05);
  }

  /* =========================================================================
     ZONE 4: MASTER BEDROOM NOOK (SE)
     ========================================================================= */
  buildBedroomZone() {
    const zX = 7.0;
    const zZ = 7.0;

    this.addContactShadow(zX, zZ, 6.5, 6.0, 0.4);

    // Platform Oak Bed
    const bedGroup = new THREE.Group();
    bedGroup.position.set(zX, 0, zZ);

    const oakMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xfbf9f5, roughness: 0.8 });
    const duvetMat = new THREE.MeshStandardMaterial({ map: this.linenTex, roughness: 0.9 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xd6ccc2, roughness: 0.85 });

    // Platform base
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 4.8), oakMat);
    bedBase.position.y = 0.225;
    bedBase.castShadow = true;
    bedGroup.add(bedBase);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.0, 0.25), oakMat);
    headboard.position.set(0, 1.0, 2.3);
    bedGroup.add(headboard);

    // Thick mattress
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.55, 4.2), mattressMat);
    mattress.position.set(0, 0.725, -0.15);
    bedGroup.add(mattress);

    // Cozy folded duvet
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.22, 3.2), duvetMat);
    duvet.position.set(0, 1.05, -0.6);
    bedGroup.add(duvet);

    // Sleeping pillows
    for (let i = 0; i < 2; i++) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.9), pillowMat);
      pillow.position.set(-1.1 + i * 2.2, 1.08, 1.4);
      pillow.rotation.x = -0.15;
      bedGroup.add(pillow);
    }

    bedGroup.userData = {
      interactive: true,
      name: 'bed',
      label: 'Platform Bed (Press [E]: Lie Down & Rest)'
    };
    this.interactiveObjects.push(bedGroup);
    this.scene.add(bedGroup);
    this.addCollider(bedGroup);

    // Nightstands on each side
    for (const side of [-1, 1]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 1.0), oakMat);
      stand.position.set(zX + side * 2.8, 0.375, zZ + 1.8);
      this.scene.add(stand);
      this.addCollider(stand);

      // Nightstand lamp
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.04, 16), oakMat);
      lampBase.position.set(zX + side * 2.8, 0.77, zZ + 1.8);
      this.scene.add(lampBase);

      const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.85 })
      );
      lampShade.position.set(zX + side * 2.8, 1.05, zZ + 1.8);
      this.scene.add(lampShade);

      const nightLight = new THREE.PointLight(0xfff0dd, 0.8, 4.5);
      nightLight.position.set(zX + side * 2.8, 1.05, zZ + 1.8);
      this.scene.add(nightLight);
    }
  }

  /* =========================================================================
     ZONE 5: CEILING FANS & FRAMED ARTWORK
     ========================================================================= */
  buildCeilingFans() {
    this.ceilingFan1 = this.createCeilingFan(-7.0, 6.8, -7.0); // Studio
    this.ceilingFan2 = this.createCeilingFan(7.0, 6.8, -5.0);  // Living Room
    this.scene.add(this.ceilingFan1);
    this.scene.add(this.ceilingFan2);
  }

  createCeilingFan(x, y, z) {
    const fan = new THREE.Group();
    fan.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });
    const woodBladeMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });

    // Downrod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), metalMat);
    rod.position.y = -0.35;
    fan.add(rod);

    // Motor Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.16, 20), metalMat);
    hub.position.y = -0.75;
    fan.add(hub);

    // Rotating Blades Group
    const bladesGroup = new THREE.Group();
    bladesGroup.position.y = -0.75;

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.28), woodBladeMat);
      blade.position.set(Math.cos(angle) * 0.95, 0, Math.sin(angle) * 0.95);
      blade.rotation.y = -angle;
      blade.rotation.x = 0.12;
      bladesGroup.add(blade);
    }

    fan.add(bladesGroup);
    fan.blades = bladesGroup;
    return fan;
  }

  buildFramedArtwork() {
    // Gallery Wall Art Piece 1 (Living room wall)
    this.createFramedPainting(9.5, 4.5, -13.72, 2.6, 3.4, this.artTex1);

    // Gallery Wall Art Piece 2 (Corridor entrance)
    this.createFramedPainting(-2.5, 4.5, -0.22, 2.2, 3.0, this.artTex2);
  }

  createFramedPainting(x, y, z, width, height, texture) {
    const frameGroup = new THREE.Group();
    frameGroup.position.set(x, y, z);

    const oakMat = new THREE.MeshStandardMaterial({ color: 0x785a3c, roughness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.08), oakMat);
    frameGroup.add(frame);

    const canvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    canvasMesh.position.z = 0.045;
    frameGroup.add(canvasMesh);

    this.scene.add(frameGroup);
  }

  /* =========================================================================
     ZONE 6: ARCHITECTURAL GALLERY BANNER "XIANLY RUNA"
     ========================================================================= */
  buildNameBannerZone() {
    const banner = create3DNameBanner("XIANLY RUNA", new THREE.Vector3(0.24, 4.9, 0));
    banner.rotation.y = Math.PI / 2;
    this.scene.add(banner);
  }

  /* =========================================================================
     INTERACTION HANDLERS & UPDATES
     ========================================================================= */
  toggleLamp() {
    this.lampState = !this.lampState;
    if (this.lampLight) this.lampLight.intensity = this.lampState ? 1.8 : 0;
    if (this.lampBulb) this.lampBulb.material.color.setHex(this.lampState ? 0xffedd5 : 0x554b42);
    return this.lampState;
  }

  toggleFloorLamp() {
    this.floorLampState = !this.floorLampState;
    if (this.floorLampLight) this.floorLampLight.intensity = this.floorLampState ? 2.2 : 0;
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

  toggleSinkWater() {
    this.waterRunning = !this.waterRunning;
    if (this.waterStream) this.waterStream.visible = this.waterRunning;
    return this.waterRunning;
  }

  updateScreenCanvas(time) {
    if (!this.screenCtx) return;
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#2c2723';
    ctx.fillRect(0, 0, w, 44);
    ctx.fillStyle = '#d4af37';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('STUDIO HYFLY-4 // ARCHITECT: XIANLY RUNA', 24, 30);

    ctx.fillStyle = '#e5ded6';
    ctx.font = '18px monospace';
    const lines = [
      `System: Architectural Studio Workstation`,
      `Ambient Mode: Scandinavian Warm Contemporary`,
      `Design Language: Natural Oak, Quartz & Linen`,
      `Active Audio: Lo-Fi Generative Chords`,
      `Residence: Central Creative Pavilion`,
      `>> Press [E] or Click to open Terminal & Notepad.`
    ];

    const offset = Math.floor(time * 2) % 3;
    lines.forEach((line, i) => {
      ctx.fillStyle = (i === 5)
        ? (Math.sin(time * 5) > 0 ? '#d4af37' : '#948a80')
        : (i === offset ? '#f5eedb' : '#a89c90');
      ctx.fillText(line, 24, 95 + i * 42);
    });

    this.screenTexture.needsUpdate = true;
  }

  updateTVCanvas(time) {
    if (!this.tvCtx) return;
    const ctx = this.tvCtx;
    const w = this.tvCanvas.width;
    const h = this.tvCanvas.height;

    if (this.tvChannel === 0) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#fde68a');
      grad.addColorStop(0.5, '#fb923c');
      grad.addColorStop(1, '#a16207');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.45, 100, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#292524';
      ctx.font = '500 24px sans-serif';
      ctx.fillText('NATURE LOUNGE // GOLDEN HOUR SCENIC STREAM', 32, 50);
    } else {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('ARCHITECTURAL DIGEST // MODERN CONTEMPORARY HOMES', 60, 85);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#e7e5e4';
      ctx.fillText('Featuring work by Lead Designer: Xianly Runa', 60, 130);
    }

    this.tvTexture.needsUpdate = true;
  }

  update(time, audioPlaying) {
    this.updateScreenCanvas(time);
    this.updateTVCanvas(time);

    // Ceiling fans rotation
    if (this.ceilingFan1?.blades) this.ceilingFan1.blades.rotation.y = time * 2.8;
    if (this.ceilingFan2?.blades) this.ceilingFan2.blades.rotation.y = time * 2.8;

    // Steam particles
    if (this.steamParticles) {
      const positions = this.steamParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.003;
        positions[i] += Math.sin(time * 3 + i) * 0.0008;
        if (positions[i + 1] > 0.8) {
          positions[i + 1] = 0.24;
        }
      }
      this.steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Fridge door swing
    if (this.fridgeDoor) {
      const targetAngle = this.fridgeOpen ? 1.45 : 0;
      this.fridgeDoor.rotation.y = THREE.MathUtils.lerp(this.fridgeDoor.rotation.y, targetAngle, 0.1);
    }

    // Stove flame flicker
    if (this.stoveState && this.stoveFlameMesh) {
      this.stoveFlameMesh.scale.y = 1 + Math.sin(time * 30) * 0.25;
    }

    // Water flow animation
    if (this.waterRunning && this.waterStream) {
      this.waterStream.scale.x = 1 + Math.sin(time * 20) * 0.15;
    }
  }
}
