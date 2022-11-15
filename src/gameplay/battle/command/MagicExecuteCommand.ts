import { CommandTriggerType, CommandTriggerWhen } from '../../effects/buffer'
import BattleCharacter from '../BattleCharacter'
import BattleData from '../BattleData'
import BattleUI from '../BattleUI'
import Magic, { MagicType } from '../../asset/magic'
import ExecuteCommand from './Command'

export default class MagicExecuteCommand extends ExecuteCommand {
  protected magic: Magic

  constructor(
    ui: BattleUI,
    data: BattleData,
    args: unknown[],
    character: BattleCharacter,
    targetIsEnemy = true
  ) {
    super(ui, data, args, character, targetIsEnemy)
    this.magic = args[0] as Magic
  }

  async execute() {
    if (this.character.isSealingMagic) {
      await this.ui.showMessage(
        `${this.character.name}咒语力量被封印了\n使用${this.magic.name}失败`
      )
      return
    }
    if (this.character.MP < this.magic.cost) {
      await this.ui.showMessage(
        `${this.character.name}没有足够的MP\n使用${this.magic.name}失败`
      )
      return
    }

    await this.ui.showMessage(
      `${this.character.name}使用了${this.magic.name}`,
      false
    )
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
