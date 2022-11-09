import {
  Command,
  CommandTriggerWhen,
  CommandTriggerType,
  CommandCalacuteType,
} from './buffer'

export class MagicHurtValueBuffer
  implements Command, Cloneable<MagicHurtValueBuffer>
{
  value = 0
  calcType: CommandCalacuteType = CommandCalacuteType.Add

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    if (
      when === CommandTriggerWhen.Battle &&
      type === CommandTriggerType.MagicHurt
    ) {
      const calcType = args[0] as CommandCalacuteType
      const damage = args[1] as number

      switch (calcType) {
        case CommandCalacuteType.Add:
          return damage + this.value
        case CommandCalacuteType.Mul:
          return damage * this.value
      }

      return damage
    }
  }

  clone(init = true) {
    return new MagicHurtValueBuffer()
  }
}
