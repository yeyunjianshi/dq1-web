import BackHomeEffect from './BackHomeEffect'
import DamageEffect from './DamageEffect'
import GoToEntraceEffect from './GoToEntraceEffect'
import LightCaveEffect from './LightCaveEffect'
import { SleepBufferMaker, SealingMagicBufferMaker } from './MarkerBuffer'
import { MarkerBufferEffect } from './MarkerBufferEffect'
import NotMeetEnemyEffect from './NotMeetEnemyEffect'
import UsePeropertyEffect from './UsePropertyEffect'

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
  turnsDownEveryTurn?: () => string
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

export function parseUseEffect(
  effectString: string,
  owner: { id: number; useEffects: Command[] }
) {
  if (effectString.trim().length === 0) return

  const effectCommands = effectString.split(';').filter((s) => s.length > 0)
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
                if (args.length >= 3) {
                  const [_, value] = parseNumberValue(args[2])
                  return new LightCaveEffect(value[0], value[1])
                }
                break
              case 'home': // 回城
                return new BackHomeEffect()
              case 'entrance': // 洞穴回到入口处
                return new GoToEntraceEffect()
              case 'notMeetEnemy': // 不遇敌
                if (args.length >= 3) {
                  const [_, value] = parseNumberValue(args[2])
                  return new NotMeetEnemyEffect(value[0])
                }
                return
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
