# HyFly-4: Contemporary 3D Architectural Residence and Virtual World

HyFly-4 is an interactive three-dimensional virtual house and interior exploration application built for modern web browsers. Developed with Three.js WebGL rendering, Web Audio procedural synthesis, and modern HTML5 platform standards, the project features a controllable third-person casual avatar, a multi-room Scandinavian and Japandi architectural residence, interactive appliances, rotating ceiling fans, framed gallery art, synchronized footstep audio, and custom 3D brass typography displaying the creator credit "XIANLY RUNA".

---

## Creator Information

* **Lead Architect and Designer:** xianly runa
* **Display Name in Scene:** XIANLY RUNA (Rendered as 3D brushed champagne brass typography with warm gallery downlighting on the central feature wall)
* **GitHub Repository:** https://github.com/rillardian655/HyFly-4

---

## Architectural Layout and Interior Design

The residence is structured across a 28m by 28m floor plan divided into four distinct interior zones and a central gallery corridor, utilizing light natural oak, white quartz, cream linen bouclé, and soft 2700K incandescent lighting:

### 1. Central Feature Wall & Corridor
* Features a prominent 3D brushed champagne brass typography installation reading **"XIANLY RUNA"** mounted on an architectural plaster backplate with dedicated warm gallery downlights.
* Serves as the central corridor connecting the studio, living room, kitchen, and bedroom.

### 2. Creative Studio and Workstation (North-West Zone)
* **Solid Oak Desk:** Natural oak desk with matte black architectural legs.
* **Minimalist Monitor:** Clean aluminum-frame desktop display featuring live canvas telemetry; interacting launches the workstation terminal modal.
* **Pleated Fabric Desk Lamp:** Warm incandescent lighting fixture with paper lampshade.
* **Acoustic Tabletop Radio:** Natural walnut audio player generating procedural lo-fi chords.
* **Botanical Decor:** Potted Monstera houseplant in a terracotta planter and steaming ceramic espresso mug.
* **Floating Bookshelves:** Oak wall shelving holding books and decor.
* **Architectural Ceiling Fan:** Three-blade natural wood ceiling fan with continuous rotary motion.

### 3. Scandinavian Living Room (North-East Zone)
* **Oatmeal Boucle Sectional Sofa:** Generous lounge couch with linen accent cushions and mid-century oak legs.
* **Solid Oak Round Coffee Table:** Low-profile natural wood table on a textured wool rug.
* **OLED Smart TV on Oak Media Credenza:** Generates procedural video feeds (Channel 01: Golden hour nature lounge stream, Channel 02: Architecture and design showcase).
* **Japanese Akari Paper Floor Lamp:** Tripod wireframe floor lamp emitting soft diffused warmth.
* **Limestone Fireplace:** Natural stone hearth with warm firelight.
* **Framed Gallery Art:** Large geometric minimalist canvas art print with solid oak frame.
* **Architectural Ceiling Fan:** Dedicated living room wooden ceiling fan.

### 4. Kitchen and Dining (South-West Zone)
* **Island Counter:** White quartz countertop with natural oak cabinetry and undermount black steel sink.
* **Matte White Refrigerator:** Clean contemporary refrigerator with swinging door and interior illumination.
* **Gas Stove Range:** Minimalist cooktop with toggleable blue flame and lighting.
* **Oak Counter Stools:** Saddle-seat wooden stools with matte black steel footrest rings.

### 5. Master Bedroom Suite (South-East Zone)
* **Platform Bed:** Low-profile solid oak platform bed with thick mattress, folded linen duvet, and plush sleeping pillows.
* **Oak Nightstands:** Twin bedside tables with warm shaded night lamps.
* **Interactive Resting:** Approaching the bed allows the player to lie down and rest with contextual camera framing.

---

## Character Kinematics and Sound Engine

