import { AbstractRocket } from './abstract'
import { rnd } from '.'
import { Color } from 'three'

export class BiColorRocket extends AbstractRocket {
  explode() {
    const position = this.geometry.attributes.position.array
    const speed = this.geometry.attributes.speed.array
    const color = this.geometry.attributes.color.array
    const scale = this.geometry.attributes.scale.array

    this.state = 'explosion'
    const x = position[0]
    const y = position[1]
    const z = position[2]

    const h = rnd(0, 360) / 360
    const h2 = (h + 0.5) % 1
    const colors = [this.getColors(h), this.getColors(h2)]
    const initialSpeed = this.getInitialSpeed()
    for (let i = 0; i < this.particles; i++) {
      for (let j = 0; j < this.queue; j++) {
        const p = i * this.queue + j
        position[p * 3] = x
        position[p * 3 + 1] = y
        position[p * 3 + 2] = z
        speed[p * 3] = j ? 0 : initialSpeed[i].x * (i % 2 ? 0.5 : 1)
        speed[p * 3 + 1] = j ? 0 : initialSpeed[i].y * (i % 2 ? 0.5 : 1)
        speed[p * 3 + 2] = j ? 0 : initialSpeed[i].z * (i % 2 ? 0.5 : 1)
        color[p * 3] = colors[i % 2][j].r
        color[p * 3 + 1] = colors[i % 2][j].g
        color[p * 3 + 2] = colors[i % 2][j].b
        scale[p] = j ? 0.5 - j / (2 * this.queue) : 1
      }
    }
    this.material.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
    this.geometry.setDrawRange(0, this.totalParticleSize)
  }

  getColors(h) {
    return new Array(this.queue)
      .fill()
      .map((_, i) =>
        new Color().setHSL(h, 0.75, i ? 0.5 - i / (2 * this.queue) : 0.9)
      )
  }
}
