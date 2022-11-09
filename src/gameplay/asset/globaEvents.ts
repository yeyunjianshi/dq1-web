interface GlobalEventListener {
  (...args: unknown[]): void
}

export enum GlobalEventType {
  ChracterStatusChanged = '$ChracterStatusChanged',
  GoldChanged = '$GoldChanged',
}

const globalEvents = new Map<string, GlobalEventListener[]>()

export function GlobalEventAddListener(
  event: string,
  listener: GlobalEventListener
) {
  const listeners = globalEvents.get(event) ?? []
  listeners.push(listener)
}

export function GlobalEventOnce(event: string, listener: GlobalEventListener) {
  const handler = (...args: unknown[]) => {
    listener(args)
    GlobalEventRemoveListener(event, handler)
  }
  GlobalEventAddListener(event, handler)
}

export function GlobalEventRemoveListener(
  event: string,
  listener: GlobalEventListener
) {
  const listeners = globalEvents.get(event)
  if (listeners) {
    const index = listeners.indexOf(listener)
    if (index != -1) {
      listeners.splice(index, 1)
    }
  }
}

export function GlobalEventClear(event: string) {
  globalEvents.set(event, [])
}

export function GlobalEventEmit(event: string, ...args: unknown[]) {
  const listeners = globalEvents.get(event) ?? []
  listeners.forEach((listener) => {
    listener(args)
  })
}
