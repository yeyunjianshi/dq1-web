import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { AssetLoader } from '../../engine/resource'
import { Direction, parseDirection } from '@engine/input'
import TeamControllerComponent from '../core/TeamControllerComponent'
import { GlobalTeamControllerMarker } from '@engine/engine'

type BornPointData = {
  type: string
  position: Vector2
  direciton?: string | number
  isPremutation?: boolean
}

@GameplayComponent
export default class BornPointComponent extends Component {
  position: Vector2 = [0, 0]
  direciton = Direction.down
  isPremutation = false

  start() {
    if (import.meta.env.DEV) {
      const teamController = this.engine.getVariable<TeamControllerComponent>(
        GlobalTeamControllerMarker
      )
      teamController.moveTo(this.position, this.direciton, this.isPremutation)
    }
  }

  parseData(_: AssetLoader, data: BornPointData): void {
    this.position = data.position
    this.direciton = parseDirection(data.direciton)
    this.isPremutation = data.isPremutation ?? this.isPremutation
  }
}
