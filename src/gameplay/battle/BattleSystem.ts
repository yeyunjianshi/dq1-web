import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { GlobalBattleInfo } from '../../engine/engine'
import { globalGameData } from '../asset/gameData'
import AttackExectuteCommand from './AttackExecuteCommand'
import BattleCharacter from './BattleCharacter'
import BattleData, { BattleInfo, GenerateBattleInfo } from './BattleData'
import BattleUI from './BattleUI'
import ExecuteCommand, {
  BattleCommand,
  BattleCharacterCommand,
} from './Command'

@GameplayComponent
export default class BattleSystem extends Component {
  private _ui?: BattleUI
  private _data?: BattleData

  start(): void {
    this.init()
    this.execute()
  }

  init() {
    this.engine.setVariable(GlobalBattleInfo, GenerateBattleInfo(1))
    const info = this.engine.getVariable(GlobalBattleInfo) as BattleInfo
    this._data = new BattleData(
      info,
      new BattleCharacter(globalGameData.hero),
      info.enemy
    )
    this._ui = new BattleUI(this.root, this.data.enemy.name)
  }

  private async execute() {
    await this.battleStart()
    while (!this.data.isFinish) {
      await this.battleExecuting()
    }
    await this.battleEnd()
  }

  private async battleStart() {
    await this.ui.showMessage(`${this.data.enemy.character.name} 出现了`)
  }

  private _selectCommandToExecuteCommand: Map<
    BattleCharacterCommand,
    typeof ExecuteCommand
  > = new Map([[BattleCharacterCommand.Attack, AttackExectuteCommand]])

  private async battleExecuting() {
    // select command
    const heroCommand = await this.ui.selectCommand()
    // execute command
    const enemyCommand = this.enemySelectCommand()
    const commands = [
      { ...heroCommand, battleCharacter: this.data.hero },
      { ...enemyCommand, battleCharacter: this.data.enemy },
    ]
    commands.sort((a, b) => b.battleCharacter.speed - a.battleCharacter.speed)

    for (let i = 0; i < commands.length; i++) {
      if (this.data.isFinish) break

      const command = commands[i]
      if (this._selectCommandToExecuteCommand.has(command.command)) {
        const executeCommandClass = this._selectCommandToExecuteCommand.get(
          command.command
        )!
        const executeCommand = new executeCommandClass(
          this.ui,
          this.data,
          command.battleCharacter
        )
        await executeCommand.execute()
      }
    }
  }

  private async battleEnd() {
    console.log(this.data.isVictory ? '胜利了' : '战败了')
  }

  private enemySelectCommand(): BattleCommand {
    return {
      command: BattleCharacterCommand.Attack,
      commandArgs: [],
    }
  }

  private async executingCommand(command: BattleCommand) {}

  private get ui() {
    return this._ui!
  }

  private get data() {
    return this._data!
  }
}
