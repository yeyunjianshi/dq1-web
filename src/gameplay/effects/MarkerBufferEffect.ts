import { range } from '../../engine/math'
import BattleCharacter from '../battle/BaseBattleCharacter'
import { Command, CommandTriggerType, CommandTriggerWhen } from './buffer'
import { MarkerBuffer, SleepBufferMaker } from './MarkerBuffer'

export class MarkerBufferEffect
  implements Command, Cloneable<MarkerBufferEffect>
{
  owner = 0

  constructor(public marker: symbol, public value: number[]) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    if (when === CommandTriggerWhen.Battle) {
      const success = true
      if (success) {
        const target = args[1] as BattleCharacter
        const previousBuffer = target.buffers.find(
          (b) => b instanceof MarkerBuffer && b.marker === this.marker
        )

        const turns = range(this.value)
        if (previousBuffer)
          previousBuffer.turns = Math.max(previousBuffer.turns, turns)
        else target.addBuffer(new MarkerBuffer(this.marker, turns))

        if (this.marker === SleepBufferMaker) {
          return `${target.name}睡着了`
        } else {
          return `${target.name}无法使用咒术了`
        }
      } else {
        return `但是失败了`
      }
    }
    return null
  }

  clone(init = true) {
    return new MarkerBufferEffect(this.marker, this.value)
  }
}
