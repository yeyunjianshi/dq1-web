import { clamp } from '@engine/math'

export type InterpolatorType = 'const' | 'linear'

export interface Interpolator {
  execute(ratio: number): number
}

export class ConstInterpolator implements Interpolator {
  constructor(public value: number) {}

  execute(): number {
    return this.value
  }
}

export class LinearInterpolator implements Interpolator {
  constructor(public min: number, public max: number) {}

  execute(ratio: number) {
    return clamp(this.min + (this.max - this.min) * ratio, this.min, this.max)
  }
}
