import Engine from '@engine/engine'
import BattleCharacter from '../BattleCharacter'
import BattleData from '../BattleData'
import BattleUI from '../BattleUI'

export enum BattleCharacterCommand {
  Attack = 0,
  Magic,
  Item,
  Escape,
}

export type BattleCommand = {
  command: BattleCharacterCommand
  commandArgs: unknown[]
}
export const DefaultBattleCommand: BattleCommand = {
  command: BattleCharacterCommand.Attack,
  commandArgs: [],
}

export default class ExecuteCommand {
  constructor(
    protected engine: Engine,
    protected ui: BattleUI,
    protected data: BattleData,
    protected args: unknown[],
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
