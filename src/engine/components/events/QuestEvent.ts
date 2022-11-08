import { InnerGameComponent } from '..'
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
}

@InnerGameComponent
export class QuestEvent extends Component {
  eventId = ''
  when: EventTriggerWhen = EventTriggerWhen.InteractiveEnter
  isHideAfterFinish = true
  isStartHide = false
  showCondition = ''
  hideCondition = ''
  priority = 10

  execute(triggerWhen: EventTriggerWhen, callback: () => void) {
    if (this.when === triggerWhen) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      Execute(this.engine)
    }
  }

  parseData(_: AssetLoader, data: QuestEventData): void {
    this.eventId = generateEventId(data.eventId)
    this.when = data.when === undefined ? this.when : data.when
  }
}
