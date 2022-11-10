import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import TextComponent from '../../engine/components/TextComponent'
import { globalGameData } from '../asset/gameData'
import { GlobalEventType, GlobalEventAddListener } from '../asset/globaEvents'

@GameplayComponent
export default class CommonStatusWindow extends BaseWindow {
  private _nameText?: TextComponent
  private _hpText?: TextComponent
  private _mpText?: TextComponent
  private _lvText?: TextComponent

  start() {
    this._nameText = this.root.getComponentInChildByName(
      'characterName',
      TextComponent
    ) as TextComponent
    this._hpText = this.root.getComponentInChildByName(
      'characterHP',
      TextComponent
    ) as TextComponent
    this._mpText = this.root.getComponentInChildByName(
      'characterMP',
      TextComponent
    ) as TextComponent
    this._lvText = this.root.getComponentInChildByName(
      'characterLV',
      TextComponent
    ) as TextComponent

    this.refresh()

    GlobalEventAddListener(GlobalEventType.ChracterStatusChanged, () => {
      this.refresh()
    })
  }

  refresh() {
    const hero = globalGameData.hero
    this._nameText!.setText(hero.name)
    this._hpText!.setText(`${hero.HP}`)
    this._mpText!.setText(`${hero.MP}`)
    this._lvText!.setText(`${hero.lv}`)
  }
}
