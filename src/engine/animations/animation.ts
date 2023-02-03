import { clamp } from '@engine/math'
import {
  ConstInterpolator,
  Interpolator,
  InterpolatorType,
  LinearInterpolator,
} from './interpolator'

export type FrameKey = {
  frame: number
  value: any
  interpolator?: InterpolatorType | Interpolator
  next?: FrameKey
}

export class Animation {
  name: string
  duration: number
  frameCount: number
  keys: Map<string, FrameKey[]>
  times = 1
  fillEnd = false
  auto = true
  reverse = false

  animTime = 0
  restTimes = 0
  currentFrame = 0
  isPaused = false

  constructor({
    name = '',
    keys = new Map(),
    frameCount = 30,
    reverse = false,
    duration = 2000,
    times = 1,
    auto = true,
  }: Partial<{
    name: string
    keys: Map<string, FrameKey[]>
    frameCount: number
    reverse: boolean
    duration: number
    times: number
    auto: boolean
    interpolator: InterpolatorType
  }>) {
    this.name = name
    this.reverse = reverse
    this.restTimes = this.times = times

    this.frameCount = frameCount
    this.duration = duration
    this.keys = keys

    if (reverse) {
      for (const [k, values] of keys.entries()) {
        const reveseValues = [...values]
          .reverse()
          .map((val) => ({ ...val, frame: 2 * frameCount - val.frame }))
        keys.set(k, values.concat(reveseValues))
      }

      this.frameCount *= 2
      this.duration *= 2
    }

    for (const key of this.keys.values()) {
      for (let i = 1; i < key.length; i++) {
        key[i - 1].next = key[i]
      }
    }
    this.isPaused = !auto
  }

  update(deltaTime: number) {
    this.animTime += deltaTime
    this.updateFrame()
  }

  updateFrame() {
    if (this.isPaused || this.isEnd) return

    this.currentFrame = (this.animTime * this.frameCount) / this.duration

    if (this.animTime >= this.duration) {
      this.animTime -= this.duration
      this.currentFrame -= this.frameCount

      if (!this.isLoop) {
        this.restTimes -= 1
        if (this.restTimes <= 0)
          this.currentFrame = Math.max(0, this.frameCount - 1)
      }
    }
  }

  currentKeys() {
    return Array.from(this.keys.keys())
      .map((k) => this.currentKey(k))
      .filter((v) => !!v) as { property: string; animationKey: FrameKey }[]
  }

  currentKey(prop: string) {
    const keys = this.keys.get(prop)
    if (!keys || keys.length === 0) return undefined

    let frameIndex = keys.findIndex((key) => key.frame > this.currentFrame)
    if (frameIndex === -1) frameIndex = keys.length
    frameIndex = Math.max(0, frameIndex - 1)

    return { property: prop, animationKey: keys[frameIndex] }
  }

  getFrameKeyValue(key: FrameKey) {
    if (typeof key.value !== 'number' || !key.next) return key.value

    if (!key.interpolator || typeof key.interpolator === 'string') {
      key.interpolator =
        key.interpolator === 'const'
          ? new ConstInterpolator(key.value)
          : new LinearInterpolator(key.value, key.next.value)
    }
    return key.interpolator.execute(
      clamp(
        (this.animTime - (key.frame / this.frameCount) * this.duration) /
          (((key.next.frame - key.frame) * this.duration) / this.frameCount),
        0,
        1
      )
    )
  }

  reset() {
    this.animTime = 0
    this.currentFrame = 0
    this.restTimes = this.times
  }

  pause() {
    this.isPaused = true
  }

  replay(reset = false) {
    if (reset) this.reset()
    this.isPaused = false
  }

  stop() {
    this.pause()
    this.reset()
  }

  get isPlaying() {
    return !this.isEnd && !this.isPaused
  }

  get isEnd() {
    return this.keys.size == 0 || (!this.isLoop && this.restTimes <= 0)
  }

  get isLoop() {
    return this.times < 0
  }
}
