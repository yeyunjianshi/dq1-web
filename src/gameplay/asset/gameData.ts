import Item from '../inventory/item'
import Character from './character'
import Enemy from './enemy'

const DefaultInitGameCharacter = {
  id: 1,
  lv: 1,
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
}

export class GameData {
  teamCharactes: Character[] = []
  npcCharacters: { roldId: number }[] = []
  inputType: InputType = InputType.Move

  startGame() {
    const initCharacter = GetCharacter(DefaultInitGameCharacter.id)
    this.teamCharactes = [initCharacter]
  }

  init() {
    this.startGame()
  }

  public get hero() {
    return this.teamCharactes[0]!
  }
}

export const globalGameData = new GameData()
