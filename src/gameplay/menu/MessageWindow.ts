import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import ScrollTextComponent from '../../engine/components/ScrollTextComponent'
import { delay } from '../../engine/time'
import AlertWindow from './AlertWindow'

@GameplayComponent
export default class MessageWindow extends BaseWindow {
  private _isShowingMessage = false
  private _messageTextWindow?: ScrollTextComponent
  private _alertWindow?: AlertWindow

  start() {
    this._messageTextWindow = this.root.getComponentInChildren(
      ScrollTextComponent
    ) as ScrollTextComponent
    this._alertWindow = this.root.getComponentInChildren(
      AlertWindow
    ) as AlertWindow

    this._messageTextWindow.enable = false
    this._alertWindow.enable = false
  }

  async talk(
    name: string,
    text: string,
    clear = false,
    select = false
  ): Promise<boolean> {
    let ret = true

    this.root.active = true
    const messageWindow = this._messageTextWindow!
    if (name.length === 0 && text.trim().length === 0) return ret

    if (name.length !== 0) name += ':'
    this._isShowingMessage = true
    if (clear) messageWindow.clearText()
    await messageWindow.showTextScroll(text, name)

    if (select) {
      this._alertWindow!.show()
      ret = await this._alertWindow!.select()
      this._alertWindow!.hide()
    } else {
      await this.InputConfirmOrCancel()
    }
    if (clear) await messageWindow.scrollClearText()
    this._isShowingMessage = false

    delay(50).then(() => {
      if (!this._isShowingMessage) {
        this.hide()
      }
    })

    return ret
  }

  hide() {
    this.root.active = false
    this._messageTextWindow!.clearText()
  }

  clearMessage() {
    this._messageTextWindow!.clearText()
  }
}
