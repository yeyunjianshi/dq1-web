import {
  CommandTriggerWhen,
  CommandTriggerType,
  CommandCalacuteType,
  Buffer,
} from './buffer'

export class ValueBuffer implements Buffer {
  owner = 0

  constructor(
    public value: number,
    public calcType: CommandCalacuteType,
    public triggerType: CommandTriggerType,
    public targetIsSelf = true, // true为攻击类buff, false为受击类buff
    public turns = -1
  ) {}

  execute(
    when: CommandTriggerWhen,
    type: CommandTriggerType,
    ...args: unknown[]
  ) {
    const damage = args[1] as number
    if (when === CommandTriggerWhen.Battle && type === this.triggerType) {
      switch (this.calcType) {
        case CommandCalacuteType.Add:
          return damage + this.value
        case CommandCalacuteType.Mul:
          return damage * this.value
      }
    }
    return damage
  }

  clone(init = true) {
    return Object.assign(
      new ValueBuffer(
        this.value,
        this.calcType,
        this.triggerType,
        this.targetIsSelf
      )
    )
  }
}
