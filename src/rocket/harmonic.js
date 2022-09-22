import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color, Spherical, Vector3 } from 'three'

export class HarmonicRocket extends AbstractRocket {
  getInitialSpeed() {
    const speed = []
    const spherical = new Spherical()

    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.acos(2 * Math.random() - 1.0)
      spherical.radius = 30 + 2 * Math.random()
      particleSpeed.setFromSpherical(spherical)
      speed.push(particleSpeed)
    }
    return speed
  }
}
