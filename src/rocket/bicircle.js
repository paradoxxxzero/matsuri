import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color, Euler, Spherical, Vector3 } from 'three'

export class BiCircleRocket extends AbstractRocket {
  getInitialSpeed() {
    const speed = []
    const eulers = [
      new Euler(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      ),
    ]
    eulers.push(
      new Euler(
        (eulers[0].x + Math.PI) % (2 * Math.PI),
        eulers[0].y,
        eulers[0].z
      )
    )
    const spherical = new Spherical()
    for (let i = 0; i < this.particles; i++) {
      const particleSpeed = new Vector3()
      spherical.radius = 25 + 2 * Math.random()
      spherical.theta = Math.random() * 2 * Math.PI
      spherical.phi = Math.PI / 2
      particleSpeed.setFromSpherical(spherical)
      particleSpeed.applyEuler(eulers[i % 2])
      speed.push(particleSpeed)
    }
    return speed
  }
}
