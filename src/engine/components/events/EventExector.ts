import Engine, { GlobalBattleInfo, GlobalWindowMarker } from '../../engine'
import { nextFrame } from '../../time'
import GlobalWindowComponent, {
  WindowMarker,
} from '../../../gameplay/menu/GlobalWindowComponent'
import { QuestEvent } from './QuestEvent'
import { globalGameData, InputType } from '../../../gameplay/asset/gameData'
import {
  BattleFinishStatus,
  GenerateBattleInfo,
} from '../../../gameplay/battle/BattleData'

const gameEvents = new Map<string, string>()

export function GetGameEventScript(eventId: string) {
  const script = gameEvents.get(eventId)
  if (!script) throw new Error(`GetGameEventScript Error: not found ${eventId}`)
  return script
}

export function AddGameEvent(key: string, val: string) {
  gameEvents.set(key, val)
}

export function SetGameEventScript(events: Record<string, string>) {
  for (const key in events) {
    gameEvents.set(key, events[key])
  }
}

enum EventStatus {
  Pending,
  Executing,
  Finish,
  Cancel,
}

let executingEngine: Engine | null = null
const eventQueue: QuestEvent[] = []
let executingEvent: QuestEvent | null = null
let executingEventStatus = EventStatus.Pending

export function setEventEngine(engine: Engine) {
  executingEngine = engine
}

export function generateEventId(id: string | number): string {
  return `event_${id}`
}

export function AddExecuteEvent(event: QuestEvent) {
  eventQueue.push(event)
  eventQueue.sort((a, b) => a.priority - b.priority)
}

export async function Execute(engine: Engine) {
  executingEngine = engine
  executingEventStatus = EventStatus.Pending
  // 高优先级先执行
  while (eventQueue.length > 0) {
    executingEvent = eventQueue.pop() as QuestEvent
    const eventScript = GetGameEventScript(executingEvent.eventId)
    executingEventStatus = EventStatus.Executing
    eval(eventScript)
    while (isExecutingEventFinishOrCancel) {
      await nextFrame()
    }
  }
}

function isExecutingEventFinishOrCancel() {
  return (
    executingEventStatus === EventStatus.Finish ||
    executingEventStatus === EventStatus.Cancel
  )
}

// --------------------- Bridge Function ----------------------------------
export async function task(callback: (...args: unknown[]) => Promise<unknown>) {
  await nextFrame() // 该方法还是会执行当前帧，下次调用才会执行等待下一帧
  await callback()
  executingEventStatus = EventStatus.Finish
}

export async function talk(characterName: string, text: string, clear = false) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Message
  await globalWindow.messageWindow.talk(characterName, text, clear)
  globalGameData.inputType = previouseInputType
}

export async function message(text: string) {
  await talk('', text, true)
}

export async function messageCachePreviousInputType(text: string) {
  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Message
  await message(text)
  globalGameData.inputType = previouseInputType
}

let _isBattleStatus: BattleFinishStatus = BattleFinishStatus.Pending

export async function battle(wait = true) {
  const battleInfo = GenerateBattleInfo(1)
  executingEngine!.setVariable(GlobalBattleInfo, battleInfo)
  executingEngine!.sceneManager.loadScene('Battle')
  _isBattleStatus = BattleFinishStatus.Pending
  while (wait && _isBattleStatus === BattleFinishStatus.Pending) {
    await nextFrame()
  }
}

export async function setBattleFinishStatus(val: BattleFinishStatus) {
  _isBattleStatus = val
}

export async function shop(id: number | undefined) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

  if (typeof id === 'undefined') {
    id = executingEvent!.args[1]
  }

  const shopType = executingEvent!.args[0]
  await talk(
    '*',
    `这里是${shopType === 0 ? '武器店和防具店' : '道具店'}，请问有什么需要的？`,
    true
  )
  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Menu
  await globalWindow.showShop(id!)
  while (globalWindow.windowMarker === WindowMarker.Shop) {
    await nextFrame()
  }
  globalGameData.inputType = previouseInputType

  await talk('*', `欢迎再来!`, true)
}

export function heroName() {
  return globalGameData.hero.name
}

export function finishCurrentEvent() {
  return globalGameData.finishEvent(executingEvent!.eventId)
}
