import * as THREE from 'three'
import gsap from 'gsap'

/*
 * One particle system, two shapes:
 *   hacker → a rotating "network globe" with orbit rings
 *   dev    → a 3D "</>" symbol
 * A shared star-field stays in place in both modes.
 * uP morphs 0 (hacker) → 1 (dev); every particle has its own delay and
 * scatters outward mid-flight, so the switch reads as an explosion + rebuild.
 */

const vert = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec4 aR;
  uniform float uP;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  uniform float uMotion;
  varying float vMix;
  varying float vTw;
  varying float vAccent;

  void main() {
    float delay = aR.x * 0.4;
    float p = clamp((uP - delay) / 0.6, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = mix(aA, aB, p);
    float burst = sin(3.14159265 * p);
    pos += (aR.yzw - 0.5) * 4.0 * burst;
    pos += uMotion * 0.05 * vec3(
      sin(uTime * 0.8 + aR.x * 40.0),
      cos(uTime * 0.7 + aR.y * 40.0),
      sin(uTime * 0.6 + aR.z * 40.0));
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR * (0.55 + aR.y * 0.9) * (1.0 + burst * 0.6) * (1.0 + p * 0.3) / -mv.z;
    vMix = p;
    vTw = 0.55 + 0.45 * sin(uTime * (1.0 + aR.z * 2.0) + aR.w * 60.0);
    vAccent = step(0.9, aR.w);
  }
`

const frag = /* glsl */ `
  precision mediump float;
  uniform vec3 uHackA;
  uniform vec3 uHackB;
  uniform vec3 uDevA;
  uniform vec3 uDevB;
  uniform float uOpacity;
  varying float vMix;
  varying float vTw;
  varying float vAccent;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a < 0.01) discard;
    vec3 hack = mix(uHackA, uHackB, vAccent);
    vec3 dev = mix(uDevA, uDevB, vAccent);
    vec3 col = mix(hack, dev, vMix);
    float tw = mix(vTw, 0.75 + vTw * 0.25, vMix);
    gl_FragColor = vec4(col, a * tw * uOpacity);
  }
