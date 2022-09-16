import { Points } from 'three'

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Spherical,
  StreamDrawUsage,
  Vector3,
} from 'three'
import fragmentShader from './fragmentShader.glsl'
import './style.css'
import vertexShader from './vertexShader.glsl'

const maxSize = 10000
const explosionHeight = 40
const airFriction = 0.02
const acceleration = new Vector3(0, 0, -9.8)
const potentialFading = 0.985

export const rnd = (min, max) => min + ~~(Math.random() * (max - min))

export class Rocket extends Points {
  constructor() {
    const geometry = new BufferGeometry()
    const positions = new Float32Array(maxSize * 3)
    geometry.setAttribute(
      'position',
      new BufferAttribute(positions, 3).setUsage(StreamDrawUsage)
    )

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        scale: { value: 1 },
        color: { value: new Color(0xff8800) },
        potential: { value: 1 },
      },
    })

    super(geometry, material)
    this.startPosition = new Vector3(rnd(-25, 25), rnd(-25, 25), 0)
    this.rocketSpeed = new Vector3(
      rnd(-10, 10) / 2,
      rnd(-10, 10) / 2,
      rnd(20, 40)
    )
    this.particleSpeed = new Float32Array(maxSize * 3)
    this.particleSize = rnd(8, 12) / 10
    this.color = new Color().setHSL(rnd(0, 360) / 360, 1, 0.65)
    this.ignite()
  }

  ignite() {
    this.state = 'ignition'
    this.geometry.setDrawRange(0, 1)
    this.geometry.attributes.position.array[0] = this.startPosition.x
    this.geometry.attributes.position.array[1] = this.startPosition.y
    this.geometry.attributes.position.array[2] = this.startPosition.z
  }

  explode() {
    this.state = 'explosion'
    const x = this.geometry.attributes.position.array[0]
    const y = this.geometry.attributes.position.array[1]
    const z = this.geometry.attributes.position.array[2]

    const spherical = new Spherical()
    for (let i = 0; i < maxSize; i++) {
      spherical.radius = rnd(25, 75) * Math.cbrt(Math.random())
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.acos(2 * Math.random() - 1.0)

      const position = new Vector3().setFromSpherical(spherical)
      this.geometry.attributes.position.array[i * 3] = x
      this.geometry.attributes.position.array[i * 3 + 1] = y
      this.geometry.attributes.position.array[i * 3 + 2] = z
      this.particleSpeed[i * 3] = position.x
      this.particleSpeed[i * 3 + 1] = position.y
      this.particleSpeed[i * 3 + 2] = position.z
    }
    this.material.uniforms.scale.value = this.particleSize
    this.material.uniforms.color.value = this.color
    this.material.needsUpdate = true
    this.geometry.setDrawRange(0, maxSize)
  }

  update(dt) {
    if (this.state === 'ignition') {
      if (this.geometry.attributes.position.array[2] > explosionHeight) {
        this.explode()
      } else {
        this.rocketSpeed[0] +=
          dt * acceleration.x - airFriction * this.rocketSpeed[0]
        this.rocketSpeed[1] +=
          dt * acceleration.y - airFriction * this.rocketSpeed[1]
        this.rocketSpeed[2] +=
          dt * acceleration.z - airFriction * this.rocketSpeed[2]
        this.geometry.attributes.position.array[0] += dt * this.rocketSpeed.x
        this.geometry.attributes.position.array[1] += dt * this.rocketSpeed.y
        this.geometry.attributes.position.array[2] += dt * this.rocketSpeed.z
      }
    } else if (this.state === 'explosion') {
      for (let i = 0; i < maxSize; i++) {
        this.particleSpeed[i * 3] +=
          dt * acceleration.x - airFriction * this.particleSpeed[i * 3]
        this.particleSpeed[i * 3 + 1] +=
          dt * acceleration.y - airFriction * this.particleSpeed[i * 3 + 1]
        this.particleSpeed[i * 3 + 2] +=
          dt * acceleration.z - airFriction * this.particleSpeed[i * 3 + 2]

        this.geometry.attributes.position.array[i * 3] +=
          dt * this.particleSpeed[i * 3]
        this.geometry.attributes.position.array[i * 3 + 1] +=
          dt * this.particleSpeed[i * 3 + 1]
        this.geometry.attributes.position.array[i * 3 + 2] +=
          dt * this.particleSpeed[i * 3 + 2]
      }
      this.material.uniforms.potential.value *= potentialFading
      if (this.material.uniforms.potential.value < 0.1) {
        this.state = 'finished'
      }
    }
    this.geometry.attributes.position.needsUpdate = true
  }
}
