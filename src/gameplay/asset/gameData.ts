import { CommandTriggerType, CommandTriggerWhen } from '../effects/buffer'
import inventory from '../inventory/inventory'
import Inventory, {
  DefaultNoneItemSlot,
  DefaultRemoveEquipItemSlot,
  ItemSlot,
} from '../inventory/inventory'
import Item, { ItemEquipmentType, ItemType } from '../inventory/item'
import Character from './character'
import Enemy from './enemy'

const DefaultInitGameCharacter = {
  id: 1,
  lv: 1,
  inventory: [1, 101, 102, 201, 202, 301, 302, 401, 402, 501],
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

const gameAllEneies: Map<number, Enemy> = new Map()
export function SetEneies(enies: Enemy[]) {
  enies.forEach((enemy) => {
    gameAllEneies.set(enemy.id, enemy)
  })
}

export function GetEnemy(id: number): Enemy {
  const enemy = gameAllEneies.get(id)
  if (!enemy) throw new Error('未找到id等于${id}的Enemy')
  return enemy
}

export enum InputType {
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

  startGame() {
    const initCharacter = GetCharacter(DefaultInitGameCharacter.id)
    this.teamCharactes = [initCharacter]
    DefaultInitGameCharacter.inventory.forEach((itemId) =>
      this.inventory.addItem(itemId)
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

  public get hero() {
    return this.teamCharactes[0]!
  }
}

export const globalGameData = new GameData()
