import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Spherical, Vector3, Euler } from 'three'

const spherical = new Spherical()
const euler = new Euler(-Math.PI / 2, 0, 0)

export class GeyserRocket extends AbstractRocket {
  constructor(options = {}) {
    super({
      // particles: 10,
      // queue: 1,
      lifespan: 10,
      ...options,
    })
  }

  ignite() {
    super.ignite()
    this.explode()
  }

  setSpeed(particleSpeed) {
    spherical.theta = Math.random() * 2 * Math.PI
    spherical.phi = Math.acos(0.025 * Math.random() - 1.0)
    spherical.radius = rnd(30, 60) * Math.cbrt(Math.random())
    particleSpeed.setFromSpherical(spherical)
    particleSpeed.applyEuler(euler)
  }

  setInitialSpeed() {
    const speed = this.geometry.attributes.speed.array

    for (let i = 0; i < this.particles; i++) {
      for (let j = 0; j < this.queue; j++) {
        const p = i * this.queue + j
        if (
          speed[p * 3] === 0 &&
          speed[p * 3 + 1] === 0 &&
          Math.random() < 0.01
        ) {
          const particleSpeed = new Vector3()
          this.setSpeed(particleSpeed)
          speed[p * 3] = particleSpeed.x
          speed[p * 3 + 1] = particleSpeed.y
          speed[p * 3 + 2] = particleSpeed.z
        }
      }
    }
  }

  getInitialSpeed() {
    const speed = []

    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      speed.push(particleSpeed)
    }
    return speed
  }

  update(dt) {
    this.setInitialSpeed()
    super.update(dt)
  }
}
