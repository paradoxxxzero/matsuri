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
import { rnd } from '.'
import fragmentShader from '../shaders/fragmentShader.glsl'
import vertexShader from '../shaders/vertexShader.glsl'

export class AbstractRocket extends Points {
  constructor({
    particles = 1000,
    queue = 15,
    squareSize = 25,
    explosionHeight = 40,
    airFriction = 0.02,
    acceleration = new Vector3(0, 0, -9.8),
    lifespan = 2.5,
    params,
  } = {}) {
    const totalParticleSize = particles * queue
    const geometry = new BufferGeometry()
    const positions = new Float32Array(totalParticleSize * 3)
    const speed = new Float32Array(totalParticleSize * 3)
    const color = new Float32Array(totalParticleSize * 3)
    const uv = new Float32Array(totalParticleSize * 2)

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
    geometry.setAttribute('uv', new BufferAttribute(uv, 2))

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        pointSize: { value: params.pointSize },
      },
      transparent: true,
      depthTest: false,
      blending: params.blending,
      blendEquation: params.blendEquation,
      blendSrc: params.blendSrc,
      blendDst: params.blendDst,
    })

    super(geometry, material)
    this.particles = particles
    this.queue = queue
    this.totalParticleSize = totalParticleSize
    this.lifespan = params.lifespan * lifespan
    this.squareSize = squareSize
    this.explosionHeight = explosionHeight
    this.airFriction = airFriction
    this.acceleration = acceleration
    this.age = 0
    this.ignite()
  }

  ignite() {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    const color = this.geometry.attributes.color.array
    const uv = this.geometry.attributes.uv.array

    this.state = 'ignition'
    this.geometry.setDrawRange(0, this.queue)

    const baseColor = new Color().setHSL(0.1, 1, 0.7)
    for (let i = 0; i < this.queue; i++) {
      position[i * 3] = rnd(-this.squareSize, this.squareSize)
      position[i * 3 + 1] = rnd(-this.squareSize, this.squareSize)
      position[i * 3 + 2] = 0
      speed[i * 3] = rnd(-10, 10) / 2
      speed[i * 3 + 1] = rnd(-10, 10) / 2
      speed[i * 3 + 2] = rnd(30, 50)
      color[i * 3] = baseColor.r
      color[i * 3 + 1] = baseColor.g
      color[i * 3 + 2] = baseColor.b
    }
    for (let i = 0; i < this.particles; i++) {
      for (let j = 0; j < this.queue; j++) {
        const p = i * this.queue + j
        uv[p * 2] = i / this.particles
        uv[p * 2 + 1] = j / this.queue
      }
    }
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.speed.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.uv.needsUpdate = true
  }

  explode() {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    const color = this.geometry.attributes.color.array

    this.state = 'explosion'
    const x = position[0]
    const y = position[1]
    const z = position[2]

    const baseColor = this.getColor()
    const initialSpeed = this.getInitialSpeed()
    for (let i = 0; i < this.particles; i++) {
      for (let j = 0; j < this.queue; j++) {
        const p = i * this.queue + j
        position[p * 3] = x
        position[p * 3 + 1] = y
        position[p * 3 + 2] = z
        speed[p * 3] = j ? 0 : initialSpeed[i].x
        speed[p * 3 + 1] = j ? 0 : initialSpeed[i].y
        speed[p * 3 + 2] = j ? 0 : initialSpeed[i].z
        color[p * 3] = baseColor.r
        color[p * 3 + 1] = baseColor.g
        color[p * 3 + 2] = baseColor.b
      }
    }
    this.material.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.setDrawRange(0, this.totalParticleSize)
  }

  update(dt) {
    const { acceleration, airFriction } = this
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array

    if (this.state === 'ignition') {
      if (this.geometry.attributes.position.array[2] > this.explosionHeight) {
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
      this.age += dt
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
            if (position[p * 3 + 2] < 0) {
              position[p * 3 + 2] = 0
              speed[p * 3 + 2] = -speed[p * 3 + 2] * 0.5
            }
          } else {
            const op = i * this.queue + j - 1
            position[p * 3] = position[op * 3]
            position[p * 3 + 1] = position[op * 3 + 1]
            position[p * 3 + 2] = position[op * 3 + 2]
          }
        }
      }
      this.material.uniforms.time.value = this.age / this.lifespan
      if (this.material.uniforms.time.value >= 1) {
        this.state = 'finished'
      }
    }
    this.geometry.attributes.position.needsUpdate = true
    // this.geometry.attributes.speed.needsUpdate = true
  }

  getColor() {
    const h = rnd(0, 360) / 360
    return new Color().setHSL(h, 0.75, 0.75)
  }

  getInitialSpeed() {
    const speed = []
    const spherical = new Spherical()

    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.acos(2 * Math.random() - 1.0)
      spherical.radius = rnd(30, 50) * Math.cbrt(Math.random())
      particleSpeed.setFromSpherical(spherical)
      speed.push(particleSpeed)
    }
    return speed
  }

  destroy() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
