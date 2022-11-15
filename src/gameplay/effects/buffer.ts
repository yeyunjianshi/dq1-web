export enum CommandTriggerWhen {
  None = 0b00,
  Common = 0b01,
  Battle = 0b10,
  All = 0b11,
}

export enum CommandTriggerType {
  Use,
  Move,

  Attack,
  MagicDamage,
  MagicFire,
}

export interface Command {
  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ): any
}

export interface Buffer extends Command, Cloneable<Buffer> {
  owner: number
  turns: number
  turnsDownEveryTurn(): string
}

export enum CommandCalacuteType {
  Add,
  Mul,
}

export function Calacute(
  type: CommandCalacuteType,
  val: number,
  delta: number
) {
  if (type === CommandCalacuteType.Add) return val + delta
  return val * delta
}

export function ChangeWhen(when: string) {
  if (when === 'common') return CommandTriggerWhen.Common
  if (when === 'battle') return CommandTriggerWhen.Battle
  if (when === 'all') return CommandTriggerWhen.All
  return CommandTriggerWhen.None
}

export function parseNumberValue(
  value: string
): [CommandCalacuteType, number[]] {
  const sign = value.startsWith('-') ? -1 : 1
  if (value.startsWith('-') || value.startsWith('+')) {
    value = value.slice(1, value.length)
  }
  const ret = []
  let type = CommandCalacuteType.Add
  const nums = value.split('-')
  for (let i = 0; i < Math.min(nums.length, 2); i++) {
    if (nums[i].endsWith('%')) {
      const delta = parseInt(nums[i].slice(0, -1), 10) / 100
      ret.push(1 + sign * delta)
      type = CommandCalacuteType.Mul
    } else {
      const delta = parseInt(nums[i])
      ret.push(sign * delta)
    }
  }
  return [type, ret]
}
