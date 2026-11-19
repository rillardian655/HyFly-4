/**
 * Architectural Scandinavian & Japandi 3D Residence for HyFly-4
 * Human-Scale Proportioned Architecture (Scaled to Elaina 1.62m Height):
 * 1. Creative Studio & Workstation (Ergonomic 75cm Desk, 27" Display, Lo-Fi Radio)
 * 2. Scandinavian Living Room (Low-slung Bouclé Sofa, 65" OLED TV, Fireplace)
 * 3. Modern Kitchen (90cm Quartz Island Counter, 1.85m Refrigerator, Gas Range)
 * 4. Cozy Master Bedroom (Platform Oak Bed, Layered Duvet, Nightstands)
 * 5. Architectural Ceiling with Exposed Oak Rafters & Dual Glass Skylights
 * 6. Exterior Pitched Roof with Contemporary Slate Finish
 * 7. Central Feature Slatted Wall with 3D Brass Typography "XIANLY RUNA"
 */
import * as THREE from 'three';
import { create3DNameBanner } from './text3d.js?v=23.0';
import { TextureGenerator } from './textures.js?v=23.0';

export class HouseBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.colliders = [];

    // Natural PBR textures
    this.oakFloorTex = TextureGenerator.createNaturalOakFloor();
    this.oakFloorBumpTex = TextureGenerator.createNaturalOakFloorBump();
    this.plasterTex = TextureGenerator.createPlasterWallTexture();
    this.plasterBumpTex = TextureGenerator.createPlasterWallBump();
    this.boucleBumpTex = TextureGenerator.createBoucleFabricBump();
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
    this.buildRoofAndCeiling();
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

  addCollider(mesh, padding = 0.08) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    box.min.x -= padding;
    box.min.z -= padding;
    box.max.x += padding;
    box.max.z += padding;
    this.colliders.push(box);
  }

  addContactShadow(x, z, width, length, opacity = 0.28) {
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
     ARCHITECTURE (NATURAL HUMAN SCALE 1:1)
     Room dimensions: 18m x 18m footprint, 3.4m ceiling height
     ========================================================================= */
  buildHouseArchitecture() {
    // 1. Natural Light Oak Plank Flooring with tactile bevel bump
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.oakFloorTex,
      bumpMap: this.oakFloorBumpTex,
      bumpScale: 0.024,
      roughness: 0.22,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Warm Off-White / Greige Plaster Material with subtle trowel bump
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.plasterTex,
      bumpMap: this.plasterBumpTex,
      bumpScale: 0.015,
      roughness: 0.76
    });
    const oakTrimMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTex,
      color: 0x8a6a48,
      roughness: 0.55
    });

    const wallHeight = 3.4;
    const halfH = wallHeight / 2;

    // Perimeter Walls (18m x 18m, height 3.4m)
    // North Wall with Studio & Living Room Windows
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(18.4, wallHeight, 0.3), wallMat);
    northWall.position.set(0, halfH, -9.0);
    northWall.receiveShadow = true;
    northWall.castShadow = true;
    this.scene.add(northWall);
    this.addCollider(northWall);

    // South Wall with Garden Patio Windows
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(18.4, wallHeight, 0.3), wallMat);
    southWall.position.set(0, halfH, 9.0);
    southWall.receiveShadow = true;
    this.scene.add(southWall);
    this.addCollider(southWall);

    // West Wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, 18.4), wallMat);
    westWall.position.set(-9.0, halfH, 0);
    westWall.receiveShadow = true;
    westWall.castShadow = true;
    this.scene.add(westWall);
    this.addCollider(westWall);

    // East Wall with Living Room Glass Doors
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, 18.4), wallMat);
    eastWall.position.set(9.0, halfH, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    this.addCollider(eastWall);

    // Natural Oak Baseboards
    const bbN = new THREE.Mesh(new THREE.BoxGeometry(18, 0.16, 0.04), oakTrimMat);
    bbN.position.set(0, 0.08, -8.83);
    this.scene.add(bbN);

    // Interior Room Partition Walls
    // Partition dividing Studio/Living from Kitchen/Bedroom
    const partWest = new THREE.Mesh(new THREE.BoxGeometry(6.6, wallHeight, 0.22), wallMat);
    partWest.position.set(-5.6, halfH, 0);
    partWest.receiveShadow = true;
    this.scene.add(partWest);
    this.addCollider(partWest);

    const partEast = new THREE.Mesh(new THREE.BoxGeometry(6.6, wallHeight, 0.22), wallMat);
    partEast.position.set(5.6, halfH, 0);
    partEast.receiveShadow = true;
    this.scene.add(partEast);
    this.addCollider(partEast);

    // Large Panoramic Floor-to-Ceiling Windows
    this.buildWarmWindow(-4.5, 1.8, -8.85, 3.2, 2.4);
    this.buildWarmWindow(4.5, 1.8, -8.85, 3.2, 2.4);
    this.buildWarmWindow(8.85, 1.8, -4.5, 3.2, 2.4, true);
    this.buildWarmWindow(8.85, 1.8, 4.5, 3.2, 2.4, true);

    // Outdoor Bamboo Garden Backdrop (Visible through windows)
    this.buildGardenBackdrop();
  }

  /* =========================================================================
     ROOF & CEILING WITH ARCHITECTURAL SKYLIGHTS
     ========================================================================= */
  buildRoofAndCeiling() {
    const ceilingY = 3.4;
    const ceilingMat = new THREE.MeshStandardMaterial({
      map: this.plasterTex,
      roughness: 0.88,
      side: THREE.DoubleSide
    });
    const beamMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTex,
      roughness: 0.5
    });

    // 1. Ceiling Panels with Skylight Openings
    // Studio & North Corridor ceiling
    const ceilNorth = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.12, 6.0), ceilingMat);
    ceilNorth.position.set(0, ceilingY + 0.06, -5.9);
    ceilNorth.receiveShadow = true;
    this.scene.add(ceilNorth);

    // Bedroom & South Corridor ceiling
    const ceilSouth = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.12, 6.0), ceilingMat);
    ceilSouth.position.set(0, ceilingY + 0.06, 5.9);
    ceilSouth.receiveShadow = true;
    this.scene.add(ceilSouth);

    // Central Corridor ceiling bridge
    const ceilMid = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.12, 5.8), ceilingMat);
    ceilMid.position.set(0, ceilingY + 0.06, 0);
    ceilMid.receiveShadow = true;
    this.scene.add(ceilMid);

    // 2. Architectural Skylights (Glass Roof Windows)
    // Over Living Room (x: 5.5, z: 0) and Kitchen (x: -5.5, z: 0)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2f1fc,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      transmission: 0.92,
      ior: 1.52
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x22252d, roughness: 0.4 });

    for (const skylightX of [-5.5, 5.5]) {
      const skylightGroup = new THREE.Group();
      skylightGroup.position.set(skylightX, ceilingY + 0.06, 0);

      const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.2), glassMat);
      glassPane.rotation.x = -Math.PI / 2;
      skylightGroup.add(glassPane);

      // Skylight Frame Borders
      const frameN = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.18, 0.14), frameMat);
      frameN.position.set(0, 0.05, -2.6);
      skylightGroup.add(frameN);

      const frameS = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.18, 0.14), frameMat);
      frameS.position.set(0, 0.05, 2.6);
      skylightGroup.add(frameS);

      const frameW = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 5.2), frameMat);
      frameW.position.set(-2.45, 0.05, 0);
      skylightGroup.add(frameW);

      const frameE = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 5.2), frameMat);
      frameE.position.set(2.45, 0.05, 0);
      skylightGroup.add(frameE);

      this.scene.add(skylightGroup);
    }

    // 3. Exposed Scandinavian Oak Rafters (Timber Beams)
    for (let i = -7; i <= 7; i += 2.8) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 18.0), beamMat);
      beam.position.set(i, ceilingY - 0.09, 0);
      beam.castShadow = true;
      this.scene.add(beam);
    }

    // 4. Exterior Pitched Roof Structure (Contemporary Dark Slate / Standing Seam)
    const roofSlateMat = new THREE.MeshStandardMaterial({
      color: 0x2a2e36,
      roughness: 0.65,
      metalness: 0.15
    });

    // West and East pitched roof planes
    const roofAngle = 0.32; // ~18 deg sleek modern pitch
    const roofLen = 10.2;

    const roofWest = new THREE.Mesh(new THREE.BoxGeometry(roofLen, 0.18, 19.4), roofSlateMat);
    roofWest.position.set(-4.6, ceilingY + 1.25, 0);
    roofWest.rotation.z = roofAngle;
    roofWest.castShadow = true;
    this.scene.add(roofWest);

    const roofEast = new THREE.Mesh(new THREE.BoxGeometry(roofLen, 0.18, 19.4), roofSlateMat);
    roofEast.position.set(4.6, ceilingY + 1.25, 0);
    roofEast.rotation.z = -roofAngle;
    roofEast.castShadow = true;
    this.scene.add(roofEast);

    // Roof Ridge Cap
    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 19.6), roofSlateMat);
    ridgeCap.position.set(0, ceilingY + 2.75, 0);
    this.scene.add(ridgeCap);
  }

  buildWarmWindow(x, y, z, width = 3.2, height = 2.4, rotateY = false) {
    const win = new THREE.Group();
    win.position.set(x, y, z);
    if (rotateY) win.rotation.y = -Math.PI / 2;

    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1d2128, roughness: 0.4 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      transmission: 0.94,
      ior: 1.5
    });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.12), darkSteelMat);
    win.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.14, height - 0.14), glassMat);
    glass.position.z = 0.02;
    win.add(glass);

    win.userData = {
      interactive: true,
      name: 'window',
      label: 'Panoramic Window (Press [E]: Cycle Sky Mode)'
    };
    this.interactiveObjects.push(win);
    this.scene.add(win);
  }

  buildGardenBackdrop() {
    // Natural outdoor greenery outside the windows
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e4e37, roughness: 0.7 });
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4d6342, roughness: 0.6 });

    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 11.2 + (i % 3) * 0.8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Bamboo stalks
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.2 + (i % 4) * 0.5, 8), stalkMat);
      stalk.position.set(x, 2.1, z);
      this.scene.add(stalk);

      const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(0.55 + (i % 3) * 0.15, 8, 8), foliageMat);
      leafCluster.scale.set(1.4, 1.8, 1.2);
      leafCluster.position.set(x, 3.6, z);
      this.scene.add(leafCluster);
    }
  }

  /* =========================================================================
     ZONE 1: WORKSTATION / CREATIVE STUDIO (NW)
     Desk: 1.6m wide, 0.8m deep, 0.75m high (ergonomic human scale)
     ========================================================================= */
  buildStudioZone() {
    const zX = -4.5;
    const zZ = -4.5;

    this.addContactShadow(zX, zZ, 2.4, 1.6, 0.32);

    const deskGroup = new THREE.Group();
    deskGroup.position.set(zX, 0, zZ);

    const topMat = new THREE.MeshStandardMaterial({
      map: this.oakWoodTex,
      roughness: 0.4
    });
    // Natural human-proportioned desk: 1.6m wide x 0.8m deep x 0.75m height
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.8), topMat);
    top.position.y = 0.73;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.35, metalness: 0.8 });
    for (const [lx, lz] of [[-0.74, -0.34], [0.74, -0.34], [-0.74, 0.34], [0.74, 0.34]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.71, 12), steelMat);
      leg.position.set(lx, 0.355, lz);
      leg.castShadow = true;
      deskGroup.add(leg);
    }

    this.scene.add(deskGroup);
    this.addCollider(deskGroup);

    // Ergonomic Chair (Seat at 45cm)
    this.buildErgonomicChair(zX, 0, zZ + 0.65);

    // Desk Props
    this.buildMinimalistMonitor(zX, 0.75, zZ - 0.18);
    this.buildMinimalKeyboard(zX - 0.08, 0.75, zZ + 0.14);
    this.buildWarmDeskLamp(zX - 0.62, 0.75, zZ - 0.12);
    this.buildVintageWoodRadio(zX - 0.58, 0.75, zZ + 0.18);
    this.buildCoffeeMug(zX + 0.45, 0.75, zZ + 0.16);
    this.buildIndoorPlant(zX + 0.62, 0.75, zZ - 0.16);
    this.buildOakBookshelves(zX, 1.85, -8.82);
  }

  buildErgonomicChair(x, y, z) {
    const chair = new THREE.Group();
    chair.position.set(x, y, z);

    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x343942, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xc8cdd6, metalness: 0.9, roughness: 0.2 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.48), fabricMat);
    seat.position.y = 0.45;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.04), fabricMat);
    back.position.set(0, 0.74, 0.22);
    chair.add(back);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 10), chromeMat);
    stem.position.y = 0.21;
    chair.add(stem);

    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), chromeMat);
      leg.position.set(Math.cos(a) * 0.12, 0.03, Math.sin(a) * 0.12);
      leg.rotation.y = -a;
      chair.add(leg);
    }

    this.scene.add(chair);
    this.addCollider(chair, 0.05);
  }

  buildMinimalistMonitor(x, y, z) {
    const pcGroup = new THREE.Group();
    pcGroup.position.set(x, y, z);

    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd4d8de, metalness: 0.85, roughness: 0.25 });
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.012, 0.18), silverMat);
    base.position.y = 0.006;
    pcGroup.add(base);

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.02), silverMat);
    stem.position.set(0, 0.14, -0.04);
    pcGroup.add(stem);

    // 27-inch display: 0.64m wide x 0.38m high
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.38, 0.02), bezelMat);
    screenFrame.position.set(0, 0.34, 0);
    pcGroup.add(screenFrame);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 512;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTexture, toneMapped: false });
    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), screenMat);
    screenSurface.position.set(0, 0.34, 0.012);
    pcGroup.add(screenSurface);

    pcGroup.userData = {
      interactive: true,
      name: 'pc',
      label: 'Studio PC (Press [E]: Open Terminal)'
    };
    this.interactiveObjects.push(pcGroup);
    this.scene.add(pcGroup);
  }

  buildMinimalKeyboard(x, y, z) {
    const kb = new THREE.Group();
    kb.position.set(x, y, z);

    const feltMat = new THREE.MeshStandardMaterial({ color: 0x36332f, roughness: 0.9 });
    const mat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.006, 0.36), feltMat);
    mat.position.y = 0.003;
    mat.receiveShadow = true;
    kb.add(mat);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.13), darkMat);
    body.position.set(0, 0.012, 0);
    kb.add(body);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.02, 0.10), darkMat);
    mouse.position.set(0.26, 0.014, 0.02);
    kb.add(mouse);

    this.scene.add(kb);
  }

  buildWarmDeskLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.85 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16), brassMat);
    base.position.y = 0.008;
    lamp.add(base);

    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), brassMat);
    stem1.position.set(0, 0.14, -0.04);
    stem1.rotation.x = -0.25;
    lamp.add(stem1);

    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), brassMat);
    stem2.position.set(0, 0.33, 0.02);
    stem2.rotation.x = 0.35;
    lamp.add(stem2);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 16, 1, true), brassMat);
    shade.position.set(0, 0.42, 0.12);
    shade.rotation.x = 1.25;
    lamp.add(shade);

    this.lampBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xffedd5,
        emissiveIntensity: 2.2,
        roughness: 0.2
      })
    );
    this.lampBulb.position.set(0, 0.39, 0.11);
    lamp.add(this.lampBulb);

    this.lampLight = new THREE.PointLight(0xffedd5, 1.4, 3.5);
    this.lampLight.position.set(0, 0.38, 0.11);
    lamp.add(this.lampLight);

    lamp.userData = {
      interactive: true,
      name: 'lamp',
      label: 'Warm Desk Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
  }

  buildVintageWoodRadio(x, y, z) {
    const radio = new THREE.Group();
    radio.position.set(x, y, z);
    radio.rotation.y = 0.25;

    const walnutMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.4 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xc8bda8, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.10), walnutMat);
    body.position.y = 0.07;
    radio.add(body);

    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), clothMat);
    cloth.position.set(-0.02, 0.07, 0.052);
    radio.add(cloth);

    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0.08, 0.09, 0.054);
    radio.add(dial);

    this.radioSpeaker = cloth;

    radio.userData = {
      interactive: true,
      name: 'radio',
      label: 'Wood Radio (Press [E]: Toggle Music)'
    };
    this.interactiveObjects.push(radio);
    this.scene.add(radio);
  }

  buildCoffeeMug(x, y, z) {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(x, y, z);

    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xede4d8, roughness: 0.3 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.035, 0.09, 16), ceramicMat);
    mug.position.y = 0.045;
    mugGroup.add(mug);

    const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.008, 16), new THREE.MeshStandardMaterial({ color: 0x9c7a54, roughness: 0.9 }));
    coaster.position.y = 0.004;
    mugGroup.add(coaster);

    const particleCount = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.03;
      positions[i * 3 + 1] = 0.09 + (i / particleCount) * 0.16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.steamParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.3 }));
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
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.12, 16), potMat);
    pot.position.y = 0.06;
    plant.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d6647, roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), leafMat);
      leaf.scale.set(1.4, 0.15, 0.8);
      leaf.position.set(Math.cos(angle) * 0.07, 0.14 + (i % 2) * 0.03, Math.sin(angle) * 0.07);
      leaf.rotation.y = angle;
      leaf.rotation.z = -0.35;
      plant.add(leaf);
    }
    this.scene.add(plant);
  }

  buildOakBookshelves(x, y, z) {
    const oakMat = new THREE.MeshStandardMaterial({ color: 0x8c6d48, roughness: 0.5 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.035, 0.28), oakMat);
    shelf.position.set(x, y, z);
    this.scene.add(shelf);

    const colors = [0x5c4d3c, 0x8a7b6a, 0x48584e, 0x7a6352, 0xd4c5b3];
    for (let i = 0; i < 9; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.22 + (i % 3) * 0.04, 0.18),
        new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.6 })
      );
      book.position.set(x - 0.75 + i * 0.12, y + 0.13, z);
      this.scene.add(book);
    }
  }

  /* =========================================================================
     ZONE 2: SCANDINAVIAN LIVING ROOM (NE)
     Sofa: 2.3m wide x 0.95m deep x 0.78m high (seat height 0.42m)
     ========================================================================= */
  buildLivingRoomZone() {
    const zX = 4.5;
    const zZ = -4.5;

    this.addContactShadow(zX, zZ, 3.6, 3.2, 0.32);

    // Wool Area Rug
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.012, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xd6ccc2, roughness: 0.95 })
    );
    rug.position.set(zX, 0.006, zZ);
    this.scene.add(rug);

    // Bouclé Modular Sofa (True human scale: seat 42cm, width 2.3m)
    const sofa = new THREE.Group();
    sofa.position.set(zX, 0, zZ - 0.6);

    const boucléMat = new THREE.MeshStandardMaterial({
      map: this.linenTex,
      bumpMap: this.boucleBumpTex,
      bumpScale: 0.032,
      roughness: 0.85
    });
    const woodLegMat = new THREE.MeshStandardMaterial({ color: 0x785a3c, roughness: 0.5 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 0.92), boucléMat);
    seat.position.y = 0.31;
    seat.castShadow = true;
    seat.receiveShadow = true;
    sofa.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.44, 0.22), boucléMat);
    back.position.set(0, 0.62, -0.35);
    back.castShadow = true;
    sofa.add(back);

    // Cozy pillows
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0x937860, roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.45), pillowMat);
      p.position.set(-0.65 + i * 0.65, 0.47, -0.08);
      sofa.add(p);
    }

    for (const [lx, lz] of [[-1.05, -0.36], [1.05, -0.36], [-1.05, 0.36], [1.05, 0.36]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.2, 10), woodLegMat);
      leg.position.set(lx, 0.10, lz);
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

    // Round Solid Oak Coffee Table (Diameter 0.85m, height 0.40m)
    const table = new THREE.Group();
    table.position.set(zX, 0, zZ + 0.55);

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.035, 32),
      new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.4 })
    );
    tableTop.position.y = 0.385;
    tableTop.castShadow = true;
    table.add(tableTop);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.37, 10), woodLegMat);
      leg.position.set(Math.cos(a) * 0.28, 0.185, Math.sin(a) * 0.28);
      table.add(leg);
    }

    this.scene.add(table);
    this.addCollider(table);

    // 65" OLED TV & Media Console on East Wall
    this.buildOledMediaConsole(8.75, 0, zZ);
    this.buildPaperFloorLamp(zX - 1.5, 0, zZ - 1.2);
    this.buildNaturalFireplace(8.72, 0, -7.2);
  }

  buildOledMediaConsole(x, y, z) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, y, z);
    tvGroup.rotation.y = -Math.PI / 2;

    const oakMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.45 });
    // Low-profile credenza: 2.0m wide x 0.42m deep x 0.45m high
    const credenza = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.42, 0.42), oakMat);
    credenza.position.y = 0.21;
    credenza.castShadow = true;
    tvGroup.add(credenza);

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });
    // 65" TV: 1.45m wide x 0.84m high at y = 1.35m
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.84, 0.03), bezelMat);
    tvFrame.position.set(0, 1.25, 0);
    tvGroup.add(tvFrame);

    this.tvCanvas = document.createElement('canvas');
    this.tvCanvas.width = 1024;
    this.tvCanvas.height = 576;
    this.tvCtx = this.tvCanvas.getContext('2d');
    this.tvTexture = new THREE.CanvasTexture(this.tvCanvas);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.42, 0.81),
      new THREE.MeshStandardMaterial({
        map: this.tvTexture,
        emissive: 0xffffff,
        emissiveMap: this.tvTexture,
        emissiveIntensity: 0.65,
        roughness: 0.2
      })
    );
    tvScreen.position.set(0, 1.25, 0.018);
    tvGroup.add(tvScreen);

    tvGroup.userData = {
      interactive: true,
      name: 'tv',
      label: 'Smart OLED TV (Press [E]: Switch Channels)'
    };
    this.interactiveObjects.push(tvGroup);
    this.scene.add(tvGroup);
    this.addCollider(tvGroup);
  }

  buildPaperFloorLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const wireMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.7 });
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf5,
      roughness: 0.85,
      emissive: 0xffedd5,
      emissiveIntensity: 1.15
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.55, 8), wireMat);
      leg.position.set(Math.cos(a) * 0.16, 0.775, Math.sin(a) * 0.16);
      lamp.add(leg);
    }

    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), paperMat);
    shade.scale.set(1.0, 1.3, 1.0);
    shade.position.y = 1.55;
    lamp.add(shade);
    this.floorLampShade = shade;

    this.floorLampLight = new THREE.PointLight(0xffeedd, 1.6, 6.0);
    this.floorLampLight.position.y = 1.55;
    lamp.add(this.floorLampLight);

    lamp.userData = {
      interactive: true,
      name: 'floor_lamp',
      label: 'Paper Lantern Lamp (Press [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
  }

  buildNaturalFireplace(x, y, z) {
    const fp = new THREE.Group();
    fp.position.set(x, y, z);
    fp.rotation.y = -Math.PI / 2;

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdcd5ca, roughness: 0.85 });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 0.42), stoneMat);
    mantle.position.y = 0.475;
    fp.add(mantle);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 0.32), new THREE.MeshBasicMaterial({ color: 0x181512 }));
    hearth.position.set(0, 0.35, 0.11);
    fp.add(hearth);

    // Glowing warm fireplace embers with radiant bloom
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff5500,
      emissiveIntensity: 2.6,
      roughness: 0.6
    });
    const embers = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.22, 12), emberMat);
    embers.position.set(0, 0.20, 0.16);
    fp.add(embers);

    const warmLight = new THREE.PointLight(0xf59e0b, 1.4, 4.5);
    warmLight.position.set(0, 0.38, 0.22);
    fp.add(warmLight);

    this.scene.add(fp);
    this.addCollider(fp);
  }

  /* =========================================================================
     ZONE 3: KITCHEN & DINING (SW)
     Kitchen Island: 2.4m length x 0.90m width x 0.90m height (standard ergonomic counter)
     ========================================================================= */
  buildKitchenZone() {
    const zX = -4.5;
    const zZ = 4.5;

    this.addContactShadow(zX, zZ, 3.2, 1.8, 0.35);

    const island = new THREE.Group();
    island.position.set(zX, 0, zZ);

    const oakBaseMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });
    const quartzMat = new THREE.MeshStandardMaterial({
      map: this.quartzTex,
      roughness: 0.12,
      metalness: 0.06
    });

    // Base cabinet: 2.3m x 0.85m x 0.86m
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.86, 0.85), oakBaseMat);
    base.position.y = 0.43;
    base.castShadow = true;
    base.receiveShadow = true;
    island.add(base);

    // Quartz waterfall top: 2.4m x 0.90m x 0.04m at 0.90m height
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.90), quartzMat);
    top.position.y = 0.88;
    top.castShadow = true;
    top.receiveShadow = true;
    island.add(top);

    const blackSteel = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.25, metalness: 0.85 });

    // Undermount Sink
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.01, 0.42), blackSteel);
    sink.position.set(-0.55, 0.905, 0);
    island.add(sink);

    // Swan-neck faucet
    const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 10, 20, Math.PI), blackSteel);
    faucet.position.set(-0.55, 1.05, -0.14);
    faucet.rotation.z = Math.PI;
    island.add(faucet);

    // Running water stream
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      transmission: 0.85,
      roughness: 0.1
    });
    this.waterStream = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.16, 8), waterMat);
    this.waterStream.position.set(-0.55, 0.98, -0.05);
    this.waterStream.visible = false;
    island.add(this.waterStream);

    // Gas Cooktop
    const stove = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.015, 0.45), blackSteel);
    stove.position.set(0.55, 0.908, 0);
    island.add(stove);

    for (let i = 0; i < 2; i++) {
      const grate = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.09, 16), blackSteel);
      grate.rotation.x = -Math.PI / 2;
      grate.position.set(0.42 + i * 0.26, 0.915, 0);
      island.add(grate);
    }

    this.stoveFlameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.12, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.stoveFlameMesh.position.set(0.42, 0.97, 0);
    this.stoveFlameMesh.visible = false;
    island.add(this.stoveFlameMesh);

    this.stoveFlameLight = new THREE.PointLight(0x38bdf8, 0, 2.5);
    this.stoveFlameLight.position.set(0.42, 0.98, 0);
    island.add(this.stoveFlameLight);

    island.userData = {
      interactive: true,
      name: 'stove',
      label: 'Kitchen Stove Range (Press [E]: Ignite Flame)'
    };
    this.interactiveObjects.push(island);
    this.scene.add(island);
    this.addCollider(island);

    // Modern Double-Door French Refrigerator: 0.85m wide x 0.70m deep x 1.85m high
    this.buildModernRefrigerator(zX - 3.8, 0, zZ);

    // 2 Bar Stools (Seat height 0.65m)
    for (let i = 0; i < 2; i++) {
      this.buildWoodCounterStool(zX - 0.4 + i * 0.8, 0, zZ + 0.85);
    }
  }

  buildModernRefrigerator(x, y, z) {
    const fridge = new THREE.Group();
    fridge.position.set(x, y, z);

    const matteWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: 0.35 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x9c7d58, roughness: 0.5 });

    // Realistic human-scale fridge: 0.85m wide x 0.70m deep x 1.85m high
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.85, 0.70), matteWhiteMat);
    body.position.y = 0.925;
    body.castShadow = true;
    body.receiveShadow = true;
    fridge.add(body);

    this.fridgeDoor = new THREE.Group();

    // Interior shelf contents
    const milkMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12), milkMat);
    milk.position.set(0.14, 1.25, 0.05);
    fridge.add(milk);

    const juiceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const juice = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), juiceMat);
    juice.position.set(-0.14, 1.25, 0.05);
    fridge.add(juice);

    const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), appleMat);
    apple.position.set(0, 0.95, 0.08);
    fridge.add(apple);
    this.fridgeDoor.position.set(0.42, 0, 0.35);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.83, 0.06), matteWhiteMat);
    doorLeaf.position.set(-0.42, 0.925, 0);
    this.fridgeDoor.add(doorLeaf);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 10), handleMat);
    handle.position.set(-0.76, 0.925, 0.05);
    this.fridgeDoor.add(handle);

    fridge.add(this.fridgeDoor);

    this.fridgeLight = new THREE.PointLight(0xfff3e0, 0, 2.5);
    this.fridgeLight.position.set(0, 0.95, 0.2);
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

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 10), blackMat);
    stem.position.y = 0.31;
    stool.add(stem);

    const footring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 8, 16), blackMat);
    footring.rotation.x = Math.PI / 2;
    footring.position.y = 0.22;
    stool.add(footring);

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.04, 20), oakMat);
    seat.position.y = 0.64;
    stool.add(seat);

    this.scene.add(stool);
    this.addCollider(stool, 0.04);
  }

  /* =========================================================================
     ZONE 4: MASTER BEDROOM NOOK (SE)
     Platform Bed: 1.7m wide x 2.1m length x 0.48m height
     ========================================================================= */
  buildBedroomZone() {
    const zX = 4.5;
    const zZ = 4.5;

    this.addContactShadow(zX, zZ, 2.8, 2.6, 0.35);

    const bedGroup = new THREE.Group();
    bedGroup.position.set(zX, 0, zZ);

    const oakMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xfbf9f5, roughness: 0.8 });
    const duvetMat = new THREE.MeshStandardMaterial({ map: this.linenTex, roughness: 0.9 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xd6ccc2, roughness: 0.85 });

    // Platform Base: 1.8m x 2.2m x 0.22m
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 2.2), oakMat);
    bedBase.position.y = 0.11;
    bedBase.castShadow = true;
    bedBase.receiveShadow = true;
    bedGroup.add(bedBase);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.95, 0.12), oakMat);
    headboard.position.set(0, 0.475, 1.04);
    headboard.castShadow = true;
    bedGroup.add(headboard);

    // Mattress: 1.6m x 2.0m x 0.26m (Standard Queen/Double)
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.26, 2.0), mattressMat);
    mattress.position.set(0, 0.35, -0.05);
    bedGroup.add(mattress);

    // Cozy folded duvet
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.12, 1.45), duvetMat);
    duvet.position.set(0, 0.52, -0.28);
    bedGroup.add(duvet);

    // 2 Pillows
    for (let i = 0; i < 2; i++) {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.42), pillowMat);
      pillow.position.set(-0.45 + i * 0.9, 0.54, 0.62);
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

    // Floating Oak Nightstands on both sides (0.45m x 0.40m x 0.44m height)
    for (const side of [-1, 1]) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.40), oakMat);
      stand.position.set(zX + side * 1.35, 0.19, zZ + 0.85);
      stand.castShadow = true;
      this.scene.add(stand);
      this.addCollider(stand, 0.04);

      // Bedside Minimalist Lamp
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.8 }));
      lamp.position.set(zX + side * 1.35, 0.50, zZ + 0.85);
      this.scene.add(lamp);
    }
  }

  /* =========================================================================
     ZONE 5: CEILING FANS & FRAMED ARTWORK
     ========================================================================= */
  buildCeilingFans() {
    this.ceilingFan1 = this.createCeilingFan(-4.5, 3.25, -4.5); // Studio
    this.ceilingFan2 = this.createCeilingFan(4.5, 3.25, -4.5);  // Living Room
    this.scene.add(this.ceilingFan1);
    this.scene.add(this.ceilingFan2);
  }

  createCeilingFan(x, y, z) {
    const fan = new THREE.Group();
    fan.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4 });
    const woodBladeMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.5 });

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8), metalMat);
    rod.position.y = -0.16;
    fan.add(rod);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), metalMat);
    hub.position.y = -0.36;
    fan.add(hub);

    const bladesGroup = new THREE.Group();
    bladesGroup.position.y = -0.36;

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 0.14), woodBladeMat);
      blade.position.set(Math.cos(angle) * 0.42, 0, Math.sin(angle) * 0.42);
      blade.rotation.y = -angle;
      blade.rotation.x = 0.12;
      bladesGroup.add(blade);
    }

    fan.add(bladesGroup);
    fan.blades = bladesGroup;
    return fan;
  }

  buildFramedArtwork() {
    this.createFramedPainting(6.8, 1.9, -8.82, 1.4, 1.8, this.artTex1);
    this.createFramedPainting(-2.2, 1.9, -0.14, 1.2, 1.6, this.artTex2);
  }

  createFramedPainting(x, y, z, width, height, texture) {
    const frameGroup = new THREE.Group();
    frameGroup.position.set(x, y, z);

    const oakMat = new THREE.MeshStandardMaterial({ color: 0x785a3c, roughness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.04), oakMat);
    frameGroup.add(frame);

    const canvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    canvasMesh.position.z = 0.025;
    frameGroup.add(canvasMesh);

    this.scene.add(frameGroup);
  }

  /* =========================================================================
     ZONE 6: ARCHITECTURAL GALLERY BANNER "XIANLY RUNA"
     Slatted vertical oak partition wall in center, plaque at eye level (y = 2.05m)
     ========================================================================= */
  buildNameBannerZone() {
    // Slatted Oak Accent Wall in central hall
    const slatMat = new THREE.MeshStandardMaterial({ map: this.oakWoodTex, roughness: 0.45 });
    for (let z = -1.8; z <= 1.8; z += 0.22) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.06), slatMat);
      slat.position.set(0, 1.7, z);
      slat.castShadow = true;
      slat.receiveShadow = true;
      this.scene.add(slat);
    }

    // 3D Typography plaque mounted at eye level (y = 2.05m)
    const banner = create3DNameBanner("XIANLY RUNA", new THREE.Vector3(0.12, 2.05, 0));
    banner.scale.setScalar(0.55);
    banner.rotation.y = Math.PI / 2;
    this.scene.add(banner);
  }

  /* =========================================================================
     INTERACTION HANDLERS & UPDATES
     ========================================================================= */
  toggleLamp() {
    this.lampState = !this.lampState;
    if (this.lampLight) this.lampLight.intensity = this.lampState ? 1.4 : 0;
    if (this.lampBulb) {
      this.lampBulb.material.color.setHex(this.lampState ? 0xffedd5 : 0x554b42);
      this.lampBulb.material.emissiveIntensity = this.lampState ? 2.2 : 0;
    }
    return this.lampState;
  }

  toggleFloorLamp() {
    this.floorLampState = !this.floorLampState;
    if (this.floorLampLight) this.floorLampLight.intensity = this.floorLampState ? 1.6 : 0;
    if (this.floorLampShade) {
      this.floorLampShade.material.emissiveIntensity = this.floorLampState ? 1.15 : 0;
    }
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
    if (this.stoveFlameLight) this.stoveFlameLight.intensity = this.stoveState ? 1.8 : 0;
    return this.stoveState;
  }

  toggleWater() {
    this.waterRunning = !this.waterRunning;
    if (this.waterStream) this.waterStream.visible = this.waterRunning;
    return this.waterRunning;
  }

  updateScreenCanvas(time) {
    if (!this.screenCtx) return;
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Simulated IDE / Terminal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 40);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(20, 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(40, 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(60, 20, 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText('hyfly_workspace // xianly_runa_core.rs', 90, 26);

    ctx.font = '20px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('fn render_scandinavian_residence() -> Result<Space, Life> {', 30, 90);
    ctx.fillStyle = '#a855f7';
    ctx.fillText('    let architect = "xianly runa";', 30, 130);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('    let ambiance = JapandiLighting::warm_incandescent(3000K);', 30, 170);
    ctx.fillStyle = '#10b981';
    ctx.fillText('    let elaina = Character::load_pc_avatar("elaina_pc.fbx");', 30, 210);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('    world.spawn(elaina, Coordinates::new(1.5, 0.0, 1.5));', 30, 250);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('    println!("Residence online. Welcome home, Xianly.");', 30, 290);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('}', 30, 330);

    const cursorBlink = Math.sin(time * 6) > 0;
    if (cursorBlink) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(30, 350, 14, 24);
    }

    this.screenTexture.needsUpdate = true;
  }

  updateTVCanvas(time) {
    if (!this.tvCtx) return;
    const ctx = this.tvCtx;
    const w = this.tvCanvas.width;
    const h = this.tvCanvas.height;

    if (this.tvChannel === 0) {
      // Golden Hour Landscape Channel
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.45, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#292524';
      ctx.font = '500 24px sans-serif';
      ctx.fillText('NATURE LOUNGE // GOLDEN HOUR SCENIC STREAM', 32, 50);
    } else {
      // Architectural Digest Channel
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
      ctx.fillText('Featuring work by Lead Architect: Xianly Runa', 60, 130);
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
        positions[i + 1] += 0.0015;
        positions[i] += Math.sin(time * 3 + i) * 0.0004;
        if (positions[i + 1] > 0.22) {
          positions[i + 1] = 0.09;
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
