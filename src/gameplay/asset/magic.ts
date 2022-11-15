import { range } from '../../engine/math'
import {
  ChangeWhen,
  Command,
  CommandTriggerType,
  parseNumberValue,
} from '../effects/buffer'
import DamageEffect from '../effects/DamageEffect'
import {
  SealingMagicBufferMaker,
  SleepBufferMaker,
} from '../effects/MarkerBuffer'
import { MarkerBufferEffect } from '../effects/MarkerBufferEffect'
import UsePeropertyEffect from '../effects/UsePropertyEffect'

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
}

export function parseMagic(data: MagicData) {
  const magic = Object.assign(new Magic(), data) as Magic
  magic.isCanCommonUse = ((data.useType ?? 0) & 0b01) > 0
  magic.isCanBattleUse = ((data.useType ?? 0) & 0b10) > 0
  if (data.effect) parseUseEffect(data.effect, magic)
  return magic
}

export function parseUseEffect(
  effectString: string,
  owner: { id: number; useEffects: Command[] }
) {
  if (effectString.trim().length === 0) return

  const effectCommands = effectString.split(';').filter((s) => s.length > 0)
  console.log(owner.id + '   ' + effectString)
  owner.useEffects = effectCommands
    .map((effectCommand) => {
      const [command, ...args] = effectCommand.split(':')
      if (command === 'u') {
        if (args.length >= 2) {
          const when = ChangeWhen(args[0])
          if (when > 0) {
            let effect: Command | null = null
            switch (args[1]) {
              case 'HP':
                if (args.length >= 3) {
                  const [calc, value] = parseNumberValue(args[2])
                  return new UsePeropertyEffect(when, 'HP', calc, value)
                }
                break
              case 'light': // 洞穴照亮
                break
              case 'move': // 移动buff
                break
              case 'damage': // 伤害
                if (args.length >= 3) {
                  const [_, value] = parseNumberValue(args[2])
                  effect = new DamageEffect(
                    when,
                    CommandTriggerType.MagicDamage,
                    value
                  )
                  return effect
                }
                break
              case 'marker':
                if (
                  args.length >= 4 &&
                  ['sleep', 'sealingMagic'].indexOf(args[2]) >= 0
                ) {
                  return new MarkerBufferEffect(
                    args[2] === 'sleep'
                      ? SleepBufferMaker
                      : SealingMagicBufferMaker,
                    parseNumberValue(args[3])[1]
                  )
                }
                break
              case 'buff': // buff
                break
              default:
                break
            }
          }
        }
      }
      return null
    })
    .filter((e) => e !== null) as Command[]
}

export type MagicData = {
  id: number
  name: string
  cost: number
  type: MagicType
  useType: number
  effect?: string
  targetIsEnemy?: boolean
}
