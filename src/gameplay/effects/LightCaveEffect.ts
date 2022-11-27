import { lightCave } from '../events/EventExector'
import { Command, CommandTriggerType, CommandTriggerWhen } from './buffer'

export default class LightCaveEffect
  implements Command, Cloneable<LightCaveEffect>
{
  constructor(public radius: number, public time: number) {}

  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (when === CommandTriggerWhen.Common && type === CommandTriggerType.Use) {
      lightCave(this.radius, this.time)
    }
    return ''
  }

  clone() {
    return new LightCaveEffect(this.radius, this.time)
  }
}
