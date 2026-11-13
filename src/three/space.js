import * as THREE from 'three'
import gsap from 'gsap'

/*
 * Landing scene: first-person flight through an asteroid field.
 * - procedural nebula sky with a huge light beam ahead (backlights the rocks)
 * - instanced, noise-displaced asteroids streaming toward the camera
 * - space-dust streaks whose length grows with speed
 * - warp(): accelerates into a light-speed jump
 */

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`

const skyFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uLightDir;
  uniform float uWarp;
  varying vec3 vDir;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float t = uTime * 0.02;

    // nebula clouds
    float n = fbm(d * 2.6 + vec3(t, 0.0, -t));
    float n2 = fbm(d * 6.0 - vec3(0.0, t * 2.0, 0.0));
    vec3 col = mix(vec3(0.004, 0.01, 0.03), vec3(0.03, 0.09, 0.2), smoothstep(0.35, 0.85, n));
    col += vec3(0.02, 0.07, 0.14) * smoothstep(0.55, 0.9, n2) * 0.8;

    // the light source ahead + volumetric-looking rays around it
    float c = max(dot(d, uLightDir), 0.0);
    vec3 axisA = normalize(cross(uLightDir, vec3(0.0, 1.0, 0.0)));
    vec3 axisB = cross(axisA, uLightDir);
    float ang = atan(dot(d, axisB), dot(d, axisA));
    float rays = fbm(vec3(ang * 3.2, t * 3.0, 0.0)) * fbm(vec3(ang * 9.0, -t * 2.0, 4.0));
    col += vec3(0.55, 0.78, 1.0) * pow(c, 90.0) * 3.0;
    col += vec3(0.35, 0.6, 1.0) * pow(c, 14.0) * 0.9;
    col += vec3(0.2, 0.45, 0.9) * pow(c, 4.0) * 0.35;
    col += vec3(0.4, 0.65, 1.0) * pow(c, 6.0) * smoothstep(0.35, 0.8, rays) * 1.4;

    // stars
    vec3 sp = d * 420.0;
    float s = hash(floor(sp));
    float star = step(0.9975, s) * (0.5 + 0.5 * sin(uTime * 2.0 + s * 80.0));
    col += vec3(0.75, 0.85, 1.0) * star * 0.9;

    col *= 1.0 + uWarp * 1.5;
    gl_FragColor = vec4(col, 1.0);
  }
`

