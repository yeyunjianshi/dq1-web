import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import TextComponent from '../../engine/components/TextComponent'
import { globalGameData } from '../asset/gameData'
import {
  GlobalEventRegisterListener,
  GlobalEventType,
} from '../asset/globaEvents'

@GameplayComponent
export default class CommonGoldWindow extends BaseWindow {
  private _goldText?: TextComponent

  start() {
    this._goldText = this.root.getComponentInChildByName(
      'CharacterGold',
      TextComponent
    ) as TextComponent

    this.refresh()

    GlobalEventRegisterListener(GlobalEventType.GoldChanged, () => {
      this.refresh()
    })
  }

  refresh() {
    this._goldText?.setText(`${globalGameData.hero.gold}`)
  }
}
