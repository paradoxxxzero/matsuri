import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color, Spherical, Vector3 } from 'three'

export class LongRocket extends AbstractRocket {
  constructor(options = {}) {
    super({
      particles: 600,
      queue: 50,
      lifespan: 5,
      ...options,
    })
  }

  getColor() {
    const h = 0.07 + rnd(0, 1) / 20
    return new Color().setHSL(h, 1, 0.65)
  }

  getInitialSpeed() {
    const speed = []
    const spherical = new Spherical()

    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.acos(2 * Math.random() - 1.0)
      spherical.radius = rnd(5, 20)
      particleSpeed.setFromSpherical(spherical)
      speed.push(particleSpeed)
    }
    return speed
  }
}
