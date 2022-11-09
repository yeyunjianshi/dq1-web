import { clamp } from '../../engine/math'
import Item from '../inventory/item'
import { GetItem } from './gameData'
import { GlobalEventEmit, GlobalEventType } from './globaEvents'

export default class Character {
  id = 0
  maxLv = 30
  name = ''
  roleId = 0
  lv = 1
  maxHP = 15
  maxMP = 0
  _hp = 15
  _mp = 0

  power = 7
  speed = 2
  resilience = 5
  exp = 0
  _gold = 120

  weaponId = 0
  bodyId = 0
  shieldId = 0
  accessoriesId = 0

  lvsAbility?: Partial<Character>[]

  set HP(delta: number) {
    this._hp += delta
    if (this._hp >= this.maxHP) this._hp = this.maxHP
    else if (this._hp < 0) this._hp = 0
    GlobalEventEmit(GlobalEventType.ChracterStatusChanged, this)
  }

  get HP() {
    return this._hp
  }

  set MP(delta: number) {
    this._mp += delta
    if (this._mp >= this.maxMP) this._mp = this.maxMP
    else if (this._mp < 0) this._mp = 0
    GlobalEventEmit(GlobalEventType.ChracterStatusChanged, this)
  }

  get MP() {
    return this._mp
  }

  get isDead() {
    return this._hp <= 0
  }

  get weapon(): Item {
    return GetItem(this.weaponId)
  }

  get body(): Item {
    return GetItem(this.bodyId)
  }

  get shield(): Item {
    return GetItem(this.shieldId)
  }

  get accessories(): Item {
    return GetItem(this.accessoriesId)
  }

  get attack() {
    return (
      this.power +
      this.weapon.ability.attack +
      this.body.ability.attack +
      this.shield.ability.attack +
      this.accessories.ability.attack
    )
  }

  get defend() {
    return (
      this.resilience +
      this.weapon.ability.defend +
      this.body.ability.defend +
      this.shield.ability.defend +
      this.accessories.ability.defend
    )
  }

  addGold(val: number) {
    this.gold += val
  }

  set gold(val: number) {
    this._gold = clamp(val, 0, 999999)
    GlobalEventEmit(GlobalEventType.GoldChanged, this)
  }

  get gold() {
    return this._gold
  }

  _currentExp = 0

  addExp(exp: number) {
    this._currentExp += exp
    while (
      this.judgeLvUp() &&
      this.lvsAbility &&
      this.lvsAbility.length > this.lv
    ) {
      this.lvUp()
    }
  }

  judgeLvUp() {
    return this.lv < this.maxLv && this._currentExp >= this.exp
  }

  lvUp(): Partial<Character> | undefined {
    if (this.lv >= this.maxLv) return undefined

    this.lv++
    let ability = undefined

    if (this.lvsAbility && this.lvsAbility.length > this.lv) {
      ability = this.lvsAbility[this.lv]
      for (const prop in ability) {
        if (
          ['maxHP', 'maxMP', 'power', 'speed', 'resilience'].indexOf(prop) >= 0
        ) {
          this[prop as LVUpCharacterProperties] += ability[
            prop as LVUpCharacterProperties
          ] as number
        }
      }
    }
    GlobalEventEmit(GlobalEventType.ChracterStatusChanged, this)
    return ability
  }
}

type LVUpCharacterProperties =
  | 'maxHP'
  | 'maxMP'
  | 'power'
  | 'speed'
  | 'resilience'

export type CharacterData = Partial<Character>

export function parseCharacter(data: CharacterData): Character {
  return Object.assign(new Character(), data)
}
