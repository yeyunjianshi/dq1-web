import { clamp } from '../../engine/math'
import Magic from './magic'
import {
  Buffer,
  CommandTriggerType,
  CommandTriggerWhen,
} from '../effects/buffer'
import { DefaultNoneItemSlot, ItemSlot } from '../inventory/inventory'
import { HasType, ItemEquipmentType, ItemType } from '../inventory/item'
import { GetCharacter, GetMagic, globalGameData } from './gameData'
import { GlobalEventEmit, GlobalEventType } from './globaEvents'
import ImmunotoxicityBuffer from '@gameplay/effects/ImmunotoxicityBuffer'

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
  _gold = 120
  exp = 0

  weaponId = 0
  bodyId = 0
  shieldId = 0
  accessoriesId = 0

  lvsAbility: Partial<Character>[] = []
  buffers: Buffer[] = []
  magics: Magic[] = []
  magicsId?: number[]

  get magicsInCommon() {
    return this.magics.filter((m) => m.isCanCommonUse)
  }

  get magicsInBattle() {
    return this.magics.filter((m) => m.isCanBattleUse)
  }

  set HP(val: number) {
    this._hp = val
    if (this._hp >= this.maxHP) this._hp = this.maxHP
    else if (this._hp < 0) this._hp = 0
    GlobalEventEmit(GlobalEventType.ChracterStatusChanged, this)
  }

  get HP() {
    return this._hp
  }

  set MP(delta: number) {
    this._mp = delta
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

  get weapon() {
    return globalGameData.inventory.getItemSlot(this.weaponId)
  }

  get body() {
    return globalGameData.inventory.getItemSlot(this.bodyId)
  }

  get shield() {
    return globalGameData.inventory.getItemSlot(this.shieldId)
  }

  get accessories() {
    return globalGameData.inventory.getItemSlot(this.accessoriesId)
  }

  get attack() {
    return (
      this.power +
      this.weapon.item.ability.attack +
      this.body.item.ability.attack +
      this.shield.item.ability.attack +
      this.accessories.item.ability.attack
    )
  }

  get defend() {
    return (
      this.resilience +
      this.weapon.item.ability.defend +
      this.body.item.ability.defend +
      this.shield.item.ability.defend +
      this.accessories.item.ability.defend
    )
  }

  // 免疫中毒
  get isImmunotoxicity(): boolean {
    return !!this.buffers.find((b) => b instanceof ImmunotoxicityBuffer)
  }

  equip(equipment: ItemSlot, type: ItemEquipmentType = ItemType.All) {
    type = equipment.item.type & type
    if ((type as number) === 0) return

    let preItemSlot = DefaultNoneItemSlot
    switch (type) {
      case ItemType.Weapon:
        preItemSlot = this.weapon
        this.weaponId = equipment.id
        break
      case ItemType.Body:
        preItemSlot = this.body
        this.bodyId = equipment.id
        break
      case ItemType.Shield:
        preItemSlot = this.shield
        this.shieldId = equipment.id
        break
      case ItemType.Accessories:
        preItemSlot = this.accessories
        this.accessoriesId = equipment.id
        break
    }
    if (preItemSlot !== DefaultNoneItemSlot) {
      preItemSlot.isEquip = false
      this.buffers = this.buffers.filter((b) => b.owner !== preItemSlot.id)
    }
    if (equipment !== DefaultNoneItemSlot) {
      equipment.isEquip = true
      this.buffers.push(
        ...equipment.item.buffers.map((b) => {
          const buff = b.clone()
          buff.owner = equipment.id
          return buff
        })
      )
      console.log(this.buffers)
    }
    return preItemSlot
  }

  tryEquipment(equipment: ItemSlot, type: ItemType = ItemType.All) {
    type = equipment.item.type & type

    const property = (p: 'attack' | 'defend') =>
      (HasType(type, ItemType.Weapon) ? equipment.item : this.weapon.item)
        .ability[p] +
      (HasType(type, ItemType.Body) ? equipment.item : this.body.item).ability[
        p
      ] +
      (HasType(type, ItemType.Shield) ? equipment.item : this.shield.item)
        .ability[p] +
      (HasType(type, ItemType.Accessories)
        ? equipment.item
        : this.accessories.item
      ).ability[p]

    return {
      attack: this.power + property('attack'),
      defend: this.resilience + property('defend'),
    }
  }

  removeEquipment(id: number) {
    if (this.weaponId === id) this.weaponId = 0
    if (this.bodyId === id) this.weaponId = 0
    if (this.shieldId === id) this.shieldId = 0
    if (this.accessoriesId === id) this.accessoriesId = 0
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

  get nextExp() {
    if (this.lv >= this.maxLv) return 0

    const ability = this.lvsAbility!.find((val) => val.lv === this.lv + 1)
    return (ability?.exp ?? this.exp) - this.exp
  }

  set nextExp(val: number) {}

  addExp(exp: number) {
    this.exp = Math.min(this.exp + exp, 65535)
  }

  judgeLvUp() {
    return this.lv < this.maxLv && this.exp >= this.nextLvExp
  }

  get nextLvExp() {
    const ability = this.lvsAbility.find((val) => val.lv === this.lv + 1)
    return ability?.exp ?? 0
  }

  lvUp(): Partial<Character> | undefined {
    if (!this.judgeLvUp() || this.lv >= this.maxLv) return

    this.lv++

    const ability = this.lvsAbility.find((val) => val.lv === this.lv)
    if (ability) {
      for (const prop in ability) {
        if (
          ['maxHP', 'maxMP', 'power', 'speed', 'resilience'].indexOf(prop) >= 0
        ) {
          this[prop as LVUpCharacterProperties] += ability[
            prop as LVUpCharacterProperties
          ] as number
        }
      }
      if (ability.magicsId?.length) {
        this.magics.push(...ability.magicsId.map((v) => GetMagic(v)))
      }
    }

    GlobalEventEmit(GlobalEventType.ChracterStatusChanged, this)
    return ability
  }

  triggerMoveBuffers() {
    this.buffers.forEach((b) =>
      b.execute(CommandTriggerWhen.Common, CommandTriggerType.Move)
    )
  }

  clone() {
    return Object.assign(new Character(), { ...this })
  }

  toSaveData(): SaveCharacterData {
    return {
      id: this.id,
      roleId: this.roleId,
      lv: this.lv,
      maxHP: this.maxHP,
      maxMP: this.maxMP,
      _hp: this._hp,
      _mp: this._mp,
      power: this.power,
      speed: this.speed,
      resilience: this.resilience,
      _gold: this.gold,
      exp: this.exp,
      weaponId: this.weaponId,
      bodyId: this.bodyId,
      shieldId: this.shieldId,
      accessoriesId: this.accessoriesId,
      magicsId: this.magics.map((magic) => magic.id),
    }
  }
}

export type LVUpCharacterProperties =
  | 'maxHP'
  | 'maxMP'
  | 'power'
  | 'speed'
  | 'resilience'

export type CharacterData = Partial<Character>
export type SaveCharacterData = CharacterData

export function parseCharacter(data: CharacterData): Character {
  return Object.assign(new Character(), data)
}

export function parseCharacterFromSaveData(saveData: SaveCharacterData) {
  const character = Object.assign(
    new Character(),
    GetCharacter(saveData.id!).clone(),
    saveData
  ) as Character
  character.magics = saveData.magicsId?.map((id) => GetMagic(id)) ?? []
  character.equip(character.weapon, ItemType.Weapon)
  character.equip(character.body, ItemType.Body)
  character.equip(character.shield, ItemType.Shield)
  character.equip(character.accessories, ItemType.Accessories)
  return character
}
