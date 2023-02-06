import Component from '../component'
import { InnerGameComponent } from '.'
import PropertyAnimationComponent, {
  PropertyAnimationData,
} from './PropertyAnimationComponent'
import { FrameKey, Animation } from '../animations/Animation'
import { waitUtil } from '@engine/time'
import { GlobalFadingMarker } from '../engine'

@InnerGameComponent
export default class FadingComponent extends Component {
  private _animaitonComponent?: PropertyAnimationComponent

  async fading({
    type = 'in',
    duration = 1000,
    color = 'black',
  }: {
    type?: 'out' | 'in'
    duration?: number
    color?: Color
  }) {
    if (!this._animaitonComponent) return

    this.background.color = color
    this.root.active = true

    if (duration <= 0) {
      this.root.active = type === 'in'
    } else {
      const animation = new Animation({
        name: `fadingAnimation-${type}`,
        auto: true,
        duration,
        times: 1,
        reverse: false,
        keys: new Map([
          [
            'backgroundAlpha',
            type === 'out'
              ? [
                  { frame: 0, value: 1 },
                  { frame: 30, value: 0 },
                ]
              : [
                  { frame: 0, value: 0 },
                  { frame: 30, value: 1 },
                ],
          ],
        ]),
      })
      this._animaitonComponent.setAnimation(animation)
      console.log(animation)
      await waitUtil(() => animation.isEnd, duration, this.engine.time)
      if (type === 'out') this.root.active = false
    }
  }

  async flashing({ color = 'red', duration = 100, times = 1 }) {
    if (!this._animaitonComponent) return

    this.background.color = color
    this.root.active = true

    const animation = new Animation({
      name: `fadingAnimationFlashing`,
      auto: true,
      duration: duration,
      times: times,
      frameCount: 60,
      keys: new Map([
        [
          'backgroundAlpha',
          [
            { frame: 0, value: 0 },
            { frame: 30, value: 1 },
            { frame: 60, value: 0 },
          ],
        ],
      ]),
    })
    this._animaitonComponent.setAnimation(animation)
    await waitUtil(
      () => animation.isEnd,
      duration * times * 2,
      this.engine.time
    )
    this.root.active = false
  }

  parseData(): void {
    this._animaitonComponent = this.root.addComponent(
      PropertyAnimationComponent,
      {
        type: 'PropetyAnimationComponent',
        name: 'fadingAnimation',
        auto: false,
        keys: {
          backgroundAlpha: [{ frame: 0, value: '1' }],
        } as Record<string, FrameKey[]>,
      } as PropertyAnimationData
    )
    this.engine.setVariable(GlobalFadingMarker, this)
  }
}
