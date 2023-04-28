import Character from '@gameplay/asset/character'
import BattleCharacter from './BaseBattleCharacter'
import BattleData from './BattleData'
import BattleUI from './BattleUI'
import { BattleCharacterCommand, DefaultBattleCommand } from './command/Command'
import { AICommandNode, GetMagic } from '@gameplay/asset/gameData'

export class HeroBattleCharacter extends BattleCharacter {
  async getCommand(_: BattleData, ui: BattleUI) {
    return this.isSleep ? DefaultBattleCommand : await ui.selectCommand()
  }
}

export class EnemyBattleCharacter extends BattleCharacter {
  AICommand: EnemyAICommand
  executingAICommand?: EnemyAICommand

  constructor(
    public character: Character,
    AICommand: EnemyAICommand,
    isHero = true
  ) {
    super(character, isHero)
    this.AICommand = AICommand
  }

  async getCommand() {
    if (this.isSleep) return DefaultBattleCommand

    let node = this.tryFindNextCommand()
    while (
      (node.isSelectType() || node.isSequenceType()) &&
      node.nodes.length > 0
    ) {
      if (node.isSequenceType()) node = node.nodes[0]
      else if (node.isSelectType()) {
        const sum = node.nodes.reduce(
          (sum, command) => sum + command.percentage,
          0
        )
        const randomValue = Math.floor(Math.random() * sum)
        node = node.nodes.reduce(
          (n, current) =>
            n.v < 0 ? n : { v: n.v - current.percentage, k: current },
          { v: randomValue, k: node.nodes[0] }
        ).k
      }
    }
    this.executingAICommand = node
    return this.parseAICommand()
  }

  tryFindNextCommand() {
    if (!this.executingAICommand) return this.AICommand

    let node: EnemyAICommand | undefined = this.executingAICommand
    while (node) {
      if (node.parentNode?.isSequenceType() && node.nextNode)
        return node.nextNode
      node = node.parentNode
    }
    return node || this.AICommand
  }

  parseAICommand() {
    if (this.executingAICommand) {
      if (this.executingAICommand.type === 'attack') {
        return {
          command: BattleCharacterCommand.Attack,
          commandArgs: [],
        }
      } else if (this.executingAICommand.type === 'magic') {
        const magic = GetMagic(parseInt(`${this.executingAICommand.value}`, 10))
        if (magic.cost <= this.MP) {
          return {
            command: BattleCharacterCommand.Magic,
            commandArgs: [magic],
          }
        } else {
          return {
            command: BattleCharacterCommand.Attack,
            commandArgs: [],
          }
        }
      }
    }
    return {
      command: BattleCharacterCommand.NotDo,
      commandArgs: [],
    }
  }
}

export class EnemyAICommand {
  type: string
  value: number | string = 0
  percentage = 100
  nodes: EnemyAICommand[] = []
  parentNode?: EnemyAICommand
  nextNode?: EnemyAICommand

  constructor(type: string, value: number | string = 0, percentage = 100) {
    this.type = type
    this.value = value
    this.percentage = percentage
  }

  isSequenceType() {
    return this.type === 'sequence'
  }

  isSelectType() {
    return this.type === 'select'
  }
}

export function parseAICommand({
  type,
  value,
  percentage,
  nodes = [],
}: AICommandNode) {
  const command = new EnemyAICommand(type, value, percentage)
  let pre: EnemyAICommand | undefined
  command.nodes = nodes.map((n) => {
    const c = parseAICommand(n)
    c.parentNode = command
    if (pre) pre.nextNode = c
    pre = c
    return c
  })
  return command
}
