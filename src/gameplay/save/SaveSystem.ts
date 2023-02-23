import storage from './Storage'
import {
  GameData,
  globalGameData,
  InputType,
  setGlobalGameData,
} from '../asset/gameData'
import {
  parseCharacterFromSaveData,
  SaveCharacterData,
} from '../asset/character'
import { timestampToTimeFormat } from '@engine/time'
import Inventory, { SaveItemSlot } from '@gameplay/inventory/inventory'

export interface SaveSceneData {
  sceneName: string
  position: Vector2
}

export class SaveData {
  teamCharactes: SaveCharacterData[] = []
  npcCharacters: { roleId: number }[] = []
  inventory: SaveItemSlot[] = []
  inputType: InputType = InputType.Move
  lightRadius = 0
  lightTime = 0
  notMeetEnemyStep = 0
  gameplayTime = 0
  isMeetEnemy = true
  isLightInCave = false
  entraceTag?: string
  eventData: string[] = []
  sceneData?: SaveSceneData

  toSlotText() {
    return {
      key: `LV ${this.hero.lv}`,
      value: timestampToTimeFormat(this.gameplayTime),
    }
  }

  get hero() {
    return this.teamCharactes[0]
  }
}

export function generateSaveData(sceneData: SaveSceneData): SaveData {
  const saveData = new SaveData()
  saveData.teamCharactes = globalGameData.teamCharactes.map((c) =>
    c.toSaveData()
  )
  saveData.npcCharacters = globalGameData.npcCharacters.map((v) => ({ ...v }))
  saveData.inventory = globalGameData.inventory.toSaveData()
  saveData.lightRadius = globalGameData.lightRadius
  saveData.lightTime = globalGameData.lightTime
  saveData.notMeetEnemyStep = globalGameData.notMeetEnemyStep
  saveData.gameplayTime = globalGameData.gameplayTime
  saveData.isMeetEnemy = globalGameData.isMeetEnemy
  saveData.isLightInCave = globalGameData.isLightInCave
  saveData.eventData = Array.from(globalGameData.events)
  saveData.entraceTag = globalGameData.entraceTag
  saveData.sceneData = sceneData

  return saveData
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
  return jsonData ? Object.assign(new SaveData(), jsonData) : null
}

export function loadSaveDataToGame(data: SaveData) {
  const gameData = new GameData()
  setGlobalGameData(gameData)

  gameData.inventory = Inventory.parseFromSaveData(data.inventory)
  gameData.teamCharactes = data.teamCharactes.map((c) =>
    parseCharacterFromSaveData(c)
  )
  gameData.npcCharacters = data.npcCharacters.map((v) => ({ ...v }))
  gameData.lightRadius = data.lightRadius
  gameData.lightTime = data.lightTime
  gameData.notMeetEnemyStep = data.notMeetEnemyStep
  gameData.gameplayTime = data.gameplayTime
  gameData.isMeetEnemy = data.isMeetEnemy
  gameData.isLightInCave = data.isLightInCave
  gameData.events = new Set(data.eventData)
  gameData.entraceTag = globalGameData.entraceTag
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