function makeRock(seed, detail) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  const s1 = seed * 1.7
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * 2.1 + s1) * Math.cos(v.y * 2.4 - s1) * 0.22 +
      Math.sin(v.z * 3.3 + s1 * 2.0) * 0.12 +
      Math.sin((v.x + v.y + v.z) * 6.0 + s1) * 0.05
    v.multiplyScalar(1 + n)
    v.y *= 0.82 + (seed % 3) * 0.06
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export function createSpace(canvas, { lowPower, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.3 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x040a16, 0.0105)
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 900)
  camera.rotation.order = 'YXZ'

  const lightDir = new THREE.Vector3(-0.28, 0.42, -1).normalize()

  // sky
  const skyU = { uTime: { value: 0 }, uLightDir: { value: lightDir }, uWarp: { value: 0 } }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 48, 32),
    new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false }),
  )
  scene.add(sky)

  // lighting — strong back/rim light from the beam, faint cold fill
  const key = new THREE.DirectionalLight(0x9fcbff, 3.2)
  key.position.copy(lightDir).multiplyScalar(100)
  scene.add(key)
  scene.add(new THREE.HemisphereLight(0x3b5f94, 0x07090d, 1.25))
  const fill = new THREE.DirectionalLight(0x6f8fbf, 1.1)
  fill.position.set(0.5, -0.2, 1)
  scene.add(fill)

  // asteroids
  const COUNT = lowPower ? 140 : 320
  const VARIANTS = 4
  const per = Math.ceil(COUNT / VARIANTS)
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6f7784, roughness: 0.96, metalness: 0.04, flatShading: true })
  const meshes = []
  const rocks = []
  const NEAR = 12
  const FAR = -420
  const spawn = (r, anywhere) => {
    const big = Math.random() < 0.06
    r.s = big ? 6 + Math.random() * 9 : 0.35 + Math.pow(Math.random(), 2.2) * 3.2
    let x
    let y
    do {
      x = (Math.random() - 0.5) * 150
      y = (Math.random() - 0.5) * 90
    } while (Math.abs(x) < 6 + r.s && Math.abs(y) < 4 + r.s) // keep a flight corridor clear
    r.x = x
    r.y = y
    r.z = anywhere ? FAR + Math.random() * (NEAR - FAR) : FAR - Math.random() * 60
    r.rx = Math.random() * 6
    r.ry = Math.random() * 6
    r.vx = (Math.random() - 0.5) * 0.9
    r.vy = (Math.random() - 0.5) * 0.9
    r.drift = (Math.random() - 0.5) * 1.2
  }
  for (let v = 0; v < VARIANTS; v++) {
    const m = new THREE.InstancedMesh(makeRock(v + 1, lowPower ? 1 : 2), rockMat, per)
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    m.frustumCulled = false
    scene.add(m)
    meshes.push(m)
    for (let i = 0; i < per; i++) {
      const r = { m: v, i }
      spawn(r, true)
      rocks.push(r)
    }
  }

  // space dust (line streaks)
  const DUST = lowPower ? 220 : 520
  const dustPos = new Float32Array(DUST * 6)
  const dust = []
  const respawnDust = (d, anywhere) => {
    d.x = (Math.random() - 0.5) * 70
    d.y = (Math.random() - 0.5) * 44
    d.z = anywhere ? -200 + Math.random() * 210 : -200 - Math.random() * 20
  }
  for (let i = 0; i < DUST; i++) {
    const d = {}
    respawnDust(d, true)
    dust.push(d)
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.LineBasicMaterial({ color: 0xbcd6ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  const dustLines = new THREE.LineSegments(dustGeo, dustMat)
  dustLines.frustumCulled = false
  scene.add(dustLines)

  const state = { speed: reducedMotion ? 6 : 26, warp: 0, fov: 72 }

  let w = 1
  let h = 1
  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // portrait phones need a wider vertical field so the scene isn't cramped
    state.baseFov = w / h < 0.8 ? 92 : 72
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  const mouse = { x: 0, y: 0 }
  const onMove = (e) => {
    mouse.x = (e.clientX / w - 0.5) * 2
    mouse.y = (e.clientY / h - 0.5) * 2
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const dummy = new THREE.Object3D()
  let raf = 0
  let last = performance.now()
  let t = 0
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    t += dt
    skyU.uTime.value = t
    skyU.uWarp.value = state.warp

    const sp = state.speed
    // asteroids
    for (const r of rocks) {
      r.z += sp * dt
      r.x += r.drift * dt
      r.rx += r.vx * dt
      r.ry += r.vy * dt
      if (r.z > NEAR + r.s) spawn(r, false)
      dummy.position.set(r.x, r.y, r.z)
      dummy.rotation.set(r.rx, r.ry, 0)
      dummy.scale.setScalar(r.s)
      dummy.updateMatrix()
      meshes[r.m].setMatrixAt(r.i, dummy.matrix)
    }
    for (const m of meshes) m.instanceMatrix.needsUpdate = true

    // dust streaks: length grows with speed
    const len = 0.25 + sp * 0.03
    for (let i = 0; i < DUST; i++) {
      const d = dust[i]
      d.z += sp * 1.25 * dt
      if (d.z > 4) respawnDust(d, false)
      const o = i * 6
      dustPos[o] = d.x
      dustPos[o + 1] = d.y
      dustPos[o + 2] = d.z
      dustPos[o + 3] = d.x
      dustPos[o + 4] = d.y
      dustPos[o + 5] = d.z - len
    }
    dustGeo.attributes.position.needsUpdate = true
    dustMat.opacity = 0.35 + state.warp * 0.6

    // gentle banking + steering toward the pointer
    const calm = 1 - state.warp
    camera.rotation.z = (Math.sin(t * 0.35) * 0.05 - mouse.x * 0.1) * calm
    camera.rotation.y += ((-mouse.x * 0.12) * calm - camera.rotation.y) * 0.04
    camera.rotation.x += ((-mouse.y * 0.07 + Math.sin(t * 0.5) * 0.01) * calm - camera.rotation.x) * 0.04
    camera.position.y = Math.sin(t * 0.9) * 0.08 * calm
    camera.fov = state.baseFov + (state.fov - 72)
    camera.updateProjectionMatrix()

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    warp(duration = 1.6) {
      gsap.to(state, { speed: 950, duration, ease: 'power3.in' })
      gsap.to(state, { warp: 1, duration, ease: 'power2.in' })
      gsap.to(state, { fov: 112, duration, ease: 'power3.in' })
    },
    dispose() {
      cancelAnimationFrame(raf)
      gsap.killTweensOf(state)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      meshes.forEach((m) => m.geometry.dispose())
      rockMat.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      sky.geometry.dispose()
      sky.material.dispose()
      renderer.dispose()
    },
  }
}
