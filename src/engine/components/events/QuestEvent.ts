import { InnerGameComponent } from '..'
import { globalGameData } from '../../../gameplay/asset/gameData'
import Component from '../../component'
import { AssetLoader } from '../../resource'
import { Execute, generateEventId } from './EventExector'

export enum EventTriggerWhen {
  Auto = 0, // 场景切换自动触发
  Trigger, // 进入某区域触发
  InteractiveConfirm, // 交互触发
  InteractiveExit, // 出口
  InteractiveEnter, // 入口
}

type QuestEventData = {
  type: string
  eventId: string
  when?: EventTriggerWhen
  args?: any[]
  predecessorId: string[]
  predecessorItem: number[]
}

@InnerGameComponent
export class QuestEvent extends Component {
  eventId = ''
  when: EventTriggerWhen = EventTriggerWhen.InteractiveEnter
  args: any[] = []
  isHideAfterFinish = true
  isStartHide = false
  priority = 10
  predecessorId: string[] = []
  predecessorItem: number[] = []

  canTrigger(when: EventTriggerWhen) {
    return (
      this.when === when &&
      this.predecessorId.every((id) => globalGameData.hasEvent(id)) &&
      this.predecessorItem.every((id) => globalGameData.inventory.hasItem(id))
    )
  }

  execute(triggerWhen: EventTriggerWhen) {
    if (this.canTrigger(triggerWhen)) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      Execute(this.engine)
    }
  }

  parseData(_: AssetLoader, data: QuestEventData): void {
    this.eventId = generateEventId(data.eventId)
    this.when = data.when === undefined ? this.when : data.when
    this.args = data.args || []
    this.predecessorId = data.predecessorId
      ? data.predecessorId.map(generateEventId)
      : []
    this.predecessorItem = data.predecessorItem || []
  }
}
