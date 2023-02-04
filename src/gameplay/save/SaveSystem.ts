import storage from './Storage'
import { GameData, globalGameData } from '../asset/gameData'
import Character from '../asset/character'
import { timestampToTimeFormat } from '@engine/time'
import Inventory from '@gameplay/inventory/inventory'

export interface SaveSceneData {
  sceneName: string
  position: Vector2
}

export class SaveData {
  constructor(
    public data: GameData,
    public eventData: string[],
    public sceneData: SaveSceneData
  ) {}

  toSlotText() {
    return {
      key: `LV ${this.data.hero.lv}`,
      value: timestampToTimeFormat(this.data.gameplayTime),
    }
  }
}

export const DefaultMaxSlotNumber = 3
const SaveSlotPrefix = 'save_'
const getSlotName = (slotIndex: number) => `${SaveSlotPrefix}_${slotIndex}`

const serialize = (data: SaveData) => {
  return JSON.stringify(data)
}

const deserialize = (data: string | null) => {
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

export function generateSaveData(sceneData: SaveSceneData) {
  const eventData = Array.from(globalGameData.events)
  return new SaveData(globalGameData, eventData, sceneData)
}

export function save(slotIndex: number, data: SaveData): void {
  if (slotIndex < 0 && slotIndex >= 3) {
    throw new Error(`SaveSytem: SlotInde必须大于等于0小于3`)
  }
  storage.save(getSlotName(slotIndex), serialize(data))
}

export function load(slotIndex: number): SaveData | null {
  if (slotIndex < 0 && slotIndex >= 3) {
    throw new Error(`SaveSytem: SlotInde必须大于等于0小于3`)
  }
  const jsonData = deserialize(storage.read(getSlotName(slotIndex)))
  if (jsonData) {
    const sceneData = jsonData.sceneData
    const gameData = Object.assign(new GameData(), jsonData.data)
    gameData.events = new Set(jsonData.eventData)
    gameData.inventory = Object.assign(new Inventory(), gameData.inventory)
    gameData.teamCharactes = gameData.teamCharactes.map((v: any) =>
      Object.assign(new Character(), v)
    )
    return new SaveData(gameData, jsonData.eventData, sceneData)
  }
  return null
}

export function remove(slotIndex: number): SaveData | null {
  const removeSaveData = load(slotIndex)
  storage.remove(getSlotName(slotIndex))
  return removeSaveData
}

export function loadAll() {
  return Array.from({ length: DefaultMaxSlotNumber }).map((_, index) =>
    load(index)
  )
}
