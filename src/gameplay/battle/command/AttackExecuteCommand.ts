import ExecuteCommand from './Command'

export default class AttackExectuteCommand extends ExecuteCommand {
  async execute() {
    await this.ui.showMessage(`${this.character.name}攻击`, false)
    // attack effect
    const damage = this.character.attack - this.character.defend
    this.target.character.HP -= damage
    // target hurt
    await this.ui.showMessage(`${this.target.name}受到${damage}伤害`, true)
  }
}
