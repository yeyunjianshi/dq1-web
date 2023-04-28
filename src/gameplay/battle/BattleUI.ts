import BaseWindow from '@engine/components/BaseWindow'
import { Animation } from '@engine/animations/animation'
import ListComponent, { TextAdapter } from '@engine/components/ListComponent'
import ScrollTextComponent from '@engine/components/ScrollTextComponent'
import TextComponent from '@engine/components/TextComponent'
import GameObject from '@engine/gameObject'
import { delay, nextFrame, waitUtil } from '@engine/time'
import PropertyAnimationComponent from '@engine/components/PropertyAnimationComponent'
import { globalGameData } from '../asset/gameData'
import { ItemSlot } from '../inventory/inventory'
import { BattleCharacterCommand, BattleCommand } from './command/Command'
import Magic from '../asset/magic'
import {
  GlobalEventRegisterListener,
  GlobalEventType,
} from '../asset/globaEvents'
import BattleData from './BattleData'
import Cursor from '@engine/components/Cursor'
import { getAnimation } from './BattleAnimationData'

export default class BattleUI extends BaseWindow {
  private _commandsWindow: ListComponent
  private _itemsWindow: ListComponent
  private _nameText: TextComponent
  private _enemyNameText: TextComponent
  private _lvText: TextComponent
  private _hpText: TextComponent
  private _mpText: TextComponent
  private _messageText: ScrollTextComponent
  private _enemyGameObejct: GameObject
  private _removeStatusListener?: () => void
  private _data: BattleData
  private _monsterAnim: PropertyAnimationComponent
  private _effectAnim: PropertyAnimationComponent
  private _cursor: Cursor

  constructor(root: GameObject, data: BattleData) {
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
    this._itemsWindow = root.getComponentInChildByName(
      'itemMenuWindow',
      ListComponent
    ) as ListComponent
    this._messageText = root.getComponentInChildByName(
      'messageWindow',
      ScrollTextComponent
    ) as ScrollTextComponent
    this._cursor = this.root.getComponentInChildren(Cursor) as Cursor
    this._enemyNameText = root.getComponentInChildByName(
      'enemyInfoText',
      TextComponent
    ) as TextComponent

    this._effectAnim = root.getComponentInChildByName(
      'effectAnim',
      PropertyAnimationComponent
    ) as PropertyAnimationComponent

    this._enemyGameObejct = root.getGameObjectInChildren('enemy')!
    this._monsterAnim = this._enemyGameObejct.getComponent(
      PropertyAnimationComponent
    ) as PropertyAnimationComponent

    this._data = data

    this.init(data)
  }

  init(data: BattleData) {
    // init enemy sprite
    this._enemyGameObejct.background.spriteWidth = data.info.monsterSprite.width
    this._enemyGameObejct.background.spriteHeight =
      data.info.monsterSprite.height
    this._enemyGameObejct.background.pivotOffset =
      data.info.monsterSprite.pivotOffset

    // init hero status
    this._nameText.setText(`${this.hero.name}`)
    this._enemyNameText.setText(`${data.enemy.name}`)

    this.refreshHero()

    this._removeStatusListener = GlobalEventRegisterListener(
      GlobalEventType.ChracterStatusChanged,
      () => {
        this.refreshHero()
      }
    )

    // this.playEffectAnimation('attack2')

    // init command window
    this._commandsWindow.setAdapter(
      new TextAdapter(
        ['攻击', '咒文', '道具', '逃跑'].map((text) => ({ text }))
      )
    )
    this._commandsWindow.addSelectListener((_, pos) => {
      if (this._commandSelecting) {
        this._characterCommand = pos
        if (
          this._characterCommand === BattleCharacterCommand.Item ||
          this._characterCommand === BattleCharacterCommand.Magic
        ) {
          this.refreshItems()
          nextFrame().then(() => {
            this.changeSelectWindowShow(false)
          })
        } else {
          this._commandSelecting = false
        }
      }
    })

    this._itemsWindow.setAdapter(new TextAdapter([]))
    this._itemsWindow.addSelectListener((_, pos) => {
      this._commandArgs = [this._items[pos]]
      this._commandSelecting = false
    })
    this._itemsWindow.addCancelListener(() => {
      this.changeSelectWindowShow(true)
    })

    this._itemsWindow.root.active = false
    this._commandsWindow.enable = false
  }

