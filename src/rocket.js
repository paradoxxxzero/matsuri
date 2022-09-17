import { Points, Euler } from 'three'

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

const squareSize = 25
const explosionHeight = 40
const airFriction = 0.02
const acceleration = new Vector3(0, 0, -9.8)

export const rnd = (min, max) => min + ~~(Math.random() * (max - min))
export const types = ['normal', 'regular', 'circle', 'long']
const rndType = () => types[rnd(0, types.length)]

export class Rocket extends Points {
  constructor(type) {
    const particles = 1000
    const queue = type === 'long' ? 50 : 15
    const totalParticleSize = particles * queue
    const geometry = new BufferGeometry()
    const positions = new Float32Array(totalParticleSize * 3)
    const speed = new Float32Array(totalParticleSize * 3)
    const color = new Float32Array(totalParticleSize * 3)
    const scale = new Float32Array(totalParticleSize)
    geometry.setAttribute(
      'position',
      new BufferAttribute(positions, 3).setUsage(StreamDrawUsage)
    )
    geometry.setAttribute(
      'speed',
      new BufferAttribute(speed, 3).setUsage(StreamDrawUsage)
    )
    geometry.setAttribute(
      'color',
      new BufferAttribute(color, 3).setUsage(StreamDrawUsage)
    )
    geometry.setAttribute(
      'scale',
      new BufferAttribute(scale, 1).setUsage(StreamDrawUsage)
    )

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        potential: { value: 1 },
      },
    })

    super(geometry, material)
    this.type = type || rndType()
    this.particles = particles
    this.queue = queue
    this.totalParticleSize = totalParticleSize
    this.potentialFading = this.type === 'long' ? 0.99 : 0.985
    this.ignite()
  }

  ignite() {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    const color = this.geometry.attributes.color.array
    const scale = this.geometry.attributes.scale.array

    this.state = 'ignition'
    this.geometry.setDrawRange(0, this.queue)
    const c = new Array(this.queue)
      .fill()
      .map((_, i) =>
        new Color().setHSL(0.1, 1, i ? 0.5 - i / (2 * this.queue) : 0.7)
      )
    for (let i = 0; i < this.queue; i++) {
      position[i * 3] = rnd(-squareSize, squareSize)
      position[i * 3 + 1] = rnd(-squareSize, squareSize)
      position[i * 3 + 2] = 0
      speed[i * 3] = rnd(-10, 10) / 2
      speed[i * 3 + 1] = rnd(-10, 10) / 2
      speed[i * 3 + 2] = rnd(30, 50)
      color[i * 3] = c[i].r
      color[i * 3 + 1] = c[i].g
      color[i * 3 + 2] = c[i].b
      scale[i] = i ? 0.5 - i / (2 * this.queue) : 1
    }

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.speed.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
  }

  explode() {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    const color = this.geometry.attributes.color.array
    const scale = this.geometry.attributes.scale.array

    this.state = 'explosion'
    const x = position[0]
    const y = position[1]
    const z = position[2]

    const h = this.type === 'long' ? 0.07 + rnd(0, 1) / 20 : rnd(0, 360) / 360
    const c = new Array(this.queue)
      .fill()
      .map((_, i) =>
        this.type === 'long'
          ? new Color().setHSL(h, 1, i ? 0.5 - i / (2 * this.queue) : 1)
          : new Color().setHSL(h, 0.5, i ? 0.5 - i / (2 * this.queue) : 0.7)
      )

    const euler =
      this.type === 'circle'
        ? new Euler(
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI,
            Math.random() * 2 * Math.PI
          )
        : null
    const spherical = new Spherical()
    for (let i = 0; i < this.particles; i++) {
      let particleSpeed = new Vector3()
      if (this.type === 'circle') {
        spherical.radius = 25 + 2 * Math.random()
        spherical.theta = Math.random() * 2 * Math.PI
        spherical.phi = Math.PI / 2
        particleSpeed.setFromSpherical(spherical)
        particleSpeed.applyEuler(euler)
      } else if (['regular', 'normal', 'long'].includes(this.type)) {
        spherical.theta = Math.random() * 2 * Math.PI
        spherical.phi = Math.acos(2 * Math.random() - 1.0)
        spherical.radius = ['regular', 'circle'].includes(this.type)
          ? 50 + 2 * Math.random()
          : this.type === 'long'
          ? rnd(5, 20)
          : rnd(40, 60) * Math.cbrt(Math.random())
        particleSpeed.setFromSpherical(spherical)
      }

      for (let j = 0; j < this.queue; j++) {
        const p = i * this.queue + j
        position[p * 3] = x
        position[p * 3 + 1] = y
        position[p * 3 + 2] = z
        speed[p * 3] = j ? 0 : particleSpeed.x
        speed[p * 3 + 1] = j ? 0 : particleSpeed.y
        speed[p * 3 + 2] = j ? 0 : particleSpeed.z
        color[p * 3] = c[j].r
        color[p * 3 + 1] = c[j].g
        color[p * 3 + 2] = c[j].b
        scale[p] = j ? 0.5 - j / (2 * this.queue) : 1
      }
    }
    this.material.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
    this.geometry.setDrawRange(0, this.totalParticleSize)
  }

  update(dt) {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    // const color = this.geometry.attributes.color.array
    // const scale = this.geometry.attributes.scale.array

    if (this.state === 'ignition') {
      if (this.geometry.attributes.position.array[2] > explosionHeight) {
        this.explode()
      } else {
        for (let j = this.queue - 1; j >= 0; j--) {
          const p = j
          if (j === 0) {
            speed[p * 3] += dt * acceleration.x
            speed[p * 3 + 1] += dt * acceleration.y
            speed[p * 3 + 2] += dt * acceleration.z
            position[p * 3] += dt * speed[p * 3]
            position[p * 3 + 1] += dt * speed[p * 3 + 1]
            position[p * 3 + 2] += dt * speed[p * 3 + 2]
          } else {
            const op = j - 1
            position[p * 3] = position[op * 3]
            position[p * 3 + 1] = position[op * 3 + 1]
            position[p * 3 + 2] = position[op * 3 + 2]
          }
        }
      }
    } else if (this.state === 'explosion') {
      for (let i = 0; i < this.particles; i++) {
        for (let j = this.queue - 1; j >= 0; j--) {
          const p = i * this.queue + j
          if (j === 0) {
            speed[p * 3] += dt * acceleration.x - airFriction * speed[p * 3]
            speed[p * 3 + 1] +=
              dt * acceleration.y - airFriction * speed[p * 3 + 1]
            speed[p * 3 + 2] +=
              dt * acceleration.z - airFriction * speed[p * 3 + 2]
            position[p * 3] += dt * speed[p * 3]
            position[p * 3 + 1] += dt * speed[p * 3 + 1]
            position[p * 3 + 2] += dt * speed[p * 3 + 2]
          } else {
            const op = i * this.queue + j - 1
            position[p * 3] = position[op * 3]
            position[p * 3 + 1] = position[op * 3 + 1]
            position[p * 3 + 2] = position[op * 3 + 2]
          }
        }
      }
      this.material.uniforms.potential.value *= this.potentialFading
      if (this.material.uniforms.potential.value < 0.1) {
        this.state = 'finished'
      }
    }
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.speed.needsUpdate = true
  }
}
