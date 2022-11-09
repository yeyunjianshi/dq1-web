import { InnerGameComponent } from '.'
import Component from '../component'
import { GlobalWindow } from '../engine'
import { delay, nextFrame } from '../time'
import ScrollTextComponent from './ScrollTextComponent'

@InnerGameComponent
export default class GlobalWindowComponent extends Component {
  private _messageWindow?: ScrollTextComponent

  awake(): void {
    this._messageWindow = this.root.getComponentInChildren(
      ScrollTextComponent
    ) as ScrollTextComponent

    this.engine.setVariable(GlobalWindow, this)
  }

  async InputConfirmOrCancel() {
    await nextFrame()
    while (
      !this.engine.input.isConfirmPressed() &&
      !this.engine!.input.isCancelPressed()
    ) {
      await nextFrame()
    }
  }

  private _isShowingMessage = false

  async talk(name: string, text: string, clear = false) {
    const messageWindow = this._messageWindow!
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
