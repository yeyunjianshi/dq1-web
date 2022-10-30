import Time from './time'

class Input {
  private _time: Time
  active = true
  private _handlers: (() => void)[] = []

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
    const keyDownHandler = (event: KeyboardEvent) => {
      return () => {
        console.log(`${event.key} keydown`)
        if (!this.active) return

        if (this.pressedKeyInfo.key !== event.key) {
          this.pressedKeyInfo.key = event.key
          this.pressedKeyInfo.frame = this._time.currentFrame
          this.pressedKeyInfo.intialTime = this._time.currentFrameTime
          this.pressedKeyInfo.updateTime = 0
        }
      }
    }
    const keyUpHandler = (event: KeyboardEvent) => {
      return () => {
        console.log(`${event.key} keyup`)
        if (!this.active) return
        this.pressedKeyInfo.key = ''
        this.pressedKeyInfo.frame = 0
        this.pressedKeyInfo.intialTime = 0
        this.pressedKeyInfo.updateTime = 0
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
    console.log(this._time.currentFrame + ' ' + this.pressedKeyInfo.frame)
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

export default Input
