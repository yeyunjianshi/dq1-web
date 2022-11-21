import { HasType, range } from '../../engine/math'
import Character from '../asset/character'
import { globalGameData } from '../asset/gameData'
import BattleCharacter from '../battle/BattleCharacter'
import {
  Calacute,
  Command,
  CommandCalacuteType,
  CommandTriggerType,
  CommandTriggerWhen,
} from './buffer'

type PropertyType =
  | 'power'
  | 'resilience'
  | 'speed'
  | 'maxHP'
  | 'maxMP'
  | 'HP'
  | 'MP'

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
    let hero
    if (
      (when & CommandTriggerWhen.Battle) > 0 &&
      type === CommandTriggerType.Use
    ) {
      hero = HasType(this.when, CommandTriggerWhen.Battle)
        ? (args[0] as BattleCharacter).character
        : (args[0] as Character)
    } else if (
      HasType(when, CommandTriggerWhen.Common) &&
      type === CommandTriggerType.Use
    ) {
      hero = globalGameData.hero
    }

    if (hero) {
      const value = range(this.values)
      const previouseValue = hero[this.property as PropertyType]
      if (
        ['power', 'resilience', 'speed', 'maxHP', 'maxMP', 'HP', 'MP'].indexOf(
          this.property
        ) >= 0
      ) {
        hero[this.property as PropertyType] = Calacute(
          this.calculateType,
          hero[this.property as PropertyType],
          value
        )
      }
      return `${this.property}增加了${
        hero[this.property as PropertyType] - previouseValue
      }`
    }

    return ''
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
