# HyFly-4 JavaScript API Documentation

## SceneManager (`js/scene.js`)
- `setEnvironmentMode(mode: 'day' | 'sunset' | 'night')`: Switches sky, sun, and ambient lighting.
- `cycleEnvironment()`: Cycles through available environment presets.
- `render()`: Executes WebGL draw calls for the active frame.

## PlayerController (`js/player.js`)
- `playEmote(type: 'wave' | 'cast' | 'book' | 'bow')`: Triggers character animation override.
- `toggleFlight()`: Mounts broom and enables 3D aerial locomotion.
- `cycleCameraView()`: Cycles between full body, top-down, and close-up views.
