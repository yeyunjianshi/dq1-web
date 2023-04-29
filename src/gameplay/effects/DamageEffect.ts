import { Audios } from '@gameplay/audio/AudioConfig'
import { range } from '../../engine/math'
import BattleCharacter from '../battle/BaseBattleCharacter'
import { Command, CommandTriggerType, CommandTriggerWhen } from './buffer'
import { ValueBuffer } from './ValueBuffer'
import { audio } from '@gameplay/events/EventExector'

export default class DamageEffect implements Command, Cloneable<DamageEffect> {
  constructor(
    public when: CommandTriggerWhen,
    public type: CommandTriggerType,
    public values: number[]
  ) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    if ((when & this.when) > 0 && type === this.type) {
      const character = args[0] as BattleCharacter
      const targetCharacter = args[1] as BattleCharacter

      let damage = range(this.values)
      character.buffers
        .filter((b) => b instanceof ValueBuffer && b.targetIsSelf)
        .forEach((buffer) => {
          damage = buffer.execute(when, type, damage)
        })
      targetCharacter.buffers
        .filter((b) => b instanceof ValueBuffer && !b.targetIsSelf)
        .forEach((buffer) => {
          damage = buffer.execute(when, type, damage)
        })

      audio().playSE(Audios.Damage3)
      targetCharacter.HP -= damage
      return `${targetCharacter.name} 受到了 ${damage} 点伤害`
    }
    return ''
  }

  clone() {
    return new DamageEffect(this.when, this.type, this.values)
  }
}
