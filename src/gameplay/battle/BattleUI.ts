import BaseWindow from '../../engine/components/BaseWindow'
import ListComponent, {
  TextAdapter,
} from '../../engine/components/ListComponent'
import ScrollTextComponent from '../../engine/components/ScrollTextComponent'
import TextComponent from '../../engine/components/TextComponent'
import GameObject from '../../engine/gameObject'
import { delay, nextFrame } from '../../engine/time'
import { globalGameData } from '../asset/gameData'
import BattleData from './BattleData'
import { BattleCharacterCommand, BattleCommand } from './Command'

export default class BattleUI extends BaseWindow {
  private _commandsWindow: ListComponent
  private _nameText: TextComponent
  private _enemyNameText: TextComponent
  private _lvText: TextComponent
  private _hpText: TextComponent
  private _mpText: TextComponent
  private _messageText: ScrollTextComponent

  constructor(root: GameObject, enemyName: string) {
    super(root)

    this._nameText = root.getComponentInChildByName(
      'characterNameText',
      TextComponent
    ) as TextComponent
    this._hpText = root.getComponentInChildByName(
      'characterHPText',
      TextComponent
    ) as TextComponent
    this._mpText = root.getComponentInChildByName(
      'characterMPText',
      TextComponent
    ) as TextComponent
    this._lvText = root.getComponentInChildByName(
      'characterLVText',
      TextComponent
    ) as TextComponent
    this._commandsWindow = root.getComponentInChildByName(
      'commandsWindow',
      ListComponent
    ) as ListComponent
    this._messageText = root.getComponentInChildByName(
      'messageWindow',
      ScrollTextComponent
    ) as ScrollTextComponent
    this._enemyNameText = root.getComponentInChildByName(
      'enemyInfoText',
      TextComponent
    ) as TextComponent

    this.init(enemyName)
  }

  init(enemyName: string) {
    // init hero status
    this._nameText.setText(`${this.hero.name}`)
    this._enemyNameText.setText(`${enemyName}`)
    this.refreshHero()

    // init command window
    this._commandsWindow.setAdapter(
      new TextAdapter(
        ['攻击', '咒文', '道具', '逃跑'].map((text) => ({ text }))
      )
    )
    this._commandsWindow.addSelectListener((_, pos) => {
      if (this._commandSelecting) {
        this._characterCommand = pos
        this._commandSelecting = false
      }
    })

    this._commandsWindow.enable = false
  }

  refreshHero() {
    this._hpText.setText(`${this.hero.HP}`)
    this._mpText.setText(`${this.hero.MP}`)
    this._lvText.setText(`${this.hero.lv}`)
  }

  private _commandSelecting = false
  private _characterCommand: BattleCharacterCommand =
    BattleCharacterCommand.Attack

  async selectCommand(): Promise<BattleCommand> {
    this._commandSelecting = true
    this._commandsWindow.enable = true
    while (this._commandSelecting) {
      await nextFrame()
    }
    this._commandsWindow.enable = false
    this._commandSelecting = false

    return Promise.resolve({
      command: this._characterCommand,
      commandArgs: [],
    })
  }

  async showMessage(text: string, delayTime = 500) {
    this._messageText.root.parent.active = true
    this._messageText.showText(text)
    if (delayTime > 0) await delay(delayTime)
    this._messageText.root.parent.active = false
  }

  update() {
    this._commandsWindow.update()
  }

  get hero() {
    return globalGameData.hero
  }
}
