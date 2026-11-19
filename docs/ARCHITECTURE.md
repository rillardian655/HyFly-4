# HyFly-4 System Architecture

HyFly-4 is an architectural 3D browser exploration experience powered by Three.js (r160) and authentic 3D skeletal character animation.

## Core Subsystems

1. SceneManager (`js/scene.js`):
   - WebGLRenderer with ACESFilmic tone mapping and PCFSoftShadowMap.
   - Dynamic PMREM architectural environment map generated procedurally.
   - Balanced sunlight, ambient bounce, and soft point downlights.

2. PlayerController (`js/player.js`):
   - Human gait cycle with anti-phase leg and arm swing kinematics.
   - Third-person spherical coordinate camera rig.
   - Flight mode physics with aerial hover and descent controls.

3. HouseBuilder (`js/house.js`):
   - Multi-room Scandinavian and Japandi interior architecture.
   - Raycasted interactive appliances and animated components.
