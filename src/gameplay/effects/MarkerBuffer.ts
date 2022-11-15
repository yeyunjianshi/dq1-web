import { Buffer, CommandTriggerType, CommandTriggerWhen } from './buffer'

export const SleepBufferMaker = Symbol('Sleep')
export const SealingMagicBufferMaker = Symbol('SealingMagic')

export class MarkerBuffer implements Buffer {
  owner = 0

  constructor(public marker: symbol, public turns: number) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {}

  turnsDownEveryTurn() {
    if (this.turns >= 0) {
      this.turns = Math.max(0, this.turns - 1)
      if (this.turns === 0) {
        if (this.marker === SleepBufferMaker) {
          return '苏醒过来了'
        } else if (this.marker === SealingMagicBufferMaker) {
          return '封咒效果消失了'
        }
      }
    }
    return ''
  }

  clone(init = true) {
    return new MarkerBuffer(this.marker, this.turns)
  }
}
