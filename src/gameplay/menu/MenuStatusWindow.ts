import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import TextComponent from '../../engine/components/TextComponent'
import { globalGameData } from '../asset/gameData'

@GameplayComponent
export default class MenuStatusWindow extends BaseWindow {
  private _cacheTexts: Map<string, TextComponent> = new Map()

  start() {
    this.refresh()
  }

  refresh() {
    const hero = globalGameData.hero
    this.setText('characterName', hero.name)
    this.setText('characterHP', hero.HP)
    this.setText('characterMP', hero.MP)
    this.setText('characterLV', hero.lv)
    this.setText('characterWeapon', hero.weapon.name)
    this.setText('characterBody', hero.body.name)
    this.setText('characterShield', hero.shield.name)
    this.setText('characterAccessories', hero.accessories.name)
    this.setText('characterPower', hero.power)
    this.setText('characterSpeed', hero.speed)
    this.setText('characterResilience', hero.resilience)
    this.setText('characterMaxHP', hero.maxHP)
    this.setText('characterMaxMP', hero.maxMP)
    this.setText('characterAttack', hero.attack)
    this.setText('characterDefend', hero.defend)
    this.setText('characterExp', hero.exp)
  }

  private setText(componentName: string, text: string | number) {
    let textComponent = this._cacheTexts.get(componentName)
    if (!textComponent) {
      textComponent = this.root.getComponentInChildByName(
        componentName,
        TextComponent
      ) as TextComponent
      if (textComponent) this._cacheTexts.set(componentName, textComponent)
    }
    textComponent?.setText(`${text}`)
  }

  show(init = true) {
    super.show(init)
    this.root.active = true
    this.refresh()
  }
}
