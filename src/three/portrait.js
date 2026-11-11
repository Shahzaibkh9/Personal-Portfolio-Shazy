import * as THREE from 'three'
import gsap from 'gsap'

/*
 * Plays the suit → hoodie frame sequence on a WebGL plane.
 * Frame 0 = suit (dev), last frame = hoodie (hacker).
 * During the switch a glitch / pixelate burst covers the
 * middle of the clip where the AI video cross-fades.
 */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uGlitch;
  uniform float uHack;
  uniform vec2 uRes;
  varying vec2 vUv;

  float rnd(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float tick = floor(uTime * 14.0);
    float idle = uHack * step(0.97, rnd(vec2(tick, 1.7))) * 0.45;
    float G = clamp(uGlitch + idle, 0.0, 1.0);

    // horizontal block tearing
    float rows = mix(12.0, 46.0, rnd(vec2(tick, 3.1)));
    float row = floor(uv.y * rows);
    float r = rnd(vec2(row, tick));
    uv.x += (r - 0.5) * 0.14 * G * step(0.5, r);

    // pixelate while switching
    float g2 = uGlitch * uGlitch;
    if (uGlitch > 0.02) {
      vec2 px = vec2(mix(600.0, 34.0, g2), mix(900.0, 51.0, g2));
      uv = (floor(uv * px) + 0.5) / px;
    }

    // chromatic split
    float split = 0.0025 * uHack + 0.03 * G;
    vec3 col = vec3(
      texture2D(uTex, uv + vec2(split, 0.0)).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - vec2(split, 0.0)).b);

    // grade: green phosphor (hacker) vs warm neutral (dev)
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 hackCol = vec3(0.42, 1.0, 0.66) * l * 1.18 + vec3(0.0, 0.025, 0.012);
    vec3 devCol = col * vec3(1.05, 1.0, 0.94);
    col = mix(devCol, hackCol, uHack * 0.88);

    // scanlines + moving scan beam
    float sl = 0.5 + 0.5 * sin(vUv.y * uRes.y * 1.3);
    col *= 1.0 - (0.13 * uHack + 0.3 * G) * sl;
    float beamY = 1.0 - fract(uTime * 0.16);
    float beam = exp(-pow((vUv.y - beamY) * 38.0, 2.0));
    col += vec3(0.1, 0.55, 0.3) * beam * 0.35 * uHack;

    // glitch colour flashes
    float flash = step(0.86, rnd(vec2(row * 1.3, tick + 2.0))) * G;
    col = mix(col, vec3(0.0, 1.0, 0.55) * (0.4 + l), flash * 0.55);

    // film noise
    col += (rnd(vUv * uRes + fract(uTime)) - 0.5) * 0.07 * (uHack + G);

    // edge fade: in hacker mode the portrait dissolves into the darkness
    float ex = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    float ey = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    float a = mix(1.0, ex * ey, uHack);
    a *= 1.0 - step(0.94, rnd(vec2(row, tick + 9.0))) * uGlitch;

    gl_FragColor = vec4(col * a, a);
  }
`

export function createPortrait(canvas, frames, { mode, reducedMotion, lowPower }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)

  const last = frames.length - 1
  const state = { frame: mode === 'hacker' ? last : 0 }
  let shown = -1

  const tex = new THREE.Texture(frames[Math.round(state.frame)])
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true

  const uniforms = {
    uTex: { value: tex },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uHack: { value: mode === 'hacker' ? 1 : 0 },
    uRes: { value: new THREE.Vector2(600, 900) },
  }
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, blending: THREE.NoBlending })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  mesh.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(mesh)
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const resize = () => {
    const r = canvas.getBoundingClientRect()
    if (!r.width) return
    renderer.setSize(r.width, r.height, false)
    uniforms.uRes.value.set(r.width, r.height)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(canvas)

  let raf = 0
  let prev = performance.now()
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min((now - prev) / 1000, 0.05)
    prev = now
    if (!visible || document.hidden) return
    uniforms.uTime.value += reducedMotion ? 0 : dt
    const f = Math.round(state.frame)
    if (f !== shown) {
      tex.image = frames[f]
      tex.needsUpdate = true
      shown = f
    }
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  let tl = null
  return {
    setMode(m) {
      const toHack = m === 'hacker'
      if (tl) tl.kill()
      if (reducedMotion) {
        state.frame = toHack ? last : 0
        uniforms.uHack.value = toHack ? 1 : 0
        return
      }
      const D = 2.1
      tl = gsap.timeline()
      tl.to(state, { frame: toHack ? last : 0, duration: D, ease: 'power1.inOut' }, 0)
      tl.to(uniforms.uGlitch, { value: 1, duration: 0.35, ease: 'power2.in' }, D * 0.28)
      tl.to(uniforms.uGlitch, { value: 0, duration: 0.55, ease: 'power2.out' }, D * 0.62)
      tl.to(uniforms.uHack, { value: toHack ? 1 : 0, duration: 0.5, ease: 'none' }, D * 0.35)
    },
    dispose() {
      if (tl) tl.kill()
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      tex.dispose()
      mat.dispose()
      renderer.dispose()
    },
  }
}
