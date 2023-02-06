import Engine, { GlobalBattleInfo, GlobalWindowMarker } from '@engine/engine'
import { nextFrame } from '@engine/time'
import GlobalWindowComponent, {
  WindowMarker,
} from '../menu/GlobalWindowComponent'
import { useTextPostProcessing } from '@engine/helper'
import { delay as timeDelay } from '@engine/time'
import { QuestEvent } from './QuestEvent'
import { globalGameData, InputType } from '../asset/gameData'
import { BattleFinishStatus, GenerateBattleInfo } from '../battle/BattleData'

const gameEvents = new Map<string, string>()

export function GetGameEventScript(eventId: string | number) {
  const script = gameEvents.get(generateEventId(eventId))
  if (!script) throw new Error(`GetGameEventScript Error: not found ${eventId}`)
  return script
}

export function AddGameEvent(key: string | number, val: string) {
  gameEvents.set(generateEventId(key), val)
}

export function SetGameEventScript(events: Record<string, string>) {
  for (const key in events) {
    gameEvents.set(generateEventId(key), events[key])
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
  return generateId(id, 'e_')
}

export function generateMapChestId(id: string | number): string {
  return generateId(id, 'c_')
}

export function generateDoorId(id: string | number): string {
  return generateId(id, 'd_')
}

export function generateId(id: string | number, prefix: string) {
  if (typeof id === 'string' && id.startsWith(prefix)) return id
  return `${prefix}${id}`
}

export function AddExecuteEvent(event: QuestEvent) {
  eventQueue.push(event)
  eventQueue.sort((a, b) => a.priority - b.priority)
}

export const EventExecuteStartMarker = Symbol('EventExecuteStartMarker')
export const EventExecuteEndMarker = Symbol('EventExecuteEndMaker')

export async function Execute(engine: Engine) {
  executingEngine = engine
  executingEventStatus = EventStatus.Pending
  // 高优先级先执行
  while (eventQueue.length > 0) {
    executingEvent = eventQueue.pop() as QuestEvent
    console.log(`event ${executingEvent.questId} execute start`)
    executingEvent.root.events.emit({
      marker: EventExecuteStartMarker,
      questId: executingEvent.questId,
    })
    const eventScript = GetGameEventScript(executingEvent.eventId)
    executingEventStatus = EventStatus.Executing
    eval(eventScript)
    while (isExecutingEventFinishOrCancel) {
      await nextFrame()
    }
    executingEvent.root.events.emit({
      marker: EventExecuteEndMarker,
      questId: executingEvent.questId,
    })
    console.log(`event ${executingEvent.questId} execute end`)
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
  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Task
  await nextFrame() // 该方法还是会执行当前帧，下次调用才会执行等待下一帧
  await callback(executingEvent)
  executingEventStatus = EventStatus.Finish
  globalGameData.inputType = previouseInputType
}

export async function talkWithArgs({
  characterName,
  text,
  clear = false,
  select = false,
  callback,
  playTypeAudio = true,
  textArgs,
}: {
  characterName: string
  text: string
  clear: boolean
  select: boolean
  playTypeAudio: boolean
  callback?: () => void
  textArgs?: [string, string][]
}) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Message

  const ret = await globalWindow.messageWindow.talk(
    generateMessageText(characterName),
    generateMessageText(text, textArgs),
    clear,
    select,
    playTypeAudio
  )
  callback && (await callback())
  globalGameData.inputType = previouseInputType

  return ret
}

export async function talk(
  characterName: string,
  text: string,
  clear = false,
  select = false,
  playTypeAudio = true,
  callback?: () => void
): Promise<boolean> {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

  const previouseInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Message

  const ret = await globalWindow.messageWindow.talk(
    generateMessageText(characterName),
    generateMessageText(text),
    clear,
    select,
    playTypeAudio
  )
  callback && (await callback())
  globalGameData.inputType = previouseInputType

  return ret
}

export async function message(text: string, callback?: () => void) {
  await talk('', text, true, false, false, callback)
}

let _isBattleStatus: BattleFinishStatus = BattleFinishStatus.Pending

export async function battle(wait = true) {
  const previousInputType = globalGameData.inputType
  globalGameData.inputType = InputType.Battle

  const battleInfo = GenerateBattleInfo(1)
  executingEngine!.setVariable(GlobalBattleInfo, battleInfo)
  executingEngine!.sceneManager.loadScene('Battle')
  _isBattleStatus = BattleFinishStatus.Pending
  while (wait && _isBattleStatus === BattleFinishStatus.Pending) {
    await nextFrame()
  }
  executingEngine!.sceneManager.unloadScene('Battle')
  if (checkBattleFinishStatus()) return
  globalGameData.inputType = previousInputType
}

function checkBattleFinishStatus(): boolean {
  if (_isBattleStatus === BattleFinishStatus.Faield) {
    // back to tantegel castle
  }
  return false
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

export function lightCave(radius: number, time: number) {
  if (executingEngine!.sceneManager.currentScene.isCave) {
    globalGameData.light(radius, time)
  }
}

let meetEnemyStep = 0
const meetEnemyRatio = 10

export function checkMeetEnemy() {
  if (globalGameData.notMeetEnemyStep > 0) {
    globalGameData.notMeetEnemyStep--
  } else if (currentScene().isMeetEnemy) {
    meetEnemyStep++
    if (meetEnemyStep > 30) {
      const ratio = Math.min(meetEnemyStep, meetEnemyRatio)
      const isMeetEnemy = Math.random() * 100 < ratio
      if (isMeetEnemy) meetEnemyStep = 0
      return isMeetEnemy
    } else if (meetEnemyRatio > 90) {
      meetEnemyStep = 0
      return true
    }
  }
  return false
}

export function currentScene() {
  return executingEngine!.sceneManager.currentScene
}

export function generateMessageText(text: string, args?: [string, string][]) {
  return useTextPostProcessing(
    executingEngine!.i18n.getTextValue(text),
    heroName(),
    args
  )
}

export async function ExecuteCommands(
  executeQuestEvent: QuestEvent,
  command: string
) {
  executingEvent = executeQuestEvent
  const commands = command.split(';').filter((s) => s.length > 0)
  for (const command of commands) {
    const [com, ...args] = command.split(':').map((s) => s.trim())
    if (com === 'HealHP') {
      if (args.length > 0) healHP(parseInt(args[0]))
      else healHP()
    } else if (com === 'HealMP') {
      if (args.length > 0) healMP(parseInt(args[0]))
      else healMP()
    }
  }
}

export function healHP(val?: number) {
  val = val ?? hero().maxHP
  hero().HP = val
}

export function healMP(val?: number) {
  val = val ?? hero().maxMP
  hero().MP = val
}

export function hero() {
  return globalGameData.hero
}

export const delay = timeDelay
