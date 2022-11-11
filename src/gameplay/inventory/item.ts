import { Command, CommandCalacuteType } from '../effects/buffer'

export enum ItemType {
  Weapon = 0b000001,
  Body = 0b000010,
  Shield = 0b000100,
  Accessories = 0b001000,
  Item = 0b010000,
  ImportItem = 0b100000,
  Equipment = 0b001111,
  All = 0b111111,
}

export type ItemEquipmentType =
  | ItemType.Weapon
  | ItemType.Body
  | ItemType.Shield
  | ItemType.Accessories

export function HasType(type: ItemType, filterType: ItemType) {
  return (type & filterType) > 0
}

export default class Item {
  id = 0
  name = ''
  type: ItemType = ItemType.Item
  price = 0
  sellPrice = 0
  isCanSell = true
  useCount = 1
  isCanCommonUse = false
  isCanBattleUse = false
  useEffects: Command[] = []

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

  ability: { attack: number; defend: number } = { attack: 0, defend: 0 }

  get equipAttack() {
    return this.isCanEquip ? 0 : this.ability.attack
  }

  get equipDefend() {
    return this.isCanEquip ? 0 : this.ability.defend
  }

  get isItem() {
    return (this.type & ItemType.Item) > 0
  }
  get isWeapon() {
    return (this.type & ItemType.Weapon) > 0
  }
  get isBody() {
    return (this.type & ItemType.Body) > 0
  }
  get isShield() {
    return (this.type & ItemType.Shield) > 0
  }
  get isAccessories() {
    return (this.type & ItemType.Accessories) > 0
  }
}

export function parseItem(data: ItemData): Item {
  const item = new Item()
  item.id = data.id
  item.name = data.name
  item.type = data.type
  item.price = data.price
  item.sellPrice = data.sellPrice ?? data.price >> 1
  item.isCanCommonUse = ((data.canUse ?? 0) & 0x01) > 0
  item.isCanBattleUse = ((data.canUse ?? 0) & 0x02) > 0
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
  effectCommands.map((effectCommand) => {
    const [command, ...args] = effectCommand.split(':')
    // if (command === 'u') {
    //   if (args.length >= 2) {
    //     const when = ChangeWhen(args[0])
    //     if (when > 0) {
    //       if (args[1] === 'light') {
    //         return
    //       } else {
    //         item.useEffects.push(
    //           new UsePeropertyEffect(
    //             when,
    //             args[1],
    //             ...parseNumberValue(args[2])
    //           )
    //         )
    //       }
    //     }
    //   }
    //   return
    // } else if (command === 'e') {
    if (command === 'e') {
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
}
