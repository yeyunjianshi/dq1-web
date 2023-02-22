import Component from '@engine/component'
import { GameplayComponent } from '@engine/components'
import { GlobalTeamControllerMarker, GlobalWindowMarker } from '@engine/engine'
import TeamControllerComponent from './TeamControllerComponent'
import GlobalWindowComponent from '@gameplay/menu/GlobalWindowComponent'
import { transitionToScene } from '@gameplay/events/Transition'
import { delay } from '@engine/time'

@GameplayComponent
export default class StartComponent extends Component {
  private _teamController?: TeamControllerComponent
  private _globalWindow?: GlobalWindowComponent

  start() {
    this._teamController = this.engine.getVariable<TeamControllerComponent>(
      GlobalTeamControllerMarker
    )
    this._globalWindow =
      this.engine.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

    this._teamController.root.active = false
    this._globalWindow.root.active = false
    this._globalWindow.clearWindows()
    this.init()
  }

  private async init() {
    await delay(2000)
    transitionToScene(this.engine, 'Description')
  }
}
