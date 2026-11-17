# HyFly-4: Interactive 3D Virtual Workspace

HyFly-4 is an interactive three-dimensional virtual workspace and productivity environment rendered directly in the web browser. The project combines WebGL rendering via Three.js, procedural audio synthesis using the Web Audio API, and modern semantic HTML5 platform standards to create an immersive, responsive desktop simulator.

---

## Overview

The application simulates a modern engineering workstation featuring custom low-poly geometries, physical-based rendering (PBR) materials, dynamic lighting scenarios, and interactive components. Users can navigate the 3D scene, toggle lighting and atmospheric parameters, listen to self-contained procedural lo-fi chords, and operate a simulated command-line terminal directly within the virtual monitor.

---

## Core Features

### 1. 3D Scene and Dynamic Lighting Engine
* **PBR Shading and Shadows:** Implemented using Three.js MeshStandardMaterial and MeshPhysicalMaterial with PCF Soft Shadow Mapping and ACES Filmic Tone Mapping.
* **Atmospheric Presets:** Real-time transition between Night, Day, and Sunset modes, altering ambient light intensities, sun angles, background hues, and background celestial coordinates.
* **Camera Rig:** OrbitControls integration configured with polar angle boundaries and distance constraints to prevent clipping beneath the floor plane.

### 2. Procedural Lo-Fi Audio Synthesis
* **Web Audio API Engine:** Generates mellow lo-fi chords in real time without external audio files or third-party dependencies.
* **Vinyl Noise Generator:** Simulates physical record crackle and hiss through buffer noise synthesis and bandpass filtering.
* **Sub-Bass and Lowpass Envelopes:** Smooth exponential frequency sweeps and gentle vibrato LFO modulations.
* **Audio Visualizer:** Fast Fourier Transform (FFT) frequency spectrum extraction rendered dynamically into header status indicators.
* **Tactile Sound Effects:** Synthesized audio feedback for mechanical switches, keypresses, window chimes, and mug interactions.

### 3. Integrated Virtual Workstation & Terminal
* **Interactive Shell:** In-engine terminal supporting system queries, project manifests, hardware diagnostics, and animated digital rain simulations.
* **Persistent Notepad:** Built-in scratchpad persisting state across sessions via browser local storage, with real-time character and word count tracking.
* **System Telemetry:** Simulated hardware telemetry display tracking CPU loads, memory allocation, and operational uptime.

### 4. Raycasting and Interactive Objects
* **Desk Lamp:** Interactive articulated desk lamp with physical PointLight toggling and emissive bulb updates.
* **Boombox Radio:** Retro sound system with reactive speaker cone vibration synchronized to active music synthesis.
* **Virtual PC:** Screen displaying live canvas telemetry; clicking launches the full workstation modal.
* **Window:** Direct viewport to the horizon that cycles the world lighting configuration on interaction.
* **Coffee Mug:** Ceramic mug with continuous steam particle kinematics.
* **Ergonomic Chair:** Swivel chair with physics-based rotary damping upon interaction.

---

## Technical Specifications

| Component | Technology | Description |
|---|---|---|
| Core Rendering | Three.js (v0.160.0) | WebGL scene graph, camera frustum, shadow casting |
| Controls | Three.js OrbitControls | Damped spherical coordinate orbit controller |
| Audio Engine | Web Audio API | Procedural chord oscillator, noise buffer, analyser |
| Layout & Styles | Modern CSS3 | Glassmorphic overlay, CSS variables, modal containment |
| Dialog System | HTML5 Dialog Element | Native modal overlay with light-dismiss fallback |
| Language | ECMAScript 2022+ | Modular ES modules, strict event delegation |

---

## Interactive Controls Reference

### Mouse and Navigation
* **Left Click + Drag:** Rotate camera view around workstation focal point.
* **Right Click + Drag:** Pan camera horizontally and vertically.
* **Scroll Wheel:** Zoom camera in and out within configured distance bounds.
* **Pointer Hover:** Inspect interactive objects and reveal target labels.
* **Left Click on Object:** Trigger contextual item action (power switch, terminal launch, audio playback).

### Keyboard Shortcuts (Terminal Modal)
* **Enter:** Execute typed terminal command.
* **Up / Down Arrow:** Navigate terminal command history.
* **Escape:** Dismiss active workstation modal dialog.

---

## Terminal Command Reference

| Command | Arguments | Description |
|---|---|---|
| `help` | None | Displays the reference table of supported terminal commands. |
| `about` | None | Prints architectural and project overview information. |
| `neofetch` / `specs` | None | Displays system environment information and ASCII banner. |
| `projects` | None | Lists connected robotics, game, and software projects. |
| `skills` | None | Summarizes primary engineering competencies and tech stack. |
| `matrix` | None | Starts a green digital rain animation stream. |
| `date` / `time` | None | Outputs the current system time in UTC format. |
| `echo` | `<message>` | Echoes supplied message to the terminal screen. |
| `clear` | None | Clears the terminal output buffer. |
| `exit` | None | Closes the virtual workstation dialog modal. |

---

## Project Structure

```
HyFly-4/
├── index.html          # Application entry point, UI overlay, and dialog structures
├── css/
│   └── style.css       # Core styles, glassmorphic layout, and dialog rules
├── js/
│   ├── main.js         # Main loop, raycasting delegation, and lifecycle hooks
│   ├── scene.js        # Three.js setup, camera, lighting, and environment modes
│   ├── room.js         # Procedural 3D mesh construction and material definitions
│   ├── audio.js        # Web Audio API synthesizer, lo-fi chords, and sound FX
│   ├── ui.js           # Header HUD, visualizer, tabs, and toast notifications
│   └── terminal.js     # Virtual terminal commands, scratchpad, and spec monitors
├── LICENSE             # Project open-source license
└── README.md           # Technical documentation and reference manual
```

---

## Getting Started

### Prerequisites
A modern web browser with WebGL2 and Web Audio API support (such as Chrome 116+, Edge 116+, Firefox 125+, or Safari 17+).

### Running Locally
Because this project utilizes ES Modules (`import`/`export`) and native import maps, it should be served via an HTTP server.

1. Clone or navigate to the project directory:
   ```bash
   cd Hyfly-3
   ```

2. Start a lightweight local server:
   * Using Python:
     ```bash
     python3 -m http.server 8000
     ```
   * Using Node.js:
     ```bash
     npx serve .
     ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## Accessibility and Compliance

* **Modal Focus and Trap Management:** Uses the native `<dialog>` element for modal layering, ensuring standard keyboard navigation, top-layer isolation, and `Esc` key dismissal.
* **Scroll Chaining Prevention:** Applies `overscroll-behavior: contain` to `:modal` and `::backdrop` selectors to prevent scrolling chaining to the underlying document.
* **Light Dismiss:** Implements pointer boundary detection for browsers without native `closedby="any"` support.

---

## License

This project is distributed under the MIT License. Refer to the LICENSE file for full license terms.

Author: rillardian655
Repository: https://github.com/rillardian655/HyFly-4
