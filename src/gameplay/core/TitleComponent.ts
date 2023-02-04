import Component from '@engine/component'
import { GameplayComponent } from '@engine/components'
import ListComponent, { TextAdapter } from '@engine/components/ListComponent'
import { GlobalTeamControllerMarker, GlobalWindowMarker } from '@engine/engine'
import { Audios } from '../audio/AudioConfig'
import { SaveData } from '../save/SaveSystem'
import SaveWindow from '../menu/SaveWindow'
import { transitionToScene } from '@gameplay/events/Transition'
import {
  GameData,
  globalGameData,
  InputType,
  setGlobalGameData,
} from '@gameplay/asset/gameData'
import TeamControllerComponent from './TeamControllerComponent'
import GlobalWindowComponent from '@gameplay/menu/GlobalWindowComponent'
import { Direction } from '@engine/input'

@GameplayComponent
export default class TitleComponent extends Component {
  private _teamController?: TeamControllerComponent
  private _globalWindow?: GlobalWindowComponent
  private _menuWindow?: ListComponent
  private _saveWindow?: SaveWindow

  start() {
    this._teamController = this.engine.getVariable<TeamControllerComponent>(
      GlobalTeamControllerMarker
    )
    this._globalWindow =
      this.engine.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

    this._teamController.root.active = false
    this._globalWindow.root.active = false
    this._globalWindow.clearWindows()

    this._menuWindow = this.root.getComponentInChildByName(
      'menuWindow',
      ListComponent
    ) as ListComponent

    this._saveWindow = this.root.getComponentInChildByName(
      'saveWindow',
      SaveWindow
    ) as SaveWindow

    this._menuWindow.enable = false
    this._saveWindow.enable = false

    this._menuWindow.root.active = true
    this._saveWindow.root.active = false

    this.init()
  }

  private init() {
    if (this._menuWindow) {
      this._menuWindow.setAdapter(
        new TextAdapter(
          ['NewGame', 'LoadGame', 'DeleteSave'].map((text) => ({
            text: this.engine.i18n.getTextValue(text),
          }))
        )
      )
      this._menuWindow.addSelectListener((_, index) => {
        if (index === 0) {
          this.titleStartGame()
        } else if (index === 1) {
          this._saveWindow!.refreshList()
          this._saveWindow!.root.active = true
          this._saveWindow!.setActionListener('Load', (saveData) => {
            this.titleLoadGame(saveData)
          })
        } else if (index === 2) {
          this._saveWindow!.refreshList()
          this._saveWindow!.root.active = true
          this._saveWindow!.setActionListener('Delete', () => {
            this.titleDeleteSave()
          })
        }
      })
    }
  }

  private titleStartGame() {
    console.log('Start Game')

    const gameData = new GameData()
    gameData.init()
    setGlobalGameData(gameData)

    this._teamController!.root.active = true
    this._globalWindow!.root.active = true
    transitionToScene(this.engine, 'TantegelCastle2', 'StartGame')
  }

  private titleLoadGame(saveData: SaveData | null) {
    console.log('Load Game')
    console.log(saveData)

    if (saveData) {
      setGlobalGameData(saveData.data)

      transitionToScene(this.engine, saveData.sceneData.sceneName).then(() => {
        globalGameData.inputType = InputType.Move
        this._globalWindow!.root.active = true
        this._teamController!.root.active = true
        this._teamController!.moveTo(
          saveData.sceneData.position,
          Direction.down,
          false
        )
      })
    }
  }

  private titleDeleteSave() {
    console.log('Delete Game')
  }

  update(): void {
    if (!this._menuWindow || !this._saveWindow) return

    if (this.input.isCancelPressed()) {
      if (this.isSelectSave) {
        this._saveWindow.root.active = false
        this._menuWindow.refreshHover()
      }
      return
    } else if (this.input.isConfirmPressed()) {
      // this.audios.playSE(Audios.Menu)
    }

    if (this.isSelectSave) this._saveWindow.update()
    else this._menuWindow.update()
  }

  get isSelectSave() {
    return this._saveWindow?.root.active ?? false
  }
}
