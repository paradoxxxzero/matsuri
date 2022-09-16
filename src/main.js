import Stats from 'stats.js'
import {
  Group,
  NoToneMapping,
  PerspectiveCamera,
  ReinhardToneMapping,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { Rocket } from './rocket'
import './style.css'

let gui, started, raf

const stats = new Stats()
const showStats = { showStats: false }

const renderer = new WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = ReinhardToneMapping
document.body.appendChild(renderer.domElement)
document.body.appendChild(stats.dom)
stats.showPanel(null)

const params = {
  zFov: 45,
  autoRotate: false,
  afterImage: true,
  afterImageDamp: 0.9,
  fxaa: true,
  bloom: true,
  bloomStrength: 1.5,
  bloomRadius: 0.75,
  bloomThreshold: 0,
  bloomExposure: 0.75,

  maxRocket: 10,
}

const scene = new Scene()

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
)
camera.position.set(0, 100, 10)
camera.up.set(0, 0, 1)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 30)

controls.minDistance = 1
controls.maxDistance = 1000

controls.enableDamping = true
controls.dampingFactor = 0.05
controls.autoRotate = params.autoRotate

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const afterImagePass = new AfterimagePass()
afterImagePass.uniforms.damp.value = params.afterImageDamp
afterImagePass.enabled = params.afterImage
composer.addPass(afterImagePass)

const fxaaPass = new ShaderPass(FXAAShader)
const pixelRatio = renderer.getPixelRatio()

fxaaPass.material.uniforms.resolution.value.x =
  1 / (window.innerWidth * pixelRatio)
fxaaPass.material.uniforms.resolution.value.y =
  1 / (window.innerHeight * pixelRatio)
fxaaPass.enabled = params.fxaa
composer.addPass(fxaaPass)

const bloomPass = new UnrealBloomPass(
  new Vector2(window.innerWidth, window.innerHeight),
  params.bloomStrength,
  params.bloomRadius,
  params.bloomThreshold
)
renderer.toneMappingExposure = params.bloomExposure

bloomPass.enabled = params.bloom
composer.addPass(bloomPass)

window.addEventListener('resize', onWindowResize)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)

  const pixelRatio = renderer.getPixelRatio()

  fxaaPass.material.uniforms.resolution.value.x =
    1 / (window.innerWidth * pixelRatio)
  fxaaPass.material.uniforms.resolution.value.y =
    1 / (window.innerHeight * pixelRatio)
}

const rockets = new Group()
scene.add(rockets)
// const ground = new Mesh(
//   new PlaneGeometry(10000, 10000),
//   new MeshPhongMaterial({ color: 0x007700, shininess: 150 })
// )
// scene.add(ground)
// scene.add(new AmbientLight(0x505050))

async function animate() {
  showStats.showStats && stats.update()
  await render()
  raf = requestAnimationFrame(animate)
}

let timestamp = new Date().getTime()
async function render() {
  const ct = new Date().getTime()
  const dt = (ct - timestamp) / 1000
  timestamp = ct
  rockets.children.forEach(child => {
    child.update(dt)
  })
  rockets.children
    .filter(child => child.state === 'finished')
    .forEach(child => {
      rockets.remove(child)
    })
  if (rockets.children.length < params.maxRocket && Math.random() < 0.1) {
    rockets.add(new Rocket())
  }
  controls.update()
  composer.render()
}

function init() {
  rockets.add(new Rocket())
}

function restart() {
  if (!started) {
    return
  }
  cancelAnimationFrame(raf)
  rockets.clear()
  controls.reset()
  controls.target.set(0, 0, 30)
  init()
  raf = requestAnimationFrame(animate)
}

function initGUI() {
  gui = new GUI({
    // load: presets,
    // preset,
  })
  // gui.remember(params)

  gui.add(params, 'zFov', 0, 180).onChange(v => {
    camera.fov = v
    camera.updateProjectionMatrix()
  })

  const fx = gui.addFolder('Render fx')
  fx.add(params, 'autoRotate')
    .onChange(on => (controls.autoRotate = on))
    .listen()
  fx.add(params, 'fxaa').onChange(on => (fxaaPass.enabled = on))
  fx.add(params, 'bloom').onChange(on => {
    bloomPass.enabled = on
    renderer.toneMapping = on ? ReinhardToneMapping : NoToneMapping
  })
  fx.add(params, 'bloomStrength', 0, 10, 0.01).onChange(
    v => (bloomPass.strength = v)
  )
  fx.add(params, 'bloomRadius', 0, 1, 0.01).onChange(
    v => (bloomPass.radius = v)
  )
  fx.add(params, 'bloomThreshold', 0, 1, 0.01).onChange(
    v => (bloomPass.threshold = v)
  )
  fx.add(params, 'bloomExposure', 0.001, 128).onChange(
    v => (renderer.toneMappingExposure = v)
  )
  fx.add(params, 'afterImage').onChange(on => (afterImagePass.enabled = on))
  fx.add(params, 'afterImageDamp', 0, 1).onChange(
    v => (afterImagePass.uniforms.damp.value = v)
  )
  fx.add(showStats, 'showStats').onChange(v => stats.showPanel(v ? 0 : null))
  const config = gui.addFolder('Configuration')
  config.add(params, 'maxRocket', 0, 1000)
  config.add({ restart }, 'restart')
}

init()
initGUI()
started = true
raf = requestAnimationFrame(animate)