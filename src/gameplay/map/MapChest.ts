import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { BoxCollider, BoxColliderData } from '../../engine/components/Collider'
import {
  finishQuestEvents,
  generateMapChestId,
  message,
  refreshAndTriggerAutoEvent,
} from '../events/EventExector'
import { AssetLoader } from '../../engine/resource'
import { globalGameData } from '../asset/gameData'
import { Audios } from '../audio/AudioConfig'

type MapChestData = {
  type: string
  id: string
  items?: number[]
  money?: number
  colliderSize: Vector2
  hidden: boolean
  important: boolean
  trigger?: boolean
  finishEvents?: string[]
}

@GameplayComponent
export default class MapChest extends Component implements Interaction {
  id = ''
  itemsId: number[] = []
  money = 0
  colliderSize: Vector2 = [32, 32]
  important = false
  hidden = false
  trigger = false
  finishEvents?: string[]

  start() {
    if (this.hidden) {
      this.background.name = ''
      this.background.sprite = undefined
    }
    this.refreshStatus()
  }

  canTrigger() {
    return !globalGameData.hasEvent(this.id)
  }

  refreshStatus(openStatus?: boolean) {
    if (this.hidden) return

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

    this.audios.playSE(this.important ? Audios.ImportantItem : Audios.Chest)

    if (this.money === 0 && this.itemsId.length === 0)
      await message(`宝箱里面是空的。`)
    else await message(`获得了${itemsName.join('、')}`)

    globalGameData.finishEvent(this.id)
    this.refreshStatus()

    if (this.finishEvents) {
      finishQuestEvents(...this.finishEvents)
      refreshAndTriggerAutoEvent()
    }
  }

  interactive(): void {
    this.open()
  }

  parseData(assertLoader: AssetLoader, data: MapChestData): void {
    this.id = generateMapChestId(data.id)
    this.itemsId = data.items ?? []
    this.money = data.money || 0
    this.colliderSize = data.colliderSize || this.colliderSize
    this.hidden = data.hidden ?? this.hidden
    this.important = data.important ?? this.important
    this.finishEvents = data.finishEvents
    this.trigger = data.trigger ?? this.trigger
    this.root.addComponent(
      BoxCollider,
      { size: this.colliderSize, trigger: this.trigger } as BoxColliderData,
      assertLoader
    )
  }
}
