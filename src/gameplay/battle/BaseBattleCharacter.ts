import Character from '../asset/character'
import { Buffer } from '../effects/buffer'
import {
  MarkerBuffer,
  SealingMagicBufferMaker,
  SleepBufferMaker,
} from '../effects/MarkerBuffer'
import BattleData from './BattleData'
import BattleUI from './BattleUI'
import { BattleCommand } from './command/Command'

interface BattleInterface {
  getCommand(data: BattleData, ui: BattleUI): Promise<BattleCommand>
}

export default abstract class BattleCharacter implements BattleInterface {
  private _buffers: Buffer[] = []
  isHero: boolean
  spriteWidth = 60
  spriteHeight = 60
  pivotOffset: Vector2 = [0, 0]

  constructor(public character: Character, isHero = true) {
    this._buffers = [...character.buffers]
    this.isHero = isHero
  }

  get lv() {
    return this.character.lv
  }

  get name() {
    return this.character.name
  }

  get maxHP() {
    return this.character.maxHP
  }

  get maxMP() {
    return this.character.maxMP
  }

  set HP(val: number) {
    this.character.HP = val
  }

  get HP() {
    return this.character.HP
  }

  set MP(val: number) {
    this.character.MP = val
  }

  get MP() {
    return this.character.MP
  }

  get attack() {
    return this.character.attack
  }

  get defend() {
    return this.character.defend
  }

  get speed() {
    return this.character.speed
  }

  get isSleep() {
    return this._buffers.some(
      (b) => b instanceof MarkerBuffer && b.marker === SleepBufferMaker
    )
  }

  get isSealingMagic() {
    return this._buffers.some(
      (b) => b instanceof MarkerBuffer && b.marker === SealingMagicBufferMaker
    )
  }

  get magics() {
    return this.character.magicsInBattle
  }

  get buffers() {
    return this._buffers
  }

  addBuffer(b: Buffer) {
    this._buffers.push(b)
  }

  calcBufferEveryTurn() {
    const showText = this._buffers
      .map(
        (buff) => (buff.turnsDownEveryTurn && buff.turnsDownEveryTurn()) || ''
      )
      .filter((s) => s.trim().length > 0)
      .join('\n')
    this._buffers = this._buffers.filter((b) => b.turns !== 0)
    return showText.length > 0 ? this.name + showText : ''
  }

  abstract getCommand(data: BattleData, ui: BattleUI): Promise<BattleCommand>
}
