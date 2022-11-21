import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { GlobalBattleInfo } from '../../engine/engine'
import { globalGameData } from '../asset/gameData'
import AttackExectuteCommand from './command/AttackExecuteCommand'
import BattleCharacter from './BattleCharacter'
import BattleData, {
  BattleFinishStatus,
  BattleInfo,
  GenerateBattleInfo,
} from './BattleData'
import BattleUI from './BattleUI'
import ExecuteCommand, {
  BattleCommand,
  BattleCharacterCommand,
  DefaultBattleCommand,
} from './command/Command'
import MagicExecuteCommand from './command/MagicExecuteCommand'
import ItemExecuteCommand from './command/ItemExecuteCommand'
import { setBattleFinishStatus } from '../../engine/components/events/EventExector'

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
    await this.ui.showMessage(`${this.data.enemy.character.name}出现了`)
  }

  private _selectCommandToExecuteCommand: Map<
    BattleCharacterCommand,
    typeof ExecuteCommand
  > = new Map([
    [BattleCharacterCommand.Attack, AttackExectuteCommand],
    [BattleCharacterCommand.Item, ItemExecuteCommand],
    [BattleCharacterCommand.Magic, MagicExecuteCommand],
  ])

  private async battleExecuting() {
    // 选择指令
    const heroCommand = this.data.hero.isSleep
      ? DefaultBattleCommand
      : await this.ui.selectCommand()
    const enemyCommand = this.data.hero.isSleep
      ? DefaultBattleCommand
      : this.enemySelectCommand()

    const commands = [
      { ...heroCommand, character: this.data.hero },
      { ...enemyCommand, character: this.data.enemy },
    ]
    commands.sort((a, b) => b.character.speed - a.character.speed)

    // 执行指令
    for (let i = 0; i < commands.length; i++) {
      if (this.data.isFinish) return
      if (commands[i].character.isSleep) {
        await this.ui.showMessage(`${commands[i].character.name}睡着了`)
        continue
      }
      const command = commands[i]

      if (this._selectCommandToExecuteCommand.has(command.command)) {
        const executeCommandClass = this._selectCommandToExecuteCommand.get(
          command.command
        )!
        const executeCommand = new executeCommandClass(
          this.ui,
          this.data,
          command.commandArgs,
          command.character
        )
        await executeCommand.execute()
      }
    }

    // 每回合后计算一下buff的持续时间
    if (!this.data.isFinish) {
      const showTexts = this.data.buffersTurnDown()
      for (let i = 0; i < showTexts.length; i++) {
        if (showTexts[i].length > 0)
          await this.ui.showMessage(showTexts[i], false, 800)
      }
    }
  }

  private async battleEnd() {
    console.log(this.data.isVictory ? '胜利了' : '战败了')
    setBattleFinishStatus(
      this.data.isEscape
        ? BattleFinishStatus.Escape
        : this.data.isVictory
        ? BattleFinishStatus.Victory
        : this.data.isFailed
        ? BattleFinishStatus.Faield
        : BattleFinishStatus.Event
    )
  }

  private enemySelectCommand(): BattleCommand {
    return {
      command: BattleCharacterCommand.Attack,
      commandArgs: [],
    }
  }

  private get ui() {
    return this._ui!
  }

  private get data() {
    return this._data!
  }
}
