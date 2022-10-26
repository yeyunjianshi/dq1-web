type EventListener<T> = (t: T) => void

export default class EventEmitter<T> {
  private _listeners = new Array<EventListener<T>>()

  addListener(listener: EventListener<T>) {
    this._listeners.push(listener)
  }

  once(listener: EventListener<T>) {
    const handler = (t: T) => {
      listener(t)
      this.removeListener(handler)
    }
    this.addListener(handler)
  }

  removeListener(listener: EventListener<T>) {
    const index = this._listeners.indexOf(listener)
    if (index != -1) {
      this._listeners.slice(index, 1)
    }
  }

  clear() {
    this._listeners = []
  }

  emit(t: T) {
    this._listeners.forEach((l) => l(t))
  }
}
