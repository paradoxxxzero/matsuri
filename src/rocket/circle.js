import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color, Euler, Spherical, Vector3 } from 'three'

export class CircleRocket extends AbstractRocket {
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
      spherical.radius = 25 + 2 * Math.random()
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.PI / 2
      particleSpeed.setFromSpherical(spherical)
      particleSpeed.applyEuler(euler)
      speed.push(particleSpeed)
    }
    return speed
  }
}
