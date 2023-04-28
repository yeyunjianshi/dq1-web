import { delay } from '@engine/time'
import ExecuteCommand from './Command'

export default class NotDoExecuteCommand extends ExecuteCommand {
  async execute() {
    this.ui.showMessage(`${this.data.hero.name} 正在发呆`)
    await delay(1000)
  }
}
