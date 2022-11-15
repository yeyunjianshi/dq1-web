import { ItemSlot } from '../../inventory/inventory'
import BattleCharacter from '../BattleCharacter'
import BattleData from '../BattleData'
import BattleUI from '../BattleUI'
import ExecuteCommand from './Command'

export default class ItemExecuteCommand extends ExecuteCommand {
  protected itemSlot: ItemSlot

  constructor(
    ui: BattleUI,
    data: BattleData,
    args: unknown[],
    character: BattleCharacter,
    targetIsEnemy = true
  ) {
    super(ui, data, args, character, targetIsEnemy)
    this.itemSlot = args[0] as ItemSlot
  }

  async execute() {
    await this.ui.showMessage(
      `${this.character.name}使用了${this.itemSlot.item.name}`
    )
  }
}
