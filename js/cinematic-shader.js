/**
 * High-End Cinematic Post-Processing Shader for HyFly-4
 * Provides:
 * - Lens Chromatic Aberration at frame edges
 * - Anime Warmth / Color Grading S-curve
 * - Vignette for natural composition focus
 * - Micro-film grain / dither to eliminate 8-bit banding
 * - Saturation & Contrast enhancement
 */
export const CinematicShader = {
  name: 'CinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteDarkness: { value: 0.88 },
    uVignetteOffset: { value: 1.18 },
    uSaturation: { value: 1.15 },
    uWarmth: { value: 0.032 },
    uContrast: { value: 1.05 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignetteDarkness;
    uniform float uVignetteOffset;
    uniform float uSaturation;
    uniform float uWarmth;
    uniform float uContrast;
    varying vec2 vUv;

    // High quality pseudo-random for film grain
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Subtle optical dispersion (chromatic aberration) at edges
      vec2 center = vec2(0.5, 0.5);
      vec2 dir = vUv - center;
      float distSq = dot(dir, dir);
      float caOffset = distSq * 0.0032;

      float r = texture2D(tDiffuse, vUv + dir * caOffset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * caOffset).b;
      vec3 color = vec3(r, g, b);

      // Contrast enhancement
      color = (color - 0.5) * uContrast + 0.5;

      // Japanese anime warmth grading (subtle golden highlights, clean shadows)
      color.r += uWarmth * 0.70;
      color.g += uWarmth * 0.30;
      color.b -= uWarmth * 0.22;

      // Vibrancy / Saturation boost
      float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(lum), color, uSaturation);

      // Soft vignette around edges
      vec2 vUvOffset = (vUv - center) * vec2(uVignetteOffset);
      float vig = clamp(1.0 - dot(vUvOffset, vUvOffset) * uVignetteDarkness, 0.0, 1.0);
      color *= vig;

      // Ultra-fine film grain (prevents 8-bit banding on gradients)
      float grain = (hash(vUv * 3.5 + fract(uTime * 0.08)) - 0.5) * 0.015;
      color += grain;

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `
};

