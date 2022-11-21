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
}

export function GenerateBattleInfo(enemyId: number): BattleInfo {
  const enemyData = GetEnemyData(enemyId)
  if (typeof enemyData.HP === 'undefined') enemyData.HP = enemyData.maxHP
  if (typeof enemyData.MP === 'undefined') enemyData.MP = enemyData.maxMP
  const enemy = new BattleCharacter(parseCharacter(enemyData))
  return { enemy, gold: enemyData.gold, exp: enemyData.exp }
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

  buffersTurnDown() {
    return [this.hero.calcBufferEveryTurn(), this.enemy.calcBufferEveryTurn()]
  }
}
