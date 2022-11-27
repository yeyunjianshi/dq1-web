import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { AssetLoader } from '../../engine/resource'
import { globalGameData } from '../asset/gameData'
import {
  AddExecuteEvent,
  EventExecuteEndMarker,
  Execute,
  generateEventId,
} from './EventExector'

export enum EventTriggerWhen {
  Auto = 0, // 场景切换自动触发
  Trigger, // 进入某区域触发
  InteractiveConfirm, // 交互触发
  InteractiveExit, // 出口
  InteractiveEnter, // 入口
}

export type QuestEventData = {
  type: string
  eventId: string
  when?: EventTriggerWhen
  args?: any[]
  predecessorId: string[]
  predecessorItem: number[]
  insertGlobalAfterFinish?: boolean
  hideAfterFinish?: boolean
}

@GameplayComponent
export class QuestEvent extends Component implements Interaction {
  questId = ''
  eventId = ''
  when: EventTriggerWhen = EventTriggerWhen.InteractiveEnter
  args: any[] = []
  isHideAfterFinish = false
  isStartHide = false
  priority = 10
  predecessorId: string[] = []
  predecessorItem: number[] = []
  isInsertGlobalAfterFinish = false

  canTrigger(when: EventTriggerWhen) {
    return (
      !globalGameData.hasEvent(this.eventId) &&
      this.when === when &&
      this.predecessorId.every((id) => globalGameData.hasEvent(id)) &&
      this.predecessorItem.every((id) => globalGameData.inventory.hasItem(id))
    )
  }

  awake() {
    if (
      this.isStartHide ||
      (this.isInsertGlobalAfterFinish && globalGameData.hasEvent(this.eventId))
    ) {
      this.root.active = false
    }

    this.root.events.register((marker) => {
      if (marker === EventExecuteEndMarker) {
        if (this.isHideAfterFinish) this.root.active = false
        if (this.isInsertGlobalAfterFinish) {
          return globalGameData.finishEvent(this.eventId)
        }
      }
    })
  }

  interactive(): void {
    AddExecuteEvent(this)
    Execute(this.engine)
  }

  parseData(_: AssetLoader, data: QuestEventData): void {
    this.questId = data.eventId
    this.eventId = generateEventId(data.eventId)
    this.when = data.when === undefined ? this.when : data.when
    this.args = data.args || []
    this.predecessorId = data.predecessorId
      ? data.predecessorId.map(generateEventId)
      : []
    this.predecessorItem = data.predecessorItem || []
    this.isHideAfterFinish = data.hideAfterFinish ?? this.isHideAfterFinish
    this.isInsertGlobalAfterFinish =
      data.insertGlobalAfterFinish ?? this.isHideAfterFinish
  }
}
