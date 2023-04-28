import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import { GlobalBattleInfo } from '../../engine/engine'
import { GetMagic, globalGameData } from '../asset/gameData'
import AttackExectuteCommand from './command/AttackExecuteCommand'
import BattleCharacter from './BattleCharacter'
import BattleData, { BattleFinishStatus, BattleInfo } from './BattleData'
import BattleUI from './BattleUI'
import ExecuteCommand, {
  BattleCommand,
  BattleCharacterCommand,
  DefaultBattleCommand,
} from './command/Command'
import MagicExecuteCommand from './command/MagicExecuteCommand'
import ItemExecuteCommand from './command/ItemExecuteCommand'
import { setBattleFinishStatus } from '../events/EventExector'
import { Audios } from '@gameplay/audio/AudioConfig'
import { delay } from '@engine/time'
import { LVUpCharacterProperties } from '@gameplay/asset/character'
import { AssetLoader } from '@engine/resource'
import { init } from './BattleAnimationData'

@GameplayComponent
export default class BattleSystem extends Component {
  private _ui?: BattleUI
  private _data?: BattleData

  start(): void {
    this.init()
    this.execute()
  }

  init() {
    this.audios.playBGM('bgm/battle.mp3')
    const info = this.engine.getVariable(GlobalBattleInfo) as BattleInfo
    this._data = new BattleData(
      info,
      new BattleCharacter(globalGameData.hero),
      info.enemy
    )
    this._ui = new BattleUI(this.root, this._data)
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
    [
      BattleCharacterCommand.Attack,
      AttackExectuteCommand as typeof ExecuteCommand,
    ],
    [BattleCharacterCommand.Item, ItemExecuteCommand as typeof ExecuteCommand],
    [
      BattleCharacterCommand.Magic,
      MagicExecuteCommand as typeof ExecuteCommand,
    ],
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
          this.engine,
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

    await this.battleEndExecute()
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

  private async battleEndExecute() {
    if (this.data.isEscape) return

    if (this.data.isVictory) {
      this.ui.victory()

      this.engine.audios.pauseBGM()
      this.engine.audios.playSE(Audios.Victory)

      await this.ui.scrollMessage(
        `${this.data.enemy.name} 被打倒了\n获得 ${this.data.info.exp} 经验值\n获得 ${this.data.info.gold} 金钱`,
        true
      )

      const hero = globalGameData.hero
      hero.addGold(this.data.info.gold)
      hero.addExp(this.data.info.exp)

      while (hero.judgeLvUp()) {
        this.engine.audios.playSE(Audios.LvUp)

        const ability = hero.lvUp()!
        const messageText = [`${hero.name} 升到 ${hero.lv}级`]

        for (const prop of ['power', 'speed', 'resilience', 'maxHP', 'maxMP']) {
          if (Object.hasOwn(ability, prop)) {
            const value = ability[prop as LVUpCharacterProperties] as number
            if (value <= 0) continue
            messageText.push(
              `${this.engine.i18n.getTextValue(prop)} 提升了 ${value} 点`
            )
          }
        }
        if (ability.magicsId?.length) {
          messageText.push(
            `学会了 ${ability.magicsId.map((v) => GetMagic(v).name).join('\n')}`
          )
        }

        let times = 0
        while (messageText.length > 0) {
          await this.ui.scrollMessage(
            messageText.splice(0, Math.min(messageText.length, 4)).join('\n'),
            ++times == 1
          )
        }
      }
    } else if (this.data.isFailed) {
      this.engine.audios.playSE(Audios.Dead)
      await delay(6000)
    }
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

  parseData(assetLoader: AssetLoader) {
    assetLoader.addAssets(init(this.resource))
  }
}
