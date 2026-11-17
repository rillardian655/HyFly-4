# HyFly-4: Interactive 3D Virtual House and Exploration World

HyFly-4 is an interactive three-dimensional virtual house and exploration environment rendered in the web browser. Built on Three.js WebGL rendering, Web Audio procedural synthesis, and modern HTML5 platform standards, the project features a controllable 3D humanoid character, a multi-room architectural interior, interactive appliances, and custom 3D typography displaying the creator credit "XIANLY RUNA".

---

## Creator Information

* **Architect and Lead Developer:** xianly runa
* **Display Name in Scene:** XIANLY RUNA (Rendered as 3D extruded neon block typography on the central feature wall)
* **GitHub Repository:** https://github.com/rillardian655/HyFly-4

---

## Architectural Layout and Zones

The virtual world spans a 28m by 28m architectural plan divided into distinct functional zones with physical boundary colliders:

### 1. Central Showcase Wall
* Features a high-mounted, illuminated 3D neon typography banner reading **"XIANLY RUNA"** constructed from procedural volumetric glyphs with cyan and amber emissive properties and dedicated point-light projectors.
* Serves as the central corridor connecting all interior zones.

### 2. Workstation and Cyber Studio (North-West Zone)
* **Ultrawide Computer Setup:** High-resolution monitor displaying animated system telemetry canvas; interacting opens the full-screen terminal modal.
* **Articulated Desk Lamp:** Interactive desk light featuring real-time point lighting and dynamic shade glow.
* **Lo-Fi Audio Boombox:** Synthesizer station with animated speaker cones reacting to music synthesis.
* **Desk Accessories:** Mechanical keyboard, precision mouse, coffee mug with active steam particle physics, and floating wall bookshelves.

### 3. Living Room (North-East Zone)
* **Sectional L-Shaped Sofa:** Plush lounge furniture with resting interaction.
* **Wall-Mounted Smart TV:** Generates real-time procedural video channels (Channel 01: Synthwave Horizon flight stream, Channel 02: UAV telemetry and radar tracking).
* **Standing Floor Lamp:** Floor lighting fixture with room-filling illumination.
* **Modern Fireplace:** Stone hearth with ember glow and warm ambient light.
* **Lounge Table and Floor Rug:** Low-profile center table and textured textile rug.

### 4. Kitchen and Dining (South-West Zone)
* **Island Kitchen Counter:** White marble countertop with under-cabinet storage.
* **Double-Door Refrigerator:** Hinged door mechanism that swings open on interaction.
* **Induction and Gas Stove:** Functional range with toggleable blue flame ignition and localized point light.
* **Bar Stools and Sink:** Stainless steel sink, faucet, and high bar seating.

---

## Character Kinematics and Camera System

### 1. Humanoid Player Avatar
* Stylized 3D character equipped with a jacket, backpack, headgear, visor, and dual-tone limbs.
* Procedural skeletal walk cycle: Dynamic arm and leg swinging synchronized to linear velocity and sprint multipliers.
* Physics kinematics: Jump impulse calculation, gravitational acceleration, and ground contact detection.

### 2. Collision Detection
* Axis-Aligned Bounding Box (AABB) collision checks against perimeter walls, interior partitions, desks, counters, appliances, and furniture objects.
* Dynamic sliding resolution along unobstructed axes to maintain smooth locomotion.

### 3. Third-Person Camera Rig
* Spherical coordinate camera following the player avatar with smooth damping.
* Unconstrained horizontal mouse orbiting and vertical pitch clamping to eliminate disorientation.
* Mouse wheel distance zoom with near and far clipping bounds.

---

## Procedural Lo-Fi Audio Synthesis Engine

* **Real-Time Chord Synthesizer:** Built completely on the native Web Audio API without pre-recorded MP3 or WAV dependencies.
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
* **Spacebar:** Jump.
* **Mouse Drag:** Rotate third-person camera perspective.
* **Mouse Scroll Wheel:** Zoom camera distance.

### Interaction
* **E Key or Left Click:** Trigger interaction when near an active object.
* **Proximity HUD:** An on-screen prompt displays automatically whenever the player approaches an interactable appliance or device.

---

## Terminal Command Reference

Accessible via the Workstation PC monitor:

| Command | Arguments | Description |
|---|---|---|
| `help` | None | Displays the reference table of supported terminal commands. |
| `about` | None | Outputs project architecture and author information. |
| `neofetch` / `specs` | None | Prints hardware configuration, OS specs, and ASCII banner. |
| `projects` | None | Lists connected robotics, simulation, and software repositories. |
| `skills` | None | Summarizes primary technical domains and toolchains. |
| `matrix` | None | Launches an animated green digital rain terminal stream. |
| `date` / `time` | None | Outputs current system date and UTC time. |
| `echo` | `<text>` | Echoes input string back to terminal buffer. |
| `clear` | None | Clears terminal screen history. |
| `exit` | None | Dismisses workstation terminal modal dialog. |

---

## Project Structure

```
HyFly-4/
├── index.html          # HTML5 entry document, UI overlay, and modal templates
├── css/
│   └── style.css       # Core styling, glassmorphism, HUD, and modal containment
├── js/
│   ├── main.js         # Game loop, proximity detection, and input coordinator
│   ├── player.js       # Player character avatar, walk kinematics, and camera rig
│   ├── house.js        # Multi-room architecture, furniture, and appliances
│   ├── text3d.js       # Procedural 3D block typography for "XIANLY RUNA"
│   ├── scene.js        # Three.js WebGL scene, lighting, and day-night presets
│   ├── audio.js        # Web Audio API lo-fi synthesizer and sound effects
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

## Accessibility and Platform Standards

* **Native Dialog Layer:** Workstation window is implemented using the standard `<dialog>` element via `showModal()`.
* **Scroll Containment:** Styled with `overscroll-behavior: contain` on both `dialog:modal` and `dialog::backdrop` selectors.
* **Light-Dismiss Fallback:** Robust pointer position boundary checking ensuring graceful dismissal on external click across all browsers.

---

## License

This project is licensed under the MIT License. See the LICENSE file for full license details.

Author: xianly runa
Repository: https://github.com/rillardian655/HyFly-4
