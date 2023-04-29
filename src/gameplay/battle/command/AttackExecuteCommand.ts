import { delay } from '@engine/time'
import { Audios } from '@gameplay/audio/AudioConfig'
import ExecuteCommand from './Command'

export default class AttackExectuteCommand extends ExecuteCommand {
  async execute() {
    await this.ui.showMessage(`${this.character.name} 攻击`, false, -1)

    await this.attackEffect()

    const damage = this.character.attack - this.target.defend
    this.target.character.HP -= damage
    // target hurt
    await this.ui.showMessage(`${this.target.name} 受到 ${damage} 伤害`, true)
  }

  private async attackEffect() {
    // attack effect
    this.engine.audios.playSE(Audios.Attack)
    await delay(300)

    this.engine.audios.playSE(
      this.target.isHero ? Audios.Damage2 : Audios.Damage3
    )
    if (this.character.isHero) {
      await this.ui.playEffectAnimation('attack2')
      await this.ui.monsterFlashing(400, 2)
    }
  }
}
