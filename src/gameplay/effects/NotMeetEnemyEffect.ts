import { globalGameData } from '../asset/gameData'
import { Command, CommandTriggerType, CommandTriggerWhen } from './buffer'

export default class NotMeetEnemyEffect
  implements Command, Cloneable<NotMeetEnemyEffect>
{
  constructor(public step: number) {}

  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (when === CommandTriggerWhen.Common && type === CommandTriggerType.Use) {
      globalGameData.notMeetEnemyStep = this.step
    }
    return ''
  }

  clone() {
    return new NotMeetEnemyEffect(this.step)
  }
}
