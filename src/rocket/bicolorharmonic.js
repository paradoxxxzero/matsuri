import { BiColorRocket } from './bicolor'
import { HarmonicRocket } from './harmonic'

export class BiColorHarmonicRocket extends BiColorRocket {}

BiColorHarmonicRocket.prototype.getInitialSpeed =
  HarmonicRocket.prototype.getInitialSpeed
