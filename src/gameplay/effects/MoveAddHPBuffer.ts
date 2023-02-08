import { globalGameData } from '../asset/gameData'
import { CommandTriggerWhen, CommandTriggerType, Buffer } from './buffer'

export default class MoveAddHPBuffer implements Buffer {
  owner = 0
  turns = 0
  currentStep = 0

  constructor(public step: number, public healHP = 1) {}

  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (
      when === CommandTriggerWhen.Common &&
      type === CommandTriggerType.Move
    ) {
      if (++this.currentStep >= this.step) {
        this.currentStep = 0
        globalGameData.hero.HP += this.healHP
      }
    }
    return ''
  }

  clone(): Buffer {
    return new MoveAddHPBuffer(this.step)
  }
}
