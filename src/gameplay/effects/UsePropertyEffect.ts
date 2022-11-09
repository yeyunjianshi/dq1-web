import { range } from '../../engine/math'
import Character from '../asset/character'
import {
  Calacute,
  Command,
  CommandCalacuteType,
  CommandTriggerType,
  CommandTriggerWhen,
} from './buffer'

export default class UsePeropertyEffect
  implements Command, Cloneable<UsePeropertyEffect>
{
  constructor(
    public when: CommandTriggerWhen,
    public property: string,
    public calculateType: CommandCalacuteType,
    public values: number[]
  ) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    if (
      (when & CommandTriggerWhen.All) > 0 &&
      type === CommandTriggerType.Use
    ) {
      const hero = args[0] as Character
      const value = range(this.values)
      if (
        ['power', 'resilience', 'speed', 'maxHP', 'maxMP', 'HP', 'MP'].indexOf(
          this.property
        ) >= 0
      ) {
        Calacute(
          this.calculateType,
          hero[
            this.property as
              | 'power'
              | 'resilience'
              | 'speed'
              | 'maxHP'
              | 'maxMP'
              | 'HP'
              | 'MP'
          ],
          value
        )
      }
    }
  }

  clone(init = true) {
    return Object.create(
      new UsePeropertyEffect(
        this.when,
        this.property,
        this.calculateType,
        this.values
      )
    )
  }
}
