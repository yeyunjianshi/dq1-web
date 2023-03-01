import { delay } from '@engine/time'
import { Audios } from '@gameplay/audio/AudioConfig'
import ExecuteCommand from './Command'

export default class AttackExectuteCommand extends ExecuteCommand {
  async execute() {
    await this.ui.showMessage(`${this.character.name}攻击`, false, -1)

    await this.attackEffect()

    const damage = this.character.attack - this.character.defend
    this.target.character.HP -= damage
    // target hurt
    await this.ui.showMessage(`${this.target.name}受到${damage}伤害`, true)
  }

  private async attackEffect() {
    // attack effect
    this.engine.audios.playSE(Audios.Attack)
    await delay(300)

    if (this.character.isHero) {
      this.engine.audios.playSE(Audios.Damage3)
      await this.ui.playEffectAnimation('attack')
      await this.ui.monsterFlashing(400, 2)
    }
  }
}
