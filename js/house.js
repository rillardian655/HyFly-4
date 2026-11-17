/**
 * Extended 3D House Environment for HyFly-4
 * Comprises:
 * 1. Workstation & Cyber Studio
 * 2. Living Room with Smart TV, Sofa, and Fireplace
 * 3. Modern Kitchen with Refrigerator, Stove, and Counter
 * 4. 3D Neon Wall Banner: "XIANLY RUNA"
 */
import * as THREE from 'three';
import { create3DNameBanner } from './text3d.js';

export class HouseBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.colliders = []; // THREE.Box3 objects for player collision

    // Dynamic states
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

    this.stoveFlameLight = null;
    this.stoveFlameMesh = null;
    this.stoveState = false;

    this.radioSpeakerLeft = null;
    this.radioSpeakerRight = null;
    this.steamParticles = null;

    this.screenCanvas = null;
    this.screenCtx = null;
    this.screenTexture = null;
  }

  build() {
    this.buildHouseFloorsAndWalls();
    this.buildWorkstationZone();
    this.buildLivingRoomZone();
    this.buildKitchenZone();
    this.buildNameBannerZone();
    return {
      interactive: this.interactiveObjects,
      colliders: this.colliders
    };
  }

  addCollider(mesh, extraPadding = 0.1) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    box.min.x -= extraPadding;
    box.min.z -= extraPadding;
    box.max.x += extraPadding;
    box.max.z += extraPadding;
    this.colliders.push(box);
  }

  buildHouseFloorsAndWalls() {
    // Large House Floor (28m x 28m)
    const floorGeo = new THREE.PlaneGeometry(28, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a2130,
      roughness: 0.55,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor accent tiles grid
    const grid = new THREE.GridHelper(28, 28, 0x334155, 0x1e293b);
    grid.position.y = 0.005;
    this.scene.add(grid);

    // Outer Perimeter Walls (North, South, East, West)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x151c28, roughness: 0.85 });

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

    // Interior Partition Walls with Archways/Openings
    // Wall separating Workstation (NW) and Kitchen (SW): Z = 0, X from -14 to -3
    const partition1 = new THREE.Mesh(new THREE.BoxGeometry(11, 7, 0.35), wallMat);
    partition1.position.set(-8.5, 3.5, 0);
    this.scene.add(partition1);
    this.addCollider(partition1);

    // Wall separating Workstation/Kitchen from Living Room (East): X = 0, Z from -14 to -4 and Z from 4 to 14 (Central corridor open)
    const partitionNorth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7, 10), wallMat);
    partitionNorth.position.set(0, 3.5, -9);
    this.scene.add(partitionNorth);
    this.addCollider(partitionNorth);

    const partitionSouth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7, 8), wallMat);
    partitionSouth.position.set(0, 3.5, 9);
    this.scene.add(partitionSouth);
    this.addCollider(partitionSouth);

    // Windows with outdoor view
    this.buildWindow(-7, 5.0, -13.8);
    this.buildWindow(7, 5.0, -13.8);
  }

  buildWindow(x, y, z) {
    const windowGroup = new THREE.Group();
    windowGroup.position.set(x, y, z);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.0, 0.2), frameMat);
    windowGroup.add(frame);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.4,
      transmission: 0.8
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 3.7), glassMat);
    glass.position.z = 0.08;
    windowGroup.add(glass);

    windowGroup.userData = {
      interactive: true,
      name: 'window',
      label: 'Window (Click or [E]: Cycle Day / Sunset / Night)'
    };
    this.interactiveObjects.push(windowGroup);
    this.scene.add(windowGroup);
  }

  /* =========================================================================
     ZONE 1: WORKSTATION / CYBER STUDIO (X: -7, Z: -7)
     ========================================================================= */
  buildWorkstationZone() {
    const zoneX = -7.0;
    const zoneZ = -7.0;

    // Wooden Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(zoneX, 0, zoneZ);

    const topMat = new THREE.MeshStandardMaterial({ color: 0x241d17, roughness: 0.45 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 2.4), topMat);
    top.position.y = 2.85;
    top.castShadow = true;
    deskGroup.add(top);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.8 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 2.2), legMat);
    leftLeg.position.set(-2.4, 1.4, 0);
    deskGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 2.2), legMat);
    rightLeg.position.set(2.4, 1.4, 0);
    deskGroup.add(rightLeg);

    this.scene.add(deskGroup);
    this.addCollider(deskGroup);

    // Ultrawide PC Monitor
    this.buildMonitor(zoneX, 2.93, zoneZ - 0.4);

    // Mechanical Keyboard & Mouse
    this.buildKeyboardMouse(zoneX, 2.93, zoneZ + 0.4);

    // Desk Lamp
    this.buildDeskLamp(zoneX - 2.0, 2.93, zoneZ - 0.4);

    // Lo-Fi Boombox
    this.buildBoombox(zoneX - 1.8, 2.93, zoneZ + 0.6);

    // Coffee Mug
    this.buildCoffeeMug(zoneX + 1.6, 2.93, zoneZ + 0.6);

    // Bookshelf
    this.buildBookshelf(zoneX, 5.0, -13.7);
  }

  buildMonitor(x, y, z) {
    const pcGroup = new THREE.Group();
    pcGroup.position.set(x, y, z);

    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), standMat);
    arm.position.set(0, 0.55, -0.15);
    pcGroup.add(arm);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 });
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 0.12), frameMat);
    screenFrame.position.set(0, 1.25, 0);
    pcGroup.add(screenFrame);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 256;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTexture, toneMapped: false });
    const screenSurface = new THREE.Mesh(new THREE.PlaneGeometry(2.88, 1.28), screenMat);
    screenSurface.position.set(0, 1.25, 0.065);
    pcGroup.add(screenSurface);

    pcGroup.userData = {
      interactive: true,
      name: 'pc',
      label: 'Virtual PC (Press [E] or Click to Open Terminal)'
    };
    this.interactiveObjects.push(pcGroup);
    this.scene.add(pcGroup);
  }

  buildKeyboardMouse(x, y, z) {
    const kb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    kb.position.set(x - 0.2, y + 0.03, z);
    this.scene.add(kb);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.35), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    mouse.position.set(x + 0.8, y + 0.03, z);
    this.scene.add(mouse);
  }

  buildDeskLamp(x, y, z) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.05, 16), metalMat);
    lampGroup.add(base);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 16, 1, true), metalMat);
    shade.position.set(0.42, 1.15, 0.2);
    shade.rotation.z = Math.PI - 0.7;
    lampGroup.add(shade);

    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bulbMat);
    this.lampBulb.position.set(0.42, 1.1, 0.2);
    lampGroup.add(this.lampBulb);

    this.lampLight = new THREE.PointLight(0xffedd5, 1.8, 6.5, 1.5);
    this.lampLight.position.set(0.42, 1.05, 0.2);
    this.lampLight.castShadow = true;
    lampGroup.add(this.lampLight);

    lampGroup.userData = {
      interactive: true,
      name: 'lamp',
      label: 'Desk Lamp (Click or [E]: Toggle Light)'
    };
    this.interactiveObjects.push(lampGroup);
    this.scene.add(lampGroup);
  }

  buildBoombox(x, y, z) {
    const radioGroup = new THREE.Group();
    radioGroup.position.set(x, y, z);
    radioGroup.rotation.y = 0.4;

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.3), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    body.position.y = 0.21;
    radioGroup.add(body);

    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    this.radioSpeakerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), speakerMat);
    this.radioSpeakerLeft.rotation.x = Math.PI / 2;
    this.radioSpeakerLeft.position.set(-0.2, 0.2, 0.155);
    radioGroup.add(this.radioSpeakerLeft);

    this.radioSpeakerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), speakerMat);
    this.radioSpeakerRight.rotation.x = Math.PI / 2;
    this.radioSpeakerRight.position.set(0.2, 0.2, 0.155);
    radioGroup.add(this.radioSpeakerRight);

    radioGroup.userData = {
      interactive: true,
      name: 'radio',
      label: 'Lo-Fi Boombox (Click or [E]: Toggle Music)'
    };
    this.interactiveObjects.push(radioGroup);
    this.scene.add(radioGroup);
  }

  buildCoffeeMug(x, y, z) {
    const mugGroup = new THREE.Group();
    mugGroup.position.set(x, y, z);

    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    mug.position.y = 0.12;
    mugGroup.add(mug);

    // Steam
    const particleCount = 14;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 1] = 0.25 + (i / particleCount) * 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.steamParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.35 }));
    mugGroup.add(this.steamParticles);

    mugGroup.userData = {
      interactive: true,
      name: 'coffee',
      label: 'Coffee Mug (Click or [E]: Take a Sip)'
    };
    this.interactiveObjects.push(mugGroup);
    this.scene.add(mugGroup);
  }

  buildBookshelf(x, y, z) {
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x271f1a });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 0.6), shelfMat);
    shelf.position.set(x, y, z);
    this.scene.add(shelf);

    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
    for (let i = 0; i < 9; i++) {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6 + (i % 3) * 0.1, 0.45), new THREE.MeshStandardMaterial({ color: colors[i % colors.length] }));
      book.position.set(x - 1.5 + i * 0.25, y + 0.35, z);
      this.scene.add(book);
    }
  }

  /* =========================================================================
     ZONE 2: LIVING ROOM / RUANG TAMU (X: 7, Z: -5)
     ========================================================================= */
  buildLivingRoomZone() {
    const zoneX = 7.0;
    const zoneZ = -5.0;

    // Cozy Floor Rug
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const rug = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 6.0), rugMat);
    rug.position.set(zoneX, 0.01, zoneZ);
    this.scene.add(rug);

    // Large L-Shaped Sectional Sofa
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(zoneX, 0, zoneZ - 1.2);

    const couchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });

    // Main sofa base & back
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 1.8), couchMat);
    sofaBase.position.y = 0.25;
    sofaGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 0.4), couchMat);
    sofaBack.position.set(0, 1.0, -0.7);
    sofaGroup.add(sofaBack);

    // L-corner chaise
    const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.2), couchMat);
    chaise.position.set(-1.7, 0.25, 1.2);
    sofaGroup.add(chaise);

    // Cushions
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), cushionMat);
      c.position.set(-1.2 + i * 1.3, 0.55, 0.1);
      sofaGroup.add(c);
    }

    sofaGroup.userData = {
      interactive: true,
      name: 'sofa',
      label: 'Cozy Sofa (Click or [E]: Relax and Sit)'
    };
    this.interactiveObjects.push(sofaGroup);
    this.scene.add(sofaGroup);
    this.addCollider(sofaGroup);

    // Modern Coffee Table
    const tableGroup = new THREE.Group();
    tableGroup.position.set(zoneX + 0.3, 0, zoneZ + 1.2);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.4), tableMat);
    tableTop.position.y = 0.6;
    tableGroup.add(tableTop);

    const tableLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 1.2), tableMat);
    tableLeg1.position.set(-1.0, 0.3, 0);
    tableGroup.add(tableLeg1);

    const tableLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 1.2), tableMat);
    tableLeg2.position.set(1.0, 0.3, 0);
    tableGroup.add(tableLeg2);

    this.scene.add(tableGroup);
    this.addCollider(tableGroup);

    // Smart TV on Wall (East Wall X = 13.7)
    this.buildSmartTV(13.7, 3.8, zoneZ);

    // Standing Floor Lamp
    this.buildFloorLamp(zoneX - 2.8, 0, zoneZ - 2.2);

    // Modern Fireplace at corner (X = 13.6, Z = -11.0)
    this.buildFireplace(13.4, 0, -11.0);
  }

  buildSmartTV(x, y, z) {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, y, z);
    tvGroup.rotation.y = -Math.PI / 2;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.2, metalness: 0.8 });
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.8, 0.12), frameMat);
    tvGroup.add(tvFrame);

    // Animated TV Screen
    this.tvCanvas = document.createElement('canvas');
    this.tvCanvas.width = 512;
    this.tvCanvas.height = 288;
    this.tvCtx = this.tvCanvas.getContext('2d');
    this.tvTexture = new THREE.CanvasTexture(this.tvCanvas);

    const tvScreenMat = new THREE.MeshBasicMaterial({ map: this.tvTexture, toneMapped: false });
    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.6), tvScreenMat);
    tvScreen.position.z = 0.07;
    tvGroup.add(tvScreen);

    tvGroup.userData = {
      interactive: true,
      name: 'tv',
      label: 'Smart TV (Click or [E]: Switch TV Channel / Power)'
    };
    this.interactiveObjects.push(tvGroup);
    this.scene.add(tvGroup);
  }

  updateTVCanvas(time) {
    if (!this.tvCtx) return;
    const ctx = this.tvCtx;
    const w = this.tvCanvas.width;
    const h = this.tvCanvas.height;

    if (!this.tvState) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#334155';
      ctx.font = '16px monospace';
      ctx.fillText('STANDBY // PRESS TO POWER ON', 120, 144);
      this.tvTexture.needsUpdate = true;
      return;
    }

    // Procedural TV channels
    if (this.tvChannel === 0) {
      // Synthwave Sunset Flight Channel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#701a75');
      grad.addColorStop(0.5, '#f43f5e');
      grad.addColorStop(1, '#fb923c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * 0.75);

      // Glowing Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.55, 65, 0, Math.PI * 2);
      ctx.fill();

      // Moving grid wireframe
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < w; i += 32) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.65);
        ctx.lineTo(i * 2 - w / 2, h);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('HYFLY STREAM // CH.01 SYNTHWAVE HORIZON', 18, 30);
    } else {
      // Robotics Drone SITL Telemetry Channel
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Radar sweep
      ctx.strokeStyle = '#059669';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
      ctx.stroke();

      const sweepAngle = time * 3;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(sweepAngle) * 80, h / 2 + Math.sin(sweepAngle) * 80);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('LIVE UAV RADAR // CH.02 AUTONOMOUS FLIGHT', 32, 45);
      ctx.fillText(`ALT: 185m  SPEED: 18.2 m/s  HEADING: 142°`, 32, h - 35);
    }

    this.tvTexture.needsUpdate = true;
  }

  buildFloorLamp(x, y, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 16), metalMat);
    lamp.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 8), metalMat);
    pole.position.y = 2.1;
    lamp.add(pole);

    const shadeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.7, 16), shadeMat);
    shade.position.y = 4.2;
    lamp.add(shade);

    this.floorLampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    this.floorLampBulb.position.y = 4.2;
    lamp.add(this.floorLampBulb);

    this.floorLampLight = new THREE.PointLight(0xffedd5, 2.2, 9);
    this.floorLampLight.position.y = 4.2;
    lamp.add(this.floorLampLight);

    lamp.userData = {
      interactive: true,
      name: 'floor_lamp',
      label: 'Standing Lamp (Click or [E]: Toggle Room Light)'
    };
    this.interactiveObjects.push(lamp);
    this.scene.add(lamp);
    this.addCollider(lamp);
  }

  buildFireplace(x, y, z) {
    const fp = new THREE.Group();
    fp.position.set(x, y, z);
    fp.rotation.y = -Math.PI / 2;

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 1.2), stoneMat);
    mantle.position.y = 0.9;
    fp.add(mantle);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.8), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
    hearth.position.set(0, 0.6, 0.25);
    fp.add(hearth);

    // Glowing ember light
    const fireLight = new THREE.PointLight(0xf97316, 1.6, 7);
    fireLight.position.set(0, 0.6, 0.4);
    fp.add(fireLight);

    this.scene.add(fp);
    this.addCollider(fp);
  }

  /* =========================================================================
     ZONE 3: KITCHEN & DINING / DAPUR (X: -7, Z: 7)
     ========================================================================= */
  buildKitchenZone() {
    const zoneX = -7.0;
    const zoneZ = 7.0;

    // Kitchen Island / Counter
    const island = new THREE.Group();
    island.position.set(zoneX, 0, zoneZ);

    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const counterTopMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.2 }); // White marble look

    const counterBase = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.6, 2.2), cabinetMat);
    counterBase.position.y = 1.3;
    island.add(counterBase);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.15, 2.4), counterTopMat);
    counterTop.position.y = 2.68;
    island.add(counterTop);

    // Kitchen Sink & Faucet
    const sink = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.9), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 }));
    sink.position.set(-1.4, 2.76, 0);
    island.add(sink);

    // Modern Induction / Gas Stove
    const stoveGeo = new THREE.BoxGeometry(1.4, 0.03, 1.0);
    const stoveMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 });
    const stove = new THREE.Mesh(stoveGeo, stoveMat);
    stove.position.set(1.2, 2.77, 0);
    island.add(stove);

    // Stove Burner Rings
    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.18, 16), new THREE.MeshBasicMaterial({ color: 0x3f3f46 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0.9 + i * 0.6, 2.79, 0);
      island.add(ring);
    }

    // Flame mesh (animated when turned on)
    this.stoveFlameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.25, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    this.stoveFlameMesh.position.set(0.9, 2.92, 0);
    this.stoveFlameMesh.visible = false;
    island.add(this.stoveFlameMesh);

    this.stoveFlameLight = new THREE.PointLight(0x38bdf8, 0, 4);
    this.stoveFlameLight.position.set(0.9, 2.95, 0);
    island.add(this.stoveFlameLight);

    island.userData = {
      interactive: true,
      name: 'stove',
      label: 'Kitchen Stove (Click or [E]: Ignite Cooking Flame)'
    };
    this.interactiveObjects.push(island);
    this.scene.add(island);
    this.addCollider(island);

    // Double-Door Refrigerator (Kulkas)
    this.buildRefrigerator(zoneX - 5.5, 0, zoneZ);

    // Counter Bar Stools
    for (let i = 0; i < 3; i++) {
      this.buildBarStool(zoneX - 1.6 + i * 1.6, 0, zoneZ + 1.8);
    }
  }

  buildRefrigerator(x, y, z) {
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(x, 0, z);

    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.7 });
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // Main Fridge Cabinet
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5.2, 1.8), stainlessMat);
    body.position.y = 2.6;
    fridgeGroup.add(body);

    // Refrigerator Door (Hinged to open!)
    this.fridgeDoor = new THREE.Group();
    this.fridgeDoor.position.set(0.9, 0, 0.9); // Hinge pivot

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5.15, 0.15), stainlessMat);
    doorLeaf.position.set(-0.9, 2.6, 0);
    this.fridgeDoor.add(doorLeaf);

    // Door Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    handle.position.set(-1.6, 2.6, 0.12);
    this.fridgeDoor.add(handle);

    fridgeGroup.add(this.fridgeDoor);

    fridgeGroup.userData = {
      interactive: true,
      name: 'fridge',
      label: 'Refrigerator (Click or [E]: Open Door / Grab Drink)'
    };
    this.interactiveObjects.push(fridgeGroup);
    this.scene.add(fridgeGroup);
    this.addCollider(fridgeGroup);
  }

  buildBarStool(x, y, z) {
    const stool = new THREE.Group();
    stool.position.set(x, y, z);

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), chromeMat);
    pole.position.y = 0.85;
    stool.add(pole);

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16), seatMat);
    seat.position.y = 1.75;
    stool.add(seat);

    this.scene.add(stool);
    this.addCollider(stool, 0.05);
  }

  /* =========================================================================
     ZONE 4: FEATURE NAME BANNER "XIANLY RUNA" (CENTRAL SHOWCASE WALL)
     ========================================================================= */
  buildNameBannerZone() {
    // Wall X = 0, facing living room corridor, mounted high up with 3D extruded neon text
    const banner = create3DNameBanner("XIANLY RUNA", new THREE.Vector3(0.25, 4.8, 0));
    banner.rotation.y = Math.PI / 2; // Facing the hallway and living room!
    this.scene.add(banner);
  }

  /* =========================================================================
     INTERACTION TOGGLES
     ========================================================================= */
  toggleLamp() {
    this.lampState = !this.lampState;
    if (this.lampLight) this.lampLight.intensity = this.lampState ? 1.8 : 0;
    if (this.lampBulb) this.lampBulb.material.color.setHex(this.lampState ? 0xfef08a : 0x475569);
    return this.lampState;
  }

  toggleFloorLamp() {
    this.floorLampState = !this.floorLampState;
    if (this.floorLampLight) this.floorLampLight.intensity = this.floorLampState ? 2.2 : 0;
    if (this.floorLampBulb) this.floorLampBulb.material.color.setHex(this.floorLampState ? 0xfef08a : 0x475569);
    return this.floorLampState;
  }

  toggleTV() {
    this.tvChannel = (this.tvChannel + 1) % 2;
    return this.tvChannel;
  }

  toggleFridge() {
    this.fridgeOpen = !this.fridgeOpen;
    return this.fridgeOpen;
  }

  toggleStove() {
    this.stoveState = !this.stoveState;
    if (this.stoveFlameMesh) this.stoveFlameMesh.visible = this.stoveState;
    if (this.stoveFlameLight) this.stoveFlameLight.intensity = this.stoveState ? 1.5 : 0;
    return this.stoveState;
  }

  /* =========================================================================
     ANIMATION LOOP UPDATE
     ========================================================================= */
  update(time, audioPlaying) {
    this.updateTVCanvas(time);

    // Steam particles in coffee mug
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

    // Radio speaker vibrations
    if (audioPlaying && this.radioSpeakerLeft && this.radioSpeakerRight) {
      const scale = 1 + Math.sin(time * 24) * 0.06;
      this.radioSpeakerLeft.scale.set(scale, 1, scale);
      this.radioSpeakerRight.scale.set(scale, 1, scale);
    }

    // Fridge door smooth swing
    if (this.fridgeDoor) {
      const targetAngle = this.fridgeOpen ? 1.4 : 0;
      this.fridgeDoor.rotation.y = THREE.MathUtils.lerp(this.fridgeDoor.rotation.y, targetAngle, 0.1);
    }

    // Stove flame flicker
    if (this.stoveState && this.stoveFlameMesh) {
      this.stoveFlameMesh.scale.y = 1 + Math.sin(time * 30) * 0.25;
    }
  }
}
