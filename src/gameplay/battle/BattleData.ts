import { parseCharacter } from '../asset/character'
import { GetEnemyData } from '../asset/gameData'
import BattleCharacter from './BattleCharacter'

export enum BattleFinishStatus {
  Pending,
  Event,
  Escape,
  Victory,
  Faield,
}

export enum BattleEscapeMarker {
  None,
  Success,
  Failed,
}

export type BattleInfo = {
  enemy: BattleCharacter
  gold: number
  exp: number
  bgm?: string
  background?: string
  monsterSprite: {
    width: number
    height: number
    pivotOffset: Vector2
  }
}

export function GenerateBattleInfo(enemyId: number): BattleInfo {
  const enemyData = GetEnemyData(enemyId)
  enemyData.HP ??= enemyData.maxHP
  enemyData.MP ??= enemyData.maxMP
  const enemy = new BattleCharacter(parseCharacter(enemyData), false)
  return {
    enemy,
    gold: enemyData.gold,
    exp: enemyData.exp,
    monsterSprite: {
      width: enemyData.spriteWidth ?? 120,
      height: enemyData.spriteHeight ?? 120,
      pivotOffset: enemyData.spritePivotOffset,
    },
  }
}

export default class BattleData {
  escapeMarker: BattleEscapeMarker = BattleEscapeMarker.None

  constructor(
    public info: BattleInfo,
    public hero: BattleCharacter,
    public enemy: BattleCharacter
  ) {}

  get isVictory() {
    return this.enemy.character.isDead
  }

  get isFailed() {
    return this.hero.character.isDead
  }

  get isEscape() {
    return this.escapeMarker === BattleEscapeMarker.Success
  }

  get isFinish() {
    return (
      this.hero.character.isDead || this.enemy.character.isDead || this.isEscape
    )
  }

  setEscape(escape: boolean) {
    if (escape) this.escapeMarker = BattleEscapeMarker.Success
  }

  buffersTurnDown() {
    return [this.hero.calcBufferEveryTurn(), this.enemy.calcBufferEveryTurn()]
  }
}
