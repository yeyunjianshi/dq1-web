import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { BoxCollider, BoxColliderData } from '../../engine/components/Collider'
import { generateMapChestId, message } from '../events/EventExector'
import { AssetLoader } from '../../engine/resource'
import { globalGameData } from '../asset/gameData'

type MapChestData = {
  type: string
  id: string
  items: number[]
  money?: number
  colliderSize: Vector2
}

@GameplayComponent
export default class MapChest extends Component implements Interaction {
  id = ''
  itemsId: number[] = []
  money = 0
  colliderSize: Vector2 = [32, 32]

  start() {
    this.refreshStatus()
  }

  canTrigger() {
    return !globalGameData.hasEvent(this.id)
  }

  refreshStatus(openStatus?: boolean) {
    if (typeof openStatus === 'undefined') {
      openStatus = !this.canTrigger()
    }
    this.background.pivotOffset = [openStatus ? 32 : 0, 0]
  }

  async open() {
    if (!this.canTrigger()) return

    this.refreshStatus(true)
    const itemsName = this.itemsId.map((id) => {
      return globalGameData.inventory.addItem(id).item.name
    })
    if (this.money > 0) itemsName.push(`${this.money}G`)

    await message(`获得了${itemsName.join('、')}`)

    globalGameData.finishEvent(this.id)
    this.refreshStatus()
  }

  interactive(): void {
    this.open()
  }

  parseData(assertLoader: AssetLoader, data: MapChestData): void {
    this.id = generateMapChestId(data.id)
    this.itemsId = data.items
    this.money = data.money || 0
    this.colliderSize = data.colliderSize || this.colliderSize
    this.colliderSize = this.root.addComponent(
      BoxCollider,
      { size: this.colliderSize } as BoxColliderData,
      assertLoader
    )
  }
}