### 1. Casual Player Avatar
* Realistic, grounded character styling free of sci-fi or robotic elements: Cozy cream knit wool crewneck sweater, dark slate chino trousers, and clean white leather sneakers.
* Procedural skeletal walk cycle: Dynamic arm and leg swinging synchronized to linear velocity and sprint multipliers.
* Physics kinematics: Jump impulse calculation, gravitational acceleration, and ground contact detection.

### 2. Synchronized Footstep Synthesis
* Real-time audio generation triggering subtle hardwood contact impulses on footfall down-beats during walking and sprinting.
* Jump takeoff audio impulse and landing impact sound effects.

### 3. Third-Person Camera Rig
* Spherical coordinate camera following the player avatar with smooth damping.
* Horizontal mouse orbiting and vertical pitch clamping.
* Boundary clamping to prevent camera clipping through exterior house walls.
* Mouse wheel distance zoom with near and far clipping bounds.

---

## Procedural Lo-Fi Audio Synthesis Engine

* **Real-Time Chord Synthesizer:** Built completely on the native Web Audio API without pre-recorded audio files.
* **Subtractive Lowpass Filtering:** Dynamic filter envelope shaping lo-fi jazz chord progressions.
* **Vinyl Noise Generator:** Procedural crackle and surface hiss synthesized via custom audio buffer noise.
* **Tactile Sound Effects:** Synthesized audio cues for mechanical switches, keyboard strokes, window transitions, and appliance interactions.
* **Audio Visualizer:** Fast Fourier Transform (FFT) frequency spectrum extraction rendered into the top HUD status bar.

---

## Interactive Controls Reference

### Movement and Exploration
* **W / Arrow Up:** Walk forward.
* **S / Arrow Down:** Walk backward.
* **A / Arrow Left:** Turn / strafe left.
* **D / Arrow Right:** Turn / strafe right.
* **Left Shift / Right Shift:** Sprint.
* **Spacebar:** Jump (with takeoff and landing audio).
* **Mouse Drag:** Rotate third-person camera perspective.
* **Mouse Scroll Wheel:** Zoom camera distance.

### Interaction
* **E Key or Left Click:** Trigger interaction when near an active object.
* **Proximity HUD:** An on-screen prompt displays automatically whenever the player approaches an interactable appliance or device.

---

## Project Structure

```
HyFly-4/
├── index.html          # HTML5 entry document, UI overlay, and modal templates
├── css/
│   └── style.css       # Warm contemporary styling, HUD, and modal containment
├── js/
│   ├── main.js         # Game loop, proximity detection, and input coordinator
│   ├── player.js       # Casual character avatar, walk kinematics, and camera rig
│   ├── house.js        # Multi-room architecture, bedroom, furniture, and fans
│   ├── text3d.js       # Vector-extruded 3D brass typography for "XIANLY RUNA"
│   ├── textures.js     # Procedural oak, quartz, linen, art, and shadow textures
│   ├── scene.js        # Three.js WebGL scene, warm lighting, and sky presets
│   ├── audio.js        # Web Audio API lo-fi synthesizer, footsteps, and SFX
│   ├── ui.js           # HUD status bars, tabs, visualizer, and notifications
│   └── terminal.js     # Virtual terminal commands, specs, and local notes
├── LICENSE             # Project MIT open-source license
└── README.md           # Technical documentation and reference manual
```

---

## Getting Started

### Prerequisites
A modern web browser supporting WebGL2 and Web Audio API (Chrome 116+, Edge 116+, Firefox 125+, Safari 17+).

### Running Locally
Because this project utilizes ES Modules and native browser import maps, it must be served through an HTTP server:

```bash
# Navigate to the project directory
cd Hyfly-3

# Start Python HTTP server
python3 -m http.server 8000
```

Open your browser and navigate to:
```
http://localhost:8000
```

---

## License

This project is licensed under the MIT License. See the LICENSE file for full license details.

Author: xianly runa
Repository: https://github.com/rillardian655/HyFly-4