`

function sampleText(count) {
  const W = 512
  const H = 256
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 200px "JetBrains Mono", "Courier New", monospace'
  ctx.fillText('</>', W / 2, H / 2 + 8)
  const data = ctx.getImageData(0, 0, W, H).data
  const pts = []
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y])
    }
  }
  const out = []
  const scale = 9.6 / W
  for (let i = 0; i < count; i++) {
    const [x, y] = pts[Math.floor(Math.random() * pts.length)] || [W / 2, H / 2]
    out.push([
      (x - W / 2) * scale + (Math.random() - 0.5) * 0.03,
      -(y - H / 2) * scale + (Math.random() - 0.5) * 0.03,
      (Math.random() - 0.5) * 0.7,
    ])
  }
  return out
}

export function createParticles(canvas, { mode, lowPower, reducedMotion, anchor }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, 9)

  const COUNT = lowPower ? 2600 : 6000
  const nField = Math.floor(COUNT * 0.16)
  const nRing = Math.floor(COUNT * 0.14)
  const nShape = COUNT - nField - nRing

  const A = new Float32Array(COUNT * 3)
  const B = new Float32Array(COUNT * 3)
  const R = new Float32Array(COUNT * 4)
  const textPts = sampleText(nShape + nRing)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const RAD = 2.5

  for (let i = 0; i < COUNT; i++) {
    let a
    let b
    if (i < nShape) {
      // fibonacci sphere globe
      const y = 1 - (i / (nShape - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      a = [Math.cos(th) * r * RAD, y * RAD, Math.sin(th) * r * RAD]
      b = textPts[i]
    } else if (i < nShape + nRing) {
      // two tilted orbit rings
      const k = i - nShape
      const t = Math.random() * Math.PI * 2
      const ringR = k % 2 ? 3.3 : 3.8
      const tilt = k % 2 ? 0.45 : -0.3
      const x = Math.cos(t) * ringR
      const z = Math.sin(t) * ringR
      a = [x, z * Math.sin(tilt), z * Math.cos(tilt)]
      b = textPts[i]
    } else {
      // star field — identical in both modes
      a = [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 13, (Math.random() - 0.5) * 8 - 2]
      b = a
    }
    A.set(a, i * 3)
    B.set(b, i * 3)
    R.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(A, 3))
  geo.setAttribute('aA', new THREE.BufferAttribute(A, 3))
  geo.setAttribute('aB', new THREE.BufferAttribute(B, 3))
  geo.setAttribute('aR', new THREE.BufferAttribute(R, 4))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30)

  const uniforms = {
    uP: { value: mode === 'dev' ? 1 : 0 },
    uTime: { value: 0 },
    uSize: { value: lowPower ? 34 : 30 },
    uPR: { value: renderer.getPixelRatio() },
    uMotion: { value: reducedMotion ? 0 : 1 },
    uOpacity: { value: 1 },
    uHackA: { value: new THREE.Color('#00ff88') },
    uHackB: { value: new THREE.Color('#00d9ff') },
    uDevA: { value: new THREE.Color('#2563eb') },
    uDevB: { value: new THREE.Color('#f59e0b') },
  }
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
  })
  const points = new THREE.Points(geo, mat)
  const group = new THREE.Group()
  group.add(points)
  scene.add(group)

  let w = 1
  let h = 1
  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // centre the shape behind the portrait (in page coords, as if scrolled to top)
    const halfH = 9 * Math.tan(THREE.MathUtils.degToRad(25))
    const halfW = halfH * camera.aspect
    const el = anchor && anchor()
    if (el) {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + window.scrollY + r.height / 2
      group.position.set((cx / w) * 2 * halfW - halfW, halfH - (cy / h) * 2 * halfH, 0)
      const portraitH = (r.height / h) * 2 * halfH
      group.scale.setScalar(THREE.MathUtils.clamp(portraitH / 4.2, 0.5, 1.25))
    } else {
      group.position.set(0, 0, 0)
    }
  }
  resize()
  window.addEventListener('resize', resize)
  const ro = typeof ResizeObserver !== 'undefined' && anchor && anchor() ? new ResizeObserver(resize) : null
  if (ro) ro.observe(anchor())

  const mouse = { x: 0, y: 0 }
  const onMove = (e) => {
    mouse.x = e.clientX / w - 0.5
    mouse.y = e.clientY / h - 0.5
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  let spin = 0
  let raf = 0
  let last = performance.now()
  const speed = reducedMotion ? 0.25 : 1
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    uniforms.uTime.value += dt * speed
    const P = uniforms.uP.value
    spin += dt * 0.12 * speed
    const wrapped = Math.atan2(Math.sin(spin), Math.cos(spin))
    const sway = Math.sin(uniforms.uTime.value * 0.4) * 0.35
    group.rotation.y = wrapped * (1 - P) + sway * P
    group.rotation.x = 0.18 * (1 - P) + Math.sin(uniforms.uTime.value * 0.3) * 0.06 * P

    const sc = Math.min(window.scrollY / h, 1.5)
    uniforms.uOpacity.value = 1 - Math.min(sc, 1) * 0.72
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04
    camera.position.y += (-mouse.y * 0.5 + sc * 0.6 - camera.position.y) * 0.04
    camera.position.z = 9 + sc * 1.5
    camera.lookAt(0, sc * 0.6, 0)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    setMode(m, instant = false) {
      if (instant) {
        gsap.killTweensOf(uniforms.uP)
        uniforms.uP.value = m === 'dev' ? 1 : 0
        return
      }
      gsap.to(uniforms.uP, {
        value: m === 'dev' ? 1 : 0,
        duration: reducedMotion ? 0.6 : 2.2,
        ease: 'power2.inOut',
        overwrite: true,
      })
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (ro) ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    },
  }
}
