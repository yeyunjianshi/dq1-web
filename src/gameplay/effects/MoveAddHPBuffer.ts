import Character from '../asset/character'
import { CommandTriggerWhen, CommandTriggerType, Buffer } from './buffer'

export default class MoveAddHPBuffer implements Buffer {
  owner = 0
  step = 4
  currentStep = 0

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ): any {
    if (
      when === CommandTriggerWhen.Common &&
      type === CommandTriggerType.Move
    ) {
      const hero = args[0] as Character
      if (++this.currentStep >= this.step) {
        this.currentStep = 0
        hero.HP += 1
      }
    }
  }

  clone(init = false): MoveAddHPBuffer {
    return Object.assign(new MoveAddHPBuffer(), {
      ...this,
      currentStep: init ? 0 : this.currentStep,
    })
  }
}
