import { ChangeWhen, Command, CommandCalacuteType } from '../effects/buffer'
import UsePeropertyEffect from '../effects/UsePropertyEffect'

export enum ItemType {
  Weapon = 0x000001,
  Body = 0x000010,
  Shield = 0x000100,
  Accessories = 0x001000,
  Item = 0x010000,
  ImportItem = 0x100000,
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
    if (command === 'u') {
      if (args.length >= 2) {
        const when = ChangeWhen(args[0])
        if (when > 0) {
          if (args[1] === 'light') {
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
}
