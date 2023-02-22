import Magic, { MagicData, parseMagic } from './magic'
import { CommandTriggerType, CommandTriggerWhen } from '../effects/buffer'
import Inventory, {
  DefaultNoneItemSlot,
  DefaultRemoveEquipItemSlot,
  ItemSlot,
} from '../inventory/inventory'
import Item, { ItemEquipmentType, ItemType } from '../inventory/item'
import Character from './character'
import TalkChinese from '../../data/i18n/talk_chinese.json'
import { generateEventId } from '@gameplay/events/EventExector'

const DefaultInitGameCharacter = import.meta.env.DEV
  ? {
      id: 1,
      lv: 1,
      inventory: [1, 2, 4, 206, 207, 507, 401, 506, 503, 504],
      magics: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
      npcs: [2],
      events: [
        generateEventId('Q660'),
        generateEventId('Q666'),
        // generateEventId('Q888'),
      ],
      isMeetEnemty: false,
      isLightInCave: false,
    }
  : {
      id: 1,
      lv: 1,
      inventory: [],
      magics: [],
      npcs: [],
      events: [generateEventId('Q660')],
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

export const talkQuests = TalkChinese as {
  key: string
  name: string
  text: string
}[]

export function TalkGetAll(id: string) {
  if (id.length === 0) return []

  return talkQuests.filter((v) => v.key.startsWith(id))
}

export function TalkGet(id: string) {
  if (id.length === 0) return []
  return talkQuests.find((v) => v.key.startsWith(id))
}

export enum InputType {
  None,
  Move,
  Menu,
  Battle,
  Message,
  Task,
  Title,
  Transition,
}

export class GameData {
  teamCharactes: Character[] = []
  npcCharacters: { roleId: number }[] = []
  inventory = new Inventory()
  events: Set<string> = new Set()
  inputType: InputType = InputType.Move
  lightRadius = 0
  lightTime = 0
  notMeetEnemyStep = 0
  gameplayTime = 0
  isMeetEnemy = true
  isLightInCave = false
  entraceTag?: string

  init() {
    const initCharacter = GetCharacter(DefaultInitGameCharacter.id).clone()
    this.teamCharactes = [initCharacter]
    this.npcCharacters = DefaultInitGameCharacter.npcs.map((roleId) => ({
      roleId,
    }))
    this.inventory = new Inventory()
    DefaultInitGameCharacter.inventory.forEach((itemId) =>
      this.inventory.addItem(itemId)
    )
    initCharacter.magics = DefaultInitGameCharacter.magics.map((id) =>
      GetMagic(id)
    )
    this.events = new Set(DefaultInitGameCharacter.events)
    this.inputType = InputType.Move
    this.lightRadius =
      this.lightTime =
      this.notMeetEnemyStep =
      this.gameplayTime =
        0
    this.isMeetEnemy = DefaultInitGameCharacter.isMeetEnemty ?? true
    this.isLightInCave = DefaultInitGameCharacter.isLightInCave ?? false
  }

  startGame() {
    this.init()
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

  light(radius: number, time: number) {
    this.lightRadius = radius
    this.lightTime = time
  }

  finishEvent(id: string) {
    this.events.add(id)
  }

  hasEvent(id: string) {
    return this.events.has(id)
  }

  removeEvent(id: string) {
    return this.events.delete(id)
  }

  reinitWhenChangeScene(refreshLight = true) {
    if (refreshLight) {
      this.lightRadius = 0
      this.lightTime = -1
    }
  }

  get hero() {
    return this.teamCharactes[0]!
  }

  get teamMoves(): { roleId: number }[] {
    return this.teamCharactes
      .map((c) => ({
        roleId: c.roleId,
      }))
      .concat(this.npcCharacters)
  }
}

export function setGlobalGameData(gameData: GameData) {
  globalGameData = gameData
}

export let globalGameData = new GameData()
