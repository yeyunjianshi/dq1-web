import { AssetLoader } from '../resource'
import Component from '@engine/component'
import { InnerGameComponent } from '.'
import { FrameKey, Animation } from '../animations/animation'

export type PropertyAnimationPathData = {
  type: string
  path: string
}

/**
 * json config example
  {
    "type": "$PropertyAnimationComponent",
    "keys": {
      "backgroundAlpha": [
        {
          "frame": 0,
          "value": 1
        },
        {
          "frame": 30,
          "value": 0
        }
      ]
    },
    "times": -1,
    "reverse": true,
    "duration": 1000,
    "auto": true
  }
 */

export type PropertyAnimationData = {
  type: string
  name: string
  auto: boolean
  duration: number
  frameCount: number
  times: number
  fillEnd: boolean
  reverse: boolean
  keys: Record<string, FrameKey[]>
}

function isPropertyAnimationPathData(
  data: any
): data is PropertyAnimationPathData {
  return !!data.path
}

@InnerGameComponent
export class PropertyAnimationComponent extends Component {
  private _animation?: Animation

  update() {
    if (this._animation && this._animation.isPlaying) {
      this._animation.update(this.time.scaleDeltaTime)
      if (!this._animation.isEnd && !this._animation.isPaused) {
        const keys = this._animation.currentKeys()
        keys.forEach(({ property, animationKey }) => {
          const value = this._animation!.getFrameKeyValue(animationKey)
          if (property === 'localX' || property === 'localY') {
            this.root[property] = value
          } else if (property === 'backgroundAlpha') {
            this.background.alpha = value
          } else if (property === 'backgroundSprite') {
            if (typeof animationKey.value === 'string') {
              this.root.background.name = animationKey.value
              this.root.background.sprite = this.resource.getSprite(
                animationKey.value
              )
            } else if (typeof animationKey.value === 'object') {
              const value = animationKey.value

              this.root.background.name = value.name
              this.root.background.sprite = this.resource.getSprite(value.name)
              this.root.background.spriteWidth = value.spriteWidth
              this.root.background.spriteHeight = value.spriteHeight
              this.root.background.pivotOffset = value.pivotOffset
            }
          }
        })
      }
    }
  }

  pause() {
    this._animation?.pause()
  }

  stop() {
    this._animation?.stop()
  }

  replay(reset = true) {
    this._animation?.replay(reset)
  }

  parseData(
    assetLoader: AssetLoader,
    data: PropertyAnimationData | PropertyAnimationPathData
  ) {
    if (isPropertyAnimationPathData(data)) {
      assetLoader.addAssets(
        this.resource
          .loadJson<PropertyAnimationData>(data.path)
          .then((d) => this.parseAnimationData(assetLoader, d))
      )
    } else {
      this.parseAnimationData(assetLoader, data)
    }
  }

  setAnimation(animation: Animation) {
    this.stop()
    this._animation = animation
  }

  parseAnimationData(assetLoader: AssetLoader, data: PropertyAnimationData) {
    if (!data.keys) data.keys = {}
    for (const [prop, keys] of Object.entries(data.keys)) {
      if (['backgroundSprite'].includes(prop)) {
        keys.forEach((key) => {
          assetLoader.addAssets(this.resource.loadSprite(key.value))
        })
      }
    }

    this._animation = new Animation({
      ...data,
      keys: new Map(Object.entries(data.keys)),
    })
  }
}

export default PropertyAnimationComponent