  refreshHero() {
    this._hpText.setText(`${this.hero.HP}`)
    this._mpText.setText(`${this.hero.MP}`)
    this._lvText.setText(`${this.hero.lv}`)
  }

  refreshItems() {
    if (this._characterCommand === BattleCharacterCommand.Item) {
      const slots = globalGameData.inventory
        .all()
        .filter((slot) => slot.item.isCanBattleUse)

      this._itemsWindow.adapter<TextAdapter>()!.setData(
        slots.map((slot) => ({
          text: slot.item.name,
        }))
      )
      this._items = slots
    } else if (this._characterCommand === BattleCharacterCommand.Magic) {
      const magics = this.hero.magics
      this._itemsWindow.adapter<TextAdapter>()!.setData(
        magics.map((magic) => ({
          text: magic.name,
        }))
      )
      this._items = magics
    }
  }

  private _commandSelecting = false
  private _commandArgs: unknown[] = []
  private _characterCommand: BattleCharacterCommand =
    BattleCharacterCommand.Attack
  private _items = [] as (ItemSlot | Magic)[]

  async selectCommand(): Promise<BattleCommand> {
    this._commandSelecting = true

    this.changeSelectWindowShow(true)
    this._commandsWindow.setCursorIndex(0)
    while (this._commandSelecting) {
      await nextFrame()
    }
    this._itemsWindow.root.active = false
    this._commandsWindow.enable = false
    this._commandSelecting = false

    return Promise.resolve({
      command: this._characterCommand,
      commandArgs: this._commandArgs,
    })
  }

  async showMessage(text: string, append = false, delayTime = 800) {
    this._messageText.root.parent.active = true
    if (!append) this._messageText.showText(text)
    else this._messageText.appendText(text)
    if (delayTime > 0) {
      await delay(delayTime)
      this._messageText.root.parent.active = false
    }
  }

  async scrollMessage(text: string, clear = false, afterHide = false) {
    this._messageText.root.parent.active = true
    if (clear) this._messageText.clearText()

    await this._messageText.showTextScroll(text, '')

    this._cursor.setStatus('Hover')
    await this.InputConfirmOrCancel()
    this._cursor!.setStatus('Unselect')

    if (afterHide) this._messageText.root.parent.active = false
  }

  get hero() {
    return this._data.hero
  }

  changeSelectWindowShow(command: boolean) {
    this._itemsWindow.root.active = !command
    this._commandsWindow.enable = command
    if (!command) {
      this._itemsWindow.setCursorIndex(0)
    }
  }

  interceptCancel(): boolean {
    if (
      this._characterCommand === BattleCharacterCommand.Item ||
      this._characterCommand === BattleCharacterCommand.Magic
    ) {
      this.changeSelectWindowShow(true)
      return true
    }
    return false
  }

  destroy() {
    this._removeStatusListener && this._removeStatusListener()
  }

  async monsterFlashing(duration: number, times: number) {
    const animation = new Animation({
      name: `battleFadingAnimationFlashing`,
      auto: true,
      duration: duration,
      times: times,
      frameCount: 60,
      keys: new Map([
        [
          'backgroundAlpha',
          [
            { frame: 0, value: 1 },
            { frame: 30, value: 0 },
            { frame: 60, value: 1 },
          ],
        ],
      ]),
    })
    this._monsterAnim.setAnimation(animation)
    await waitUtil(
      () => animation.isEnd,
      duration * times * 2,
      this.engine.time
    )
  }

  async playEffectAnimation(name: string | Animation) {
    const animation = typeof name === 'string' ? getAnimation(name) : name
    if (!animation) return

    this._effectAnim.setAnimation(animation)
    this._effectAnim.root.active = true
    this._effectAnim.replay(true)
    await waitUtil(() => animation.isEnd, Infinity, this.engine.time)
    this._effectAnim.root.active = false
  }

  victory() {
    this._enemyGameObejct.active = false
  }
}
