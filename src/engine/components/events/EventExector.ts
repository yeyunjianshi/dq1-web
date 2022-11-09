import Engine, { GlobalWindow } from '../../engine'
import { nextFrame } from '../../time'
import GlobalWindowComponent from '../GlobalWindowComponent'
import { QuestEvent } from './QuestEvent'

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
async function task(callback: (...args: unknown[]) => Promise<unknown>) {
  await nextFrame() // 该方法还是会执行当前帧，下次调用才会执行等待下一帧
  await callback()
  executingEventStatus = EventStatus.Finish
}

async function talk(characterName: string, text: string, clear = false) {
  const globalWindow =
    executingEngine!.getVariable<GlobalWindowComponent>(GlobalWindow)

  await globalWindow.talk(characterName, text, clear)
}

async function message(text: string) {
  await talk('', text, true)
}
