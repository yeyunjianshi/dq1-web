import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import ListComponent, {
  TextAdapter,
} from '../../engine/components/ListComponent'
import TextComponent from '../../engine/components/TextComponent'

@GameplayComponent
export default class AlertWindow extends BaseWindow {
  private _contentText?: TextComponent
  private _judgeComponent?: ListComponent

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
    this._judgeComponent?.addSelectListener(() => {
      this._listeners.forEach((l) => l(true))
      console.log('alert confirm')
    })
    this._judgeComponent?.addCancelListener(() => {
      this._listeners.forEach((l) => l(false))
      console.log('alert cancel')
    })
  }

  update(): void {
    this._judgeComponent?.update()
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
    this._contentText?.setText(content)
    this._judgeComponent?.setCursorIndex(0)
  }

  hide() {
    super.hide()
    this._listeners = []
  }
}
