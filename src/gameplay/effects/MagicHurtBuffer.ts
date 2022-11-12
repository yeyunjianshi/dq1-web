import {
  CommandTriggerWhen,
  CommandTriggerType,
  CommandCalacuteType,
  Buffer,
} from './buffer'

export class MagicHurtValueBuffer implements Buffer {
  owner = 0
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
