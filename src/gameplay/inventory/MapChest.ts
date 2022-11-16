import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import {
  generateMapChestId,
  messageCachePreviousInputType,
} from '../../engine/components/events/EventExector'
import { AssetLoader } from '../../engine/resource'
import { globalGameData } from '../asset/gameData'

type MapChestData = {
  type: string
  id: string
  items: number[]
  money?: number
}

@GameplayComponent
export default class MapChest extends Component implements Interaction {
  id = ''
  itemsId: number[] = []
  money = 0

  start() {
    this.refreshStatus()
  }

  canTrigger() {
    return !globalGameData.hasEvent(this.id)
  }

  refreshStatus() {
    this.background.pivotOffset = [this.canTrigger() ? 0 : 32, 0]
  }

  async open() {
    if (!this.canTrigger()) return

    const itemsName = this.itemsId.map((id) => {
      return globalGameData.inventory.addItem(id).item.name
    })
    if (this.money > 0) itemsName.push(`${this.money}G`)

    await messageCachePreviousInputType(`获得了${itemsName.join('、')}`)

    globalGameData.finishEvent(this.id)
    this.refreshStatus()
  }

  interactive(): void {
    this.open()
  }

  parseData(_: AssetLoader, data: MapChestData): void {
    this.id = generateMapChestId(data.id)
    this.itemsId = data.items
    this.money = data.money || 0
  }
}
