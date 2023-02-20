import Engine, {
  GlobalBattleInfo,
  GlobalFadingMarker,
  GlobalSceneComponentMarker,
  GlobalTeamControllerMarker,
  GlobalWindowMarker,
} from '@engine/engine'
import { nextFrame } from '@engine/time'
import FadingComponent from '@engine/components/FadingComponent'
import { delay as timeDelay } from '@engine/time'
import { useTextPostProcessing } from '@engine/helper'
import GlobalWindowComponent, {
  WindowMarker,
} from '../menu/GlobalWindowComponent'
import { QuestEvent } from './QuestEvent'
import { globalGameData, InputType } from '../asset/gameData'
import { BattleFinishStatus, GenerateBattleInfo } from '../battle/BattleData'
import { transitionToScene } from './Transition'
import { Audios } from '../audio/AudioConfig'
import SceneComponent from '../core/SceneComponent'
import { NPCControllerComponent } from '../core/NPCControllerComponent'
import TeamControllerComponent from '../core/TeamControllerComponent'

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

export function getEventEngine() {
  return executingEngine
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

let isExecuting = false

export async function Execute(engine: Engine) {
  if (isExecuting) return
  isExecuting = true

  executingEngine = engine
  executingEventStatus = EventStatus.Pending
  // 高优先级先执行
  while (eventQueue.length > 0) {
    executingEvent = eventQueue.pop() as QuestEvent
    console.log(`===== event ${executingEvent.questId} execute start =====`)
    executingEvent.root.events.emit({
      marker: EventExecuteStartMarker,
      questId: executingEvent.questId,
    })
    const eventScript = GetGameEventScript(executingEvent.eventId)
    executingEventStatus = EventStatus.Executing
    eval(eventScript)
    while (!isExecutingEventFinishOrCancel()) {
      await nextFrame()
    }
    executingEvent.root.events.emit({
      marker: EventExecuteEndMarker,
      questId: executingEvent.questId,
    })
    console.log(`===== event ${executingEvent.questId} execute end =====`)
    refreshAndTriggerAutoEvent()
  }

  isExecuting = false
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

  const previouseInputType = setInputType(InputType.Message)

  const ret = await globalWindow.messageWindow.talk(
    generateMessageText(characterName),
    generateMessageText(text, textArgs),
    clear,
    select,
    playTypeAudio
  )
  callback && (await callback())

  setInputType(previouseInputType)

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

  const previouseInputType = setInputType(InputType.Message)

  const ret = await globalWindow.messageWindow.talk(
    generateMessageText(characterName),
    generateMessageText(text),
    clear,
    select,
    playTypeAudio
  )
  callback && (await callback())
  setInputType(previouseInputType)

  return ret
}

export async function message(text: string, callback?: () => void) {
  await talk('', text, true, false, false, callback)
}

let _isBattleStatus: BattleFinishStatus = BattleFinishStatus.Pending

export async function battle(wait = true) {
  const previouseInputType = setInputType(InputType.Battle)

  const battleInfo = GenerateBattleInfo(1)
  executingEngine!.setVariable(GlobalBattleInfo, battleInfo)
  executingEngine!.sceneManager.loadScene('Battle')
  _isBattleStatus = BattleFinishStatus.Pending
  while (wait && _isBattleStatus === BattleFinishStatus.Pending) {
    await nextFrame()
  }
  executingEngine!.sceneManager.unloadScene('Battle')
  if (checkBattleFinishStatus()) return
  setInputType(previouseInputType)
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

export async function shop(id: number) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)

  const previouseInputType = setInputType(InputType.Menu)
  await globalWindow.showShop(id)
  while (globalWindow.windowMarker === WindowMarker.Shop) {
    await nextFrame()
  }
  setInputType(previouseInputType)
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
  } else if (isMeetEnemy()) {
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

export function isMeetEnemy() {
  return currentScene().isMeetEnemy && globalGameData.isMeetEnemy
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
  console.log(commands)
  for (const command of commands) {
    const [com, ...args] = command.split(':').map((s) => s.trim())
    if (com === 'HealHP') {
      if (args.length > 0) healHP(parseInt(args[0]))
      else healHP()
    } else if (com === 'HealMP') {
      if (args.length > 0) healMP(parseInt(args[0]))
      else healMP()
    } else if (com === 'AddItem') {
      const itemsName = args.map((id) => {
        return globalGameData.inventory.addItem(+id).item.name
      })
      await message(`获得了${itemsName.join('、')}`)
    } else if (com === 'AddGold') {
      hero().gold += parseInt(args[0])
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

export function rest() {
  healHP()
  healMP()
}

export function hero() {
  return globalGameData.hero
}

export async function checkDeadToInit() {
  if (hero().isDead) {
    setInputType(InputType.Transition)
    executingEngine!.audios.playBGM(Audios.Dead, true, false)

    await delay(3000)
    await transitionToScene(executingEngine!, 'Title')
  }
}

export const delay = timeDelay

export async function fading(t: {
  type?: 'out' | 'in'
  duration?: number
  color?: Color
}) {
  const fadingComponent =
    executingEngine?.getVariable<FadingComponent>(GlobalFadingMarker)
  if (fadingComponent) {
    await fadingComponent.fading(t)
  }
}

export async function flashing(t: {
  color: string
  duration: number
  times: number
}) {
  const fadingComponent =
    executingEngine?.getVariable<FadingComponent>(GlobalFadingMarker)
  if (fadingComponent) {
    await fadingComponent.flashing(t)
  }
}

export function showGoldWindow(show = true) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindowMarker)
  globalWindow.showGold(show)
}

export function setInputType(type: InputType) {
  const previousType = globalGameData.inputType
  globalGameData.inputType = type
  return previousType
}

export function refreshAndTriggerAutoEvent() {
  const sceneComponent = executingEngine!.getVariable(
    GlobalSceneComponentMarker
  ) as SceneComponent
  sceneComponent.refreshAndTriggerAutoEvent()
}

export function getQuestNPC(characterName?: string) {
  if (!characterName)
    return executingEvent!.root.getComponent(
      NPCControllerComponent
    ) as NPCControllerComponent

  return currentScene().rootObject.getComponentInChildByName(
    characterName,
    NPCControllerComponent
  ) as NPCControllerComponent
}

export function hasQuestEvents(...questsId: (number | string)[]) {
  return questsId.forEach((questId) =>
    globalGameData.hasEvent(generateEventId(questId))
  )
}

export function finishQuestEvents(...questsId: (number | string)[]) {
  questsId.forEach((id) => globalGameData.finishEvent(generateEventId(id)))
}

export function removeQuestEvents(...questsId: (number | string)[]) {
  questsId.forEach((id) => globalGameData.removeEvent(generateEventId(id)))
}

export function hasItems(...items: number[]) {
  return items.every((itemId) => globalGameData.inventory.hasItem(itemId))
}

export function checkInventoryIsFull(...itemId: number[]) {
  return globalGameData.inventory.isFull()
}

export function addItems(...itemsId: number[]) {
  return itemsId.map((id) => globalGameData.inventory.addItem(id).item.name)
}

export function audio() {
  return executingEngine!.audios
}

export function changeHeroRoleId(role: number) {
  hero().roleId = role

  const teamController = executingEngine!.getVariable<TeamControllerComponent>(
    GlobalTeamControllerMarker
  )

  teamController.initTeam()
}
