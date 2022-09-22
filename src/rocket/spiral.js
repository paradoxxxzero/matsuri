import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color, Spherical, Vector3, Euler } from 'three'

export class SpiralRocket extends AbstractRocket {
  getInitialSpeed() {
    const speed = []
    const euler = new Euler(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    )
    const spherical = new Spherical()

    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      spherical.phi = Math.acos(2 * Math.random() - 1.0)
      spherical.theta = 2 * spherical.phi * 12
      spherical.radius = 50 + 2 * Math.random()
      particleSpeed.setFromSpherical(spherical)
      particleSpeed.applyEuler(euler)
      speed.push(particleSpeed)
    }
    return speed
  }
}
