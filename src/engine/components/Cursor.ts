import Component from '../../engine/component'
import { InnerGameComponent } from '../../engine/components'
import { AssetLoader } from '../../engine/resource'
import PropertyAnimationComponent, {
  PropertyAnimationData,
} from './PropertyAnimationComponent'

type CursorData = PropertyAnimationData & {
  initStatus: CursorStatus
}
type CursorStatus = 'Selected' | 'Hover' | 'Unselect'

@InnerGameComponent
export class Cursor extends Component {
  private _status: CursorStatus = 'Unselect'
  private _animationComponent?: PropertyAnimationComponent

  start() {
    this.setStatus(this._status, true)
  }

  setStatus(status: CursorStatus, force = false) {
    if (!this._animationComponent || (!force && this._status === status)) return

    if (status === 'Selected') {
      this._animationComponent.stop()
      this.background.alpha = 1
    } else if (status === 'Unselect') {
      this._animationComponent.stop()
      this.background.alpha = 0
    } else if (status === 'Hover') {
      this._animationComponent.replay(true)
    }

    this._status = status
  }

  parseData(assertLoader: AssetLoader, data: CursorData): void {
    this._status = data.initStatus ?? this._status

    data.times ??= -1
    data.duration ??= 1000
    data.reverse ??= true
    data.frameCount ??= 30
    data.keys ??= {
      backgroundAlpha: [
        {
          frame: 0,
          value: 1,
        },
        {
          frame: data.frameCount,
          value: 0,
        },
      ],
    }
    this._animationComponent = this.root.addComponent(
      PropertyAnimationComponent,
      data,
      assertLoader
    )
  }
}

export default Cursor
