import { GameplayComponent } from '../../engine/components'
import Component from '../../engine/component'
import { GlobalWindowMarker } from '../../engine/engine'
import { delay, nextFrame } from '../../engine/time'
import ScrollTextComponent from '../../engine/components/ScrollTextComponent'
import GameObject from '../../engine/gameObject'
import ListComponent, {
  TextAdapter,
} from '../../engine/components/ListComponent'
import CommonStatusWindow from './CommonStatusWindow'

@GameplayComponent
export default class GlobalWindowComponent extends Component {
  private _messageWindow?: MessageWindow
  private _menuWindow?: MenuWindow
  private _commonStatusWindow?: CommonStatusWindow

  awake(): void {
    this._messageWindow = new MessageWindow(
      this.root.getComponentInChildByName(
        'messageWindow',
        ScrollTextComponent
      ) as ScrollTextComponent,
      this.root
    )
    this._menuWindow = new MenuWindow(
      this.root.getComponentInChildByName(
        'menuWindow',
        ListComponent
      ) as ListComponent,
      this.root
    )
    this._commonStatusWindow = this.root.getComponentInChildByName(
      'commonStatusWindow',
      CommonStatusWindow
    ) as CommonStatusWindow

    this.engine.setVariable(GlobalWindowMarker, this)

    this._messageWindow.awake()
    this._menuWindow.awake()
  }

  start() {
    this.messageWindow.start()
    this.menuWindow.start()
  }

  get messageWindow() {
    return this._messageWindow!
  }

  get menuWindow() {
    return this._menuWindow!
  }
}

abstract class BaseWindow extends Component {
  async InputConfirmOrCancel() {
    await nextFrame()
    while (
      !this.engine.input.isConfirmPressed() &&
      !this.engine!.input.isCancelPressed()
    ) {
      await nextFrame()
    }
  }
}

class MessageWindow extends BaseWindow {
  constructor(private _messageWindow: ScrollTextComponent, root: GameObject) {
    super(root)
  }

  private _isShowingMessage = false

  async talk(name: string, text: string, clear = false) {
    const messageWindow = this._messageWindow
    messageWindow.root.parent.active = true
    if (name.length === 0 && text.trim().length === 0) return
    if (name.length !== 0) name += ':'
    this._isShowingMessage = true
    if (clear) messageWindow.clearText()
    await messageWindow.showText(text, name)
    await this.InputConfirmOrCancel()
    if (clear) await messageWindow.scrollClearText()
    this._isShowingMessage = false

    delay(50).then(() => {
      if (!this._isShowingMessage) {
        this.hideMessage()
      }
    })
  }

  hideMessage() {
    this._messageWindow!.root.parent.active = false
    this._messageWindow!.clearText()
  }

  clearMessage() {
    this._messageWindow!.clearText()
  }
}

class MenuWindow extends BaseWindow {
  constructor(private _menuWindow: ListComponent, root: GameObject) {
    super(root)
  }

  menuCommands = [
    { text: '装备' },
    { text: '状态' },
    { text: '道具' },
    { text: '咒语' },
    { text: '存档' },
    { text: '设置' },
  ]

  start(): void {
    const adapter = new TextAdapter(this.menuCommands)
    this._menuWindow.setAdapter(adapter)
    this._menuWindow.addSelectListener((item, pos) => {
      console.log(item)
      console.log(pos)
    })
    this._menuWindow.addHoverListenner((_, pos) => {
      console.log('hover ' + pos)
    })
    this._menuWindow.addCancelListener(() => {
      this.hide()
    })
  }

  show(init = true) {
    if (init) this._menuWindow.setCursorIndex(0)
    this._menuWindow.active = true
  }

  hide() {
    this._menuWindow.active = false
  }
}
