export enum CommandTriggerWhen {
  None = 0x00,
  Common = 0x01,
  Battle = 0x10,
  All = 0x11,
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
