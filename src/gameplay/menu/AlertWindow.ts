import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import ListComponent, {
  TextAdapter,
} from '../../engine/components/ListComponent'
import TextComponent from '../../engine/components/TextComponent'
import { nextFrame } from '../../engine/time'

enum AlertStatus {
  Select,
  Yes,
  No,
}
@GameplayComponent
export default class AlertWindow extends BaseWindow {
  private _contentText?: TextComponent
  private _judgeComponent?: ListComponent
  private _status = AlertStatus.Select

  start() {
    this._contentText = this.root.getComponentInChildByName(
      'alertContentText',
      TextComponent
    ) as TextComponent
    this._judgeComponent = this.root.getComponentInChildByName(
      'alertJudgeComponent',
      ListComponent
    ) as ListComponent

    this.enable = false
    this._judgeComponent!.enable = false

    this.init()
  }

  init() {
    this._judgeComponent?.setAdapter(
      new TextAdapter([{ text: '是' }, { text: '否' }])
    )
    const confirmListener = () => {
      this._status = AlertStatus.Yes
      this._listeners.forEach((l) => l(true))
      console.log('alert confirm')
    }
    const cancelListener = () => {
      this._status = AlertStatus.No
      this._listeners.forEach((l) => l(false))
      console.log('alert cancel')
    }
    this._judgeComponent?.addSelectListener(() => {
      if (this._judgeComponent!.cursorIndex === 1) {
        cancelListener()
      } else {
        confirmListener()
      }
    })
    this._judgeComponent?.addCancelListener(cancelListener)
  }

  update(): void {
    this._judgeComponent?.update()
  }

  async select() {
    while (this._status === AlertStatus.Select) {
      await nextFrame()
      this._judgeComponent?.update()
    }
    return this._status === AlertStatus.Yes
  }

  private _listeners: ListenerFunction[] = []

  addListener(listener: ListenerFunction) {
    this._listeners.push(listener)
  }

  removeListener(listner: ListenerFunction) {
    this._listeners = this._listeners.filter((l) => l !== listner)
  }

  show(init = true, content = '') {
    super.show(init)
    this._status = AlertStatus.Select
    this._contentText?.setText(content)
    this._judgeComponent?.setCursorIndex(0)
  }

  hide() {
    super.hide()
    this._listeners = []
  }
}
