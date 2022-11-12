export enum CommandTriggerWhen {
  None = 0b00,
  Common = 0b01,
  Battle = 0b10,
  All = 0b11,
}

export enum CommandTriggerType {
  Use,
  Move,
  MagicHurt,
}

export interface Command {
  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ): any
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Buffer extends Command, Cloneable<Buffer> {
  owner: number
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
