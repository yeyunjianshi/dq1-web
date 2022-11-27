import Time from './time'

export const DefaultInputCheckDelay = 500

class Input {
  private _time: Time
  active = true
  private _handlers: (() => void)[] = []

  pressedKyes: string[] = []

  pressedKeyInfo: {
    key: string
    frame: number
    updateTime: number
    intialTime: number
  } = {
    key: '',
    frame: 0,
    updateTime: 0,
    intialTime: 0,
  }

  constructor(time: Time) {
    this._time = time
  }

  init() {
    const dispatch = () => {
      const currentPressedKey =
        this.pressedKyes.length > 0
          ? this.pressedKyes[this.pressedKyes.length - 1]
          : ''
      if (currentPressedKey !== this.pressedKeyInfo.key) {
        this.pressedKeyInfo.key = currentPressedKey
        this.pressedKeyInfo.frame = this._time.currentFrame
        this.pressedKeyInfo.intialTime = this._time.currentFrameTime
        this.pressedKeyInfo.updateTime = 0
      }
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      return () => {
        // console.log(`${event.key} keydown`)
        if (!this.active || this.pressedKeyInfo.key === event.key) return
        this.pressedKyes.push(event.key)
        dispatch()
      }
    }
    const keyUpHandler = (event: KeyboardEvent) => {
      return () => {
        // console.log(`${event.key} keyup`)
        if (!this.active) return

        this.pressedKyes = this.pressedKyes.filter((k) => k !== event.key)
        dispatch()
      }
    }
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this._handlers.push(keyDownHandler(event))
    })
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this._handlers.push(keyUpHandler(event))
    })
  }

  isPressed(key: string, checkFrameTime = false) {
    return (
      key === this.pressedKeyInfo.key &&
      (!checkFrameTime || this._time.currentFrame === this.pressedKeyInfo.frame)
    )
  }

  getHorizontalValue(delay = -1) {
    if (
      (this.isLeftPressed() || this.isRightPressed()) &&
      this._time.currentFrameTime - this.pressedKeyInfo.updateTime >= delay
    ) {
      this.pressedKeyInfo.updateTime = this._time.currentFrameTime
      return this.isLeftPressed() ? -1 : 1
    }
    return 0
  }

  getVerticalValue(delay = -1) {
    if (
      (this.isDownPressed() || this.isUpPressed()) &&
      this._time.currentFrameTime - this.pressedKeyInfo.updateTime >= delay
    ) {
      this.pressedKeyInfo.updateTime = this._time.currentFrameTime
      return this.isUpPressed() ? -1 : 1
    }
    return 0
  }

  isDownPressed(): boolean {
    return this.isPressed('s')
  }

  isUpPressed(): boolean {
    return this.isPressed('w')
  }

  isLeftPressed(): boolean {
    return this.isPressed('a')
  }

  isRightPressed(): boolean {
    return this.isPressed('d')
  }

  isConfirmPressed(): boolean {
    return this.isPressed('j', true)
  }

  isCancelPressed(): boolean {
    return this.isPressed('k', true)
  }

  getPressedDirection(): Direction {
    if (this.isLeftPressed()) return Direction.left
    if (this.isRightPressed()) return Direction.right
    if (this.isUpPressed()) return Direction.up
    if (this.isDownPressed()) return Direction.down
    return Direction.none
  }

  tick() {
    this._handlers.forEach((handler) => handler())
    this._handlers = []
  }
}

export enum Direction {
  none = -1,
  up = 0,
  down,
  left,
  right,
}

export function parseDirection(
  dir: string | number | undefined | null
): Direction {
  if (typeof dir === 'undefined' && dir === null) return Direction.none
  if (typeof dir === 'string') {
    if (dir === 'down') return Direction.down
    if (dir === 'up') return Direction.up
    if (dir === 'left') return Direction.left
    if (dir === 'right') return Direction.right
    return Direction.none
  }
  return dir as Direction
}

export function getDirectionByCoord(coord: Vector2) {
  if (coord[0] < 0) return Direction.left
  if (coord[0] > 0) return Direction.right
  if (coord[1] < 0) return Direction.up
  if (coord[1] > 0) return Direction.down
  return Direction.none
}

export const DirectionToCoord = new Map<Direction, Vector2>([
  [Direction.none, [0, 0]],
  [Direction.left, [-1, 0]],
  [Direction.right, [1, 0]],
  [Direction.up, [0, -1]],
  [Direction.down, [0, 1]],
])

export function oppsiteDirection(direction: Direction): Direction {
  if (direction === Direction.left) return Direction.right
  if (direction === Direction.right) return Direction.left
  if (direction === Direction.up) return Direction.down
  if (direction === Direction.down) return Direction.up
  return Direction.none
}

export default Input
