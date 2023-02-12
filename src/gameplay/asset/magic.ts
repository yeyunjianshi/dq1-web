import {
  Command,
  CommandTriggerType,
  CommandTriggerWhen,
  parseUseEffect,
} from '../effects/buffer'

export enum MagicType {
  Common = 0,
  Heal,
  Damage,
  Fire,
  Buff,
}

export default class Magic {
  id = 0
  name = ''
  type = MagicType.Damage
  cost = 0
  useEffects: Command[] = []
  targetIsEnemy = true
  isCanCommonUse = false
  isCanBattleUse = false
  useCommonText?: string
  useBattleText?: string
  useCommonTime: 'before' | 'after' = 'before' // 使用时机是在窗口打开后，还是在窗口之前

  useInCommon() {
    return this.useEffects
      .map((effect) => {
        return effect.execute(CommandTriggerWhen.Common, CommandTriggerType.Use)
      })
      .filter((s) => s.trim().length > 0)
      .join('\n')
  }
}

export function parseMagic(data: MagicData) {
  const magic = Object.assign(new Magic(), data) as Magic
  magic.isCanCommonUse = ((data.useType ?? 0) & 0b01) > 0
  magic.isCanBattleUse = ((data.useType ?? 0) & 0b10) > 0
  if (data.effect) parseUseEffect(data.effect, magic)
  return magic
}

export type MagicData = {
  id: number
  name: string
  cost: number
  type: MagicType
  useType: number
  effect?: string
  targetIsEnemy?: boolean
  useCommonText?: string
  useBattleText?: string
  useCommonTime: 'before' | 'after'
}
