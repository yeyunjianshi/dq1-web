import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import TextComponent from '../../engine/components/TextComponent'
import { globalGameData } from '../asset/gameData'
import { GlobalEventAddListener, GlobalEventType } from '../asset/globaEvents'

@GameplayComponent
export default class CommonGoldWindow extends Component {
  private _goldText?: TextComponent

  start() {
    this._goldText = this.root.getComponentInChildByName(
      'CharacterGold',
      TextComponent
    ) as TextComponent

    this.refresh()

    GlobalEventAddListener(GlobalEventType.GoldChanged, () => {
      this.refresh()
    })
  }

  refresh() {
    this._goldText?.setText(`${globalGameData.hero.gold}`)
  }
}
