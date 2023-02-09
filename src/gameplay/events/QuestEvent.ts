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
  insertEventTable?: boolean
  hideAfterFinish?: boolean
  hideStart?: boolean
  hideEventsId?: string[]
}

@GameplayComponent
export class QuestEvent extends Component implements Interaction {
  questId = ''
  eventId = ''
  when: EventTriggerWhen = EventTriggerWhen.InteractiveConfirm
  args: any[] = []
  isHideAfterFinish = false
  isStartHide = false
  priority = 10
  hideEventsId?: string[]
  predecessorId: string[] = []
  predecessorItem: number[] = []
  isInsertGlobalAfterFinish = false // 完成后插入到全局事件表

  canTrigger(when: EventTriggerWhen) {
    return (
      this.questId !== '0' &&
      !globalGameData.hasEvent(this.eventId) &&
      this.when === when &&
      this.predecessorId.every((id) => globalGameData.hasEvent(id)) &&
      this.predecessorItem.every((id) => globalGameData.inventory.hasItem(id))
    )
  }

  awake() {
    this.refresh()

    this.root.events.register(({ marker, questId }) => {
      console.log(`${this.questId} ${marker.toString()}`)

      if (this.questId === questId && marker === EventExecuteEndMarker) {
        if (this.isInsertGlobalAfterFinish) {
          return globalGameData.finishEvent(this.eventId)
        }
        if (this.isHideAfterFinish) {
          const finish =
            (this.hideEventsId &&
              this.hideEventsId.every((id) =>
                globalGameData.hasEvent(generateEventId(id))
              )) ||
            globalGameData.hasEvent(this.eventId)
          this.root.active = !finish
        }
      }
    })
  }

  async interactive() {
    AddExecuteEvent(this)
    await Execute(this.engine)
  }

  refresh() {
    if (this.isHideAfterFinish) {
      if (
        globalGameData.hasEvent(this.eventId) ||
        (this.hideEventsId &&
          this.hideEventsId.every((id) =>
            globalGameData.hasEvent(generateEventId(id))
          ))
      ) {
        this.root.active = false
        return
      }
    }
    if (this.isStartHide) {
      this.root.active =
        this.predecessorId.every((id) => globalGameData.hasEvent(id)) &&
        this.predecessorItem.every((id) => globalGameData.inventory.hasItem(id))
    }
  }

  parseData(_: AssetLoader, data: QuestEventData): void {
    this.questId = data.eventId
    this.eventId = generateEventId(data.eventId)
    this.when = this.parseWhen(data.when)
    this.args = data.args || []
    this.predecessorId = data.predecessorId
      ? data.predecessorId.map(generateEventId)
      : []

    this.hideEventsId = data.hideEventsId
    this.predecessorItem = data.predecessorItem || []
    this.isStartHide = data.hideStart ?? false
    this.isHideAfterFinish = data.hideAfterFinish ?? this.isHideAfterFinish
    this.isInsertGlobalAfterFinish =
      data.insertEventTable ?? this.isInsertGlobalAfterFinish
  }

  parseWhen(when: string | EventTriggerWhen | undefined): EventTriggerWhen {
    if (when === undefined) return this.when
    else if (typeof when === 'string') {
      switch (when) {
        case 'auto':
          return EventTriggerWhen.Auto
        case 'trigger':
          return EventTriggerWhen.Trigger
        case 'confirm':
          return EventTriggerWhen.InteractiveConfirm
        case 'enter':
          return EventTriggerWhen.InteractiveEnter
        case 'exit':
          return EventTriggerWhen.InteractiveExit
        default:
          throw new Error(`QuestEvent Error: 未找到when的值${when}。`)
      }
    }
    return when as EventTriggerWhen
  }
}
