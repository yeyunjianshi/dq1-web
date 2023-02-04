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
  remove,
  SaveSceneData,
} from '../save/SaveSystem'
import { Audios } from '../audio/AudioConfig'
import TeamControllerComponent from '@gameplay/core/TeamControllerComponent'
import { GlobalTeamControllerMarker } from '@engine/engine'

export type SaveActionType = 'Save' | 'Load' | 'Delete'
@GameplayComponent
export default class SaveWindow extends BaseWindow {
  private _listComponent?: ListComponent
  private _adapter?: KeyValueAdapter
  private _saveSlots: (SaveData | null)[] = []
  private _action: SaveActionType = 'Save'
  private _actionListener?: (
    saveData: SaveData | null,
    slotIndex: number
  ) => void

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
        let saveData: SaveData | null = null
        if (this._action === 'Save') {
          saveData = generateSaveData(this.getSaveSceneData())
          save(pos, saveData)
        } else if (this._action === 'Load') {
          saveData = load(pos)
        } else if (this._action === 'Delete') {
          saveData = remove(pos)
        }

        if (saveData) {
          this.audios.playME(Audios.Save)
          this.refreshList(true)
        }

        this._actionListener && this._actionListener(saveData, pos)
      })
      this._listComponent.setCursorIndex(0)
    }
  }

  private getSaveSceneData(): SaveSceneData {
    const teamController = this.engine.getVariable<TeamControllerComponent>(
      GlobalTeamControllerMarker
    )
    const sceneData = {
      sceneName: this.sceneManager.currentScene.name,
      position: teamController.headPosition,
    }
    return sceneData
  }

  private getAdapterData() {
    return this._saveSlots.map(
      (slot) => slot?.toSlotText() ?? { key: '空的存档', value: '' }
    )
  }

  refreshList(init = false) {
    if (init) this._saveSlots = loadAll()
    this._adapter!.setData(this.getAdapterData())
    this._listComponent!.refresh()
  }

  setActionListener(
    action: SaveActionType,
    listener: (saveData: SaveData | null, slotIndex: number) => void
  ) {
    this._action = action
    this._actionListener = listener
  }

  show(init?: boolean): void {
    super.show(init)
    this.refreshList(true)
    this._listComponent!.setCursorIndex(0)
  }

  update(): void {
    this._listComponent?.update()
  }
}
