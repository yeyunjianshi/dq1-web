import ExecuteCommand from './Command'

export default class EscapeExecuteCommand extends ExecuteCommand {
  async execute() {
    if (Math.random() * 100 > 50) {
      this.data.setEscape(true)
      this.ui.showMessage(`${this.data.hero.name} 逃跑成功`)
      return
    }
    this.ui.showMessage(`${this.data.hero.name} 逃跑失败`)
  }
}
