import Magic, { MagicData, parseMagic } from './magic'
import { CommandTriggerType, CommandTriggerWhen } from '../effects/buffer'
import Inventory, {
  DefaultNoneItemSlot,
  DefaultRemoveEquipItemSlot,
  ItemSlot,
} from '../inventory/inventory'
import Item, { ItemEquipmentType, ItemType } from '../inventory/item'
import Character from './character'

const DefaultInitGameCharacter = {
  id: 1,
  lv: 1,
  inventory: [1, 102, 201, 202, 301, 302, 401, 402, 501],
  magics: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
}

const gameAllCharacters: Map<number, Character> = new Map()

export function SetCharacters(characters: Character[]) {
  characters.forEach((ch) => {
    gameAllCharacters.set(ch.id, ch)
  })
}

export function GetCharacter(id: number): Character {
  const ch = gameAllCharacters.get(id)
  if (!ch) throw new Error('未找到id等于${id}的Character')
  return ch
}

const gameAllItems: Map<number, Item> = new Map()

export function SetItems(items: Item[]) {
  items.forEach((item) => {
    gameAllItems.set(item.id, item)
  })
}

export function GetItem(id: number) {
  return gameAllItems.get(id)!
}

const gameShopItems: Map<number, Item[]> = new Map()

export function SetShopItems(shopData: { id: number; data: number[] }[]) {
  shopData.forEach(({ id, data }) => {
    const items = data.map((itemId) => GetItem(itemId))
    gameShopItems.set(id, items)
  })
}

export function GetShopItems(id: number) {
  return gameShopItems.get(id)!
}

export type EnemyData = Partial<Character> & {
  id: number
  exp: number
  gold: number
  AI: string
}

const gameAllEneies: Map<number, EnemyData> = new Map()
export function SetEneies(enimies: EnemyData[]) {
  enimies.forEach((enemy) => {
    gameAllEneies.set(enemy.id, enemy)
  })
}

export function GetEnemyData(id: number): EnemyData {
  const enemy = gameAllEneies.get(id)
  if (!enemy) throw new Error('未找到id等于${id}的Enemy')
  return enemy
}

const gameAllMagics: Map<number, Magic> = new Map()
export function SetMagics(magicData: MagicData[]) {
  magicData.map((data) => {
    gameAllMagics.set(data.id, parseMagic(data))
  })
}

export function GetMagic(id: number): Magic {
  const magic = gameAllMagics.get(id)
  if (!magic) throw new Error('未找到id等于${id}的Magic')
  return magic
}

export enum InputType {
  None,
  Move,
  Menu,
  Battle,
  Message,
}

export class GameData {
  teamCharactes: Character[] = []
  npcCharacters: { roldId: number }[] = []
  inputType: InputType = InputType.Move
  inventory = new Inventory()
  events: Set<string> = new Set()

  startGame() {
    const initCharacter = GetCharacter(DefaultInitGameCharacter.id).clone()
    this.teamCharactes = [initCharacter]
    DefaultInitGameCharacter.inventory.forEach((itemId) =>
      this.inventory.addItem(itemId)
    )
    initCharacter.magics = DefaultInitGameCharacter.magics.map((id) =>
      GetMagic(id)
    )
  }

  init() {
    this.startGame()
  }

  heroEquip(equipment: ItemSlot, type: ItemEquipmentType = ItemType.All) {
    if (
      equipment !== DefaultRemoveEquipItemSlot &&
      this.inventory.getItemSlot(equipment.id) === DefaultNoneItemSlot
    )
      return

    if (equipment === DefaultRemoveEquipItemSlot) {
      equipment = DefaultNoneItemSlot
    }
    this.hero.equip(equipment, type)
    this.inventory.sort()
  }

  inventoryUseItem(
    id: number,
    when: CommandTriggerWhen,
    type: CommandTriggerType
  ) {
    const useItemSlot = this.inventory.getItemSlot(id)
    if (useItemSlot === DefaultNoneItemSlot) return
    useItemSlot.item.useEffects.forEach((effect) => {
      effect.execute(when, type, this.hero)
    })
    if (useItemSlot.item.useCount > 0) {
      this.inventory.removeSlotId(id)
    }
  }

  inventoryRemoveItemSlotById(id: number) {
    this.inventory.removeSlotId(id)
    this.hero.removeEquipment(id)
  }

  finishEvent(id: string) {
    this.events.add(id)
  }

  hasEvent(id: string) {
    return this.events.has(id)
  }

  public get hero() {
    return this.teamCharactes[0]!
  }
}

export const globalGameData = new GameData()
