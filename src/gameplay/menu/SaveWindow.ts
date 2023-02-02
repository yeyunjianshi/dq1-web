import { GameplayComponent } from '@engine/components'
import ListComponent, {
  KeyValueAdapter,
} from '@engine/components/ListComponent'
import BaseWindow from '@engine/components/BaseWindow'
import {
  generateSaveData,
  SaveData,
  save,
  loadAll,
  load,
} from '../save/SaveSystem'
import { Audios } from '../audio/AudioConfig'

@GameplayComponent
export default class SaveWindow extends BaseWindow {
  private _listComponent?: ListComponent
  private _adapter?: KeyValueAdapter
  private _saveSlots: (SaveData | null)[] = []

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
      this._saveSlots = loadAll()
      this._adapter = new KeyValueAdapter(this.getAdapterData())
      this._listComponent.setAdapter(this._adapter)
      this._listComponent.addSelectListener((_, pos: number) => {
        save(pos, generateSaveData())
        this._saveSlots[pos] = load(pos)
        this.refreshList(true)

        this.audios.playME(Audios.Save)
      })
      this._listComponent.setCursorIndex(0)
    }
  }

  private getAdapterData() {
    return this._saveSlots.map(
      (slot) => slot?.toSlotText() ?? { key: '空的存档', value: '' }
    )
  }

  private refreshList(init = false) {
    if (init) this._saveSlots = loadAll()
    this._adapter!.setData(this.getAdapterData())
    this._listComponent!.refresh()
  }

  show(init?: boolean): void {
    super.show(init)
    this.refreshList(true)
  }

  update(): void {
    this._listComponent?.update()
  }
}
