import Character from '../asset/character'
import BattleCharacter from './BattleCharacter'
import BattleData from './BattleData'
import BattleUI from './BattleUI'

export enum BattleCharacterCommand {
  Attack = 0,
  Magic,
  Item,
  Escape,
}

export type BattleCommand = {
  character?: BattleCharacter
  command: BattleCharacterCommand
  commandArgs: any[]
}

export default class ExecuteCommand {
  constructor(
    protected ui: BattleUI,
    protected data: BattleData,
    protected character: BattleCharacter,
    protected targetIsEnemy = true
  ) {}

  protected get target() {
    return (this.targetIsEnemy && this.character === this.data.hero) ||
      (!this.targetIsEnemy && this.character === this.data.enemy)
      ? this.data.enemy
      : this.data.hero
  }

  async execute() {}
}
