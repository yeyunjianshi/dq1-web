import { ChangeWhen, Command, CommandCalacuteType } from '../effects/buffer'
import UsePeropertyEffect from '../effects/UsePropertyEffect'

export enum ItemType {
  Weapon = 0b000001,
  Body = 0b000010,
  Shield = 0b000100,
  Accessories = 0b001000,
  Item = 0b010000,
  ImportItem = 0b100000,
  Equipment = 0b001111,
  AllItem = 0b110000,
  All = 0b111111,
}

export type ItemEquipmentType =
  | ItemType.Weapon
  | ItemType.Body
  | ItemType.Shield
  | ItemType.Accessories
  | ItemType.All

export function HasType(type: ItemType, filterType: ItemType) {
  return (type & filterType) > 0
}

export default class Item {
  id = 0
  name = ''
  type: ItemType = ItemType.Item
  price = 0
  sellPrice = 0
  useCount = 1
  isCanCommonUse = false
  isCanBattleUse = false
  isCanDiscard = true
  useEffects: Command[] = []
  targetIsEnemy = true

  get isCanEquip(): boolean {
    return (
      (this.type &
        (ItemType.Weapon |
          ItemType.Body |
          ItemType.Shield |
          ItemType.Accessories)) >
      0
    )
  }

  get isCanSell() {
    return this.sellPrice >= 0
  }

  ability: { attack: number; defend: number } = { attack: 0, defend: 0 }

  get equipAttack() {
    return this.isCanEquip ? 0 : this.ability.attack
  }

  get equipDefend() {
    return this.isCanEquip ? 0 : this.ability.defend
  }

  get isItem() {
    return HasType(this.type, ItemType.Item)
  }
  get isWeapon() {
    return HasType(this.type, ItemType.Weapon)
  }
  get isBody() {
    return HasType(this.type, ItemType.Body)
  }
  get isShield() {
    return HasType(this.type, ItemType.Shield)
  }
  get isAccessories() {
    return HasType(this.type, ItemType.Accessories)
  }
  get isEquipment() {
    return HasType(this.type, ItemType.Equipment)
  }
  get isAllItem() {
    return HasType(this.type, ItemType.AllItem)
  }
}

export function parseItem(data: ItemData): Item {
  const item = new Item()
  item.id = data.id
  item.name = data.name
  item.type = data.type
  item.price = data.price
  item.sellPrice = data.sellPrice ?? data.price >> 1
  item.isCanDiscard =
    typeof data.isCanDiscard === 'undefined' ? true : data.isCanDiscard
  item.isCanCommonUse = ((data.canUse ?? 0) & 0b01) > 0
  item.isCanBattleUse = ((data.canUse ?? 0) & 0b10) > 0
  item.useCount = typeof data.useCount === 'number' ? data.useCount : 1
  if (data.effect && data.effect.length > 0)
    parseEffect(data.effect ?? '', item)
  return item
}

export function parseNumberValue(
  value: string
): [CommandCalacuteType, number[]] {
  const sign = value.startsWith('-') ? -1 : 1
  if (value.startsWith('-') || value.startsWith('+')) {
    value = value.slice(1, value.length)
  }
  const ret = []
  let type = CommandCalacuteType.Add
  const nums = value.split('-')
  for (let i = 0; i < Math.min(nums.length, 2); i++) {
    if (nums[i].endsWith('%')) {
      const delta = parseInt(nums[i].slice(0, -1), 10) / 100
      ret.push(1 + sign * delta)
      type = CommandCalacuteType.Mul
    } else {
      const delta = parseInt(nums[i])
      ret.push(sign * delta)
    }
  }
  return [type, ret]
}

export function parseEffect(effectString: string, item: Item) {
  const effectCommands = effectString.split(';').filter((s) => s.length > 0)
  console.log(item.id + '   ' + effectString)
  effectCommands.map((effectCommand) => {
    const [command, ...args] = effectCommand.split(':')
    if (command === 'u') {
      if (args.length >= 2) {
        const when = ChangeWhen(args[0])
        if (when > 0) {
          if (args[1] === 'light') {
            return
          } else if (args[1] === 'move') {
            return
          } else {
            item.useEffects.push(
              new UsePeropertyEffect(
                when,
                args[1],
                ...parseNumberValue(args[2])
              )
            )
          }
        }
      }
      return
    } else if (command === 'e') {
      if (args.length >= 2) {
        if (args[0] === 'attack') item.ability.attack = parseInt(args[1], 10)
        else if (args[0] === 'defend')
          item.ability.defend = parseInt(args[1], 10)
        else if (args[0] === 'buffer') {
          return
        }
      }
    }
  })
}

export type ItemData = {
  id: number
  name: string
  type: number
  price: number
  sellPrice?: number
  canUse?: number
  effect?: string
  useCount?: number
  isCanDiscard?: boolean
}
