import { lightCave } from '../../engine/components/events/EventExector'
import { Command, CommandTriggerWhen, CommandTriggerType } from './buffer'

export default class LightCaveEffect
  implements Command, Cloneable<LightCaveEffect>
{
  constructor(public radius: number, public time: number) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    if (when === CommandTriggerWhen.Common) {
      lightCave(this.radius, this.time)
    }
    return ''
  }

  clone(init = true) {
    return new LightCaveEffect(this.radius, this.time)
  }
}
