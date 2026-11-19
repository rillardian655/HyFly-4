# HyFly-4 Changelog

## [25.1.0] - 2026-11-19
- Upgraded Master Bedroom with Rehman Double Bed 3D architectural model.
- Added procedural charcoal grey heather duvet fabric texture generator (`TextureGenerator.createCharcoalDuvetTexture`).
- Added procedural fine micro-grid pillow fabric texture generator (`TextureGenerator.createPillowFabricTexture`).
- Reconstructed floating plinth base, extended oak platform deck, horizontal grain headboard, deep mattress, draped skirts on left/right/foot, folded sheet collar, and dual tilted plump pillows.
- Exposed `window.player` and `window.houseBuilder` for programmatic debugging.

## [25.0.0] - 2026-11-19
- Switched to 100% offline local Three.js bundle in `vendor/three/` (no CDN timeouts).
- Added startup loading screen overlay with WebGL error fallback banner.
- Added Sitting emote [6] with relaxed upper and lower body kinematics.
- Added First-Person POV camera mode.
- Added Outdoor Garden Terrace zone with stone deck and glass railing.
- Added interactive stone fireplace hearth with warm flickering light.
- Added 6th automated unit test suite (`tests/garden.test.js`).

## [24.0.0] - 2026-11-19
- Removed dust motes and volumetric light planes for clean architectural aesthetic.
- Added dynamic PMREM architectural environment map for PBR reflections.
- Added high-resolution honey-oak plank floor texture with groove bump maps.
- Added Photo Mode clean capture toggle ([P]).
- Added interactive sink faucet with running water stream.
- Added refrigerator food props and spatial sounds.
