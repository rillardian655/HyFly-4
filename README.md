# HyFly-4: Contemporary 3D Residence with Elaina Character Exploration

HyFly-4 is an interactive three-dimensional virtual house and interior exploration application built for modern web browsers. Developed with Three.js WebGL rendering, Web Audio procedural synthesis, and modern HTML5 platform standards, the project features Elaina (from Wandering Witch: The Journey of Elaina) as the playable 3D character avatar, a multi-room Scandinavian and Japandi architectural residence, interactive appliances, rotating ceiling fans, framed gallery art, synchronized footstep audio, and custom 3D brass typography displaying the creator credit "XIANLY RUNA".

---

## Creator & Character Attribution

* **Lead Architect and Designer:** xianly runa
* **Display Name in Scene:** XIANLY RUNA (Rendered as 3D brushed champagne brass typography with warm gallery downlighting on the central feature wall)
* **Playable Character Avatar:** Elaina (Wandering Witch / Majo no Tabitabi)
* **Model Source:** Extracted and adapted from VRChat quest avatar asset package (`elaina-wandering-witch-vrchatquest-avatar.zip`)
* **GitHub Repository:** https://github.com/rillardian655/HyFly-4

---

## Character Model & Kinematics Engine

### 1. 3D Model Architecture
* **Skeletal Rig:** 800+ node humanoid rig loaded via Three.js `FBXLoader` (`assets/elaina/elaina.fbx`).
* **High-Resolution Textures:** Full PBR and cel-shaded material mapping with sRGB color space reproduction:
  * `Coat.png`: Signature witch overcoat and wizard hat
  * `Face.png`: Detailed expressive anime facial features
  * `Hair.png`: Flowing ash-blonde hair with alpha transparency
  * `Dress.png`: Pleated dress and inner garments
  * `body.png`: Skin mesh details and boots
  * `brooch_3.png`: Ornate golden witch guild brooch
  * `broom.png`: Magic wand and staff accessories

### 2. Procedural Animation System
* **Resting Pose Calibration:** Modulates default T-pose arms into a natural relaxed posture alongside the coat.
* **Locomotion Kinematics:** Dynamic leg swing, knee flexion, and arm swing synchronized with movement speed and sprint multipliers.
* **Idle Breathing:** Continuous spine and head pitch oscillations simulating natural breathing.
* **Synchronized Footstep Audio:** Real-time synthesis of hardwood floor contact sounds triggered on footfall down-beats.
* **Jump Mechanics:** Jump impulse with takeoff sound, airborne leg tuck, gravitational acceleration, and landing sound effect.

### 3. Third-Person Camera Rig
* Spherical coordinate camera following Elaina with smooth interpolation.
* Unconstrained horizontal mouse orbiting and vertical pitch clamping.
* Boundary clamping to eliminate camera clipping through exterior residence walls.
* Scroll wheel distance zoom with near and far clipping bounds.

---

## Architectural Layout and Interior Design

The residence is structured across a 28m by 28m floor plan divided into four interior zones and a central gallery corridor, utilizing light natural oak, white quartz, cream linen bouclé, and soft 2700K incandescent lighting:

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
* **Interactive Resting:** Approaching the bed allows Elaina to lie down and rest with contextual camera framing.

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
* **Proximity HUD:** An on-screen prompt displays automatically whenever Elaina approaches an interactable appliance or device.

---

## Project Structure

```
HyFly-4/
├── index.html          # HTML5 entry document, UI overlay, and modal templates
├── css/
│   └── style.css       # Warm contemporary styling, HUD, and modal containment
├── assets/
│   └── elaina/         # Elaina 3D model and high-resolution textures
│       ├── elaina.fbx  # Skinned humanoid FBX character model
│       └── textures/   # 2K/4K Face, Hair, Coat, Dress, Body, and Broom textures
├── js/
│   ├── main.js         # Game loop, proximity detection, and input coordinator
│   ├── player.js       # Elaina character controller, bone kinematics, and camera rig
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
