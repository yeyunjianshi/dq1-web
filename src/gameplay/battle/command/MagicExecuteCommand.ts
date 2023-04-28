import { CommandTriggerType, CommandTriggerWhen } from '../../effects/buffer'
import BattleCharacter from '../BaseBattleCharacter'
import BattleData from '../BattleData'
import BattleUI from '../BattleUI'
import Magic, { MagicType } from '../../asset/magic'
import ExecuteCommand from './Command'
import Engine from '@engine/engine'
import { Audios } from '@gameplay/audio/AudioConfig'
import { delay } from '@engine/time'

export default class MagicExecuteCommand extends ExecuteCommand {
  protected magic: Magic

  constructor(
    engine: Engine,
    ui: BattleUI,
    data: BattleData,
    args: unknown[],
    character: BattleCharacter,
    targetIsEnemy = true
  ) {
    super(engine, ui, data, args, character, targetIsEnemy)
    this.magic = args[0] as Magic
  }

  async execute() {
    if (this.character.isSealingMagic) {
      await this.ui.showMessage(
        `${this.character.name} 咒语力量被封印了\n使用${this.magic.name}失败`
      )
      return
    }
    if (this.character.MP < this.magic.cost) {
      await this.ui.showMessage(
        `${this.character.name} 没有足够的MP\n使用${this.magic.name}失败`
      )
      return
    }

    await this.ui.showMessage(
      `${this.character.name} 使用了${this.magic.name}`,
      false,
      -1
    )

    this.character.MP -= this.magic.cost
    this.engine.audios.playSE(Audios.Magic)
    await delay(800)

    const type =
      this.magic.type === MagicType.Heal
        ? CommandTriggerType.Use
        : this.magic.type === MagicType.Damage
        ? CommandTriggerType.MagicDamage
        : CommandTriggerType.MagicFire
    const showText = this.magic.useEffects
      .map((effect) => {
        return effect.execute(
          CommandTriggerWhen.Battle,
          type,
          this.character,
          this.target
        )
      })
      .join('\n')
    await this.ui.showMessage(showText, true, 800)
  }
}
