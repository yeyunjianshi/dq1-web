import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { generateDoorId } from '../events/EventExector'
import { AssetLoader } from '../../engine/resource'
import { globalGameData } from '../asset/gameData'
import { BoxCollider, BoxColliderData } from '../../engine/components/Collider'
import { Audios } from '@gameplay/audio/AudioConfig'

type DoorData = {
  type: string
  id: string
  colliderSize: Vector2
}

@GameplayComponent
export default class Door extends Component implements Interaction {
  id = ''

  start() {
    this.refreshStatus()
  }

  canTrigger() {
    return (
      this.root.active &&
      this.active &&
      !globalGameData.hasEvent(this.id) &&
      globalGameData.inventory.hasItem(50)
    )
  }

  refreshStatus(openStatus?: boolean) {
    if (typeof openStatus === 'undefined') {
      openStatus = globalGameData.hasEvent(this.id)
    }
    this.active = this.root.active = !openStatus
  }

  async open() {
    if (!this.canTrigger()) return

    this.audios.playME(Audios.Door)

    globalGameData.inventory.removeItemId(50)
    globalGameData.finishEvent(this.id)
    this.refreshStatus(true)
  }

  interactive(): void {
    this.open()
  }

  parseData(assertLoader: AssetLoader, data: DoorData): void {
    this.id = generateDoorId(data.id)
    this.root.addComponent(
      BoxCollider,
      { size: data.colliderSize } as BoxColliderData,
      assertLoader
    )
  }
}
