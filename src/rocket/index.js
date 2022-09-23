import { CircleRocket } from './circle'
import { RegularRocket } from './regular'
import { HarmonicRocket } from './harmonic'
import { LongRocket } from './long'
import { BiCircleRocket } from './bicircle'
import { BiColorRocket } from './bicolor'
import { BiColorHarmonicRocket } from './bicolorharmonic'
import { SpiralRocket } from './spiral'

export const rnd = (min, max) => min + ~~(Math.random() * (max - min))
export const types = {
  regular: RegularRocket,
  circle: CircleRocket,
  harmonic: HarmonicRocket,
  long: LongRocket,
  bicolor: BiColorRocket,
  bicircle: BiCircleRocket,
  bicolorharmonic: BiColorHarmonicRocket,
  spiral: SpiralRocket,
}
const rndType = () => Object.keys(types)[rnd(0, Object.keys(types).length)]

export const makeRocket = params => {
  return new types[params.type || rndType()]({ params })
}
