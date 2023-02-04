import { GameplayComponent } from '@engine/components'
import ListComponent, { TextAdapter } from '@engine/components/ListComponent'
import BaseWindow from '@engine/components/BaseWindow'
import { transitionToScene } from '@gameplay/events/Transition'

@GameplayComponent
export default class ConfigWindow extends BaseWindow {
  private _listComponent?: ListComponent
  private _adapter?: TextAdapter
  private _slots: { text: string }[] = []

  start() {
    this._listComponent = this.root.getComponentInChildren(
      ListComponent
    ) as ListComponent
    this._listComponent.enable = false
    this.enable = false
    this.init()
  }

  private init() {
    if (this._listComponent) {
      this._slots = [{ text: '返回标题' }]
      this._adapter = new TextAdapter(this._slots)
      this._listComponent.setAdapter(this._adapter)
      this._listComponent.addSelectListener((_, pos: number) => {
        if (pos === 0) {
          // back to title
          transitionToScene(this.engine, 'Title')
        }
      })
      this._listComponent.setCursorIndex(0)
    }
  }

  update(): void {
    this._listComponent?.update()
  }
}
