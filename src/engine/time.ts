export const delay = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}

export class Time implements ITime {
  private _deltaTime = 0
  private _currentFrameTime = 0
  private _previousFrameTime = 0
  private _currentFrame = 0
  private _runningTime = 0

  gameplayTime = 0
  scaleTimes = 1

  init() {
    this._deltaTime = 0
    this._currentFrameTime = 0
    this._previousFrameTime = 0
    this.gameplayTime = 0
    this._runningTime = 0
  }

  tick() {
    this._currentFrame++

    const previousFrameTime = this._currentFrameTime
    this._currentFrameTime = Date.now()
    this._deltaTime = this._currentFrameTime - this._previousFrameTime
    this._previousFrameTime = previousFrameTime

    this.gameplayTime += this._deltaTime
    this._runningTime += this._deltaTime
  }

  get scaleDeltaTime(): number {
    return this._deltaTime * this.scaleTimes
  }

  get deltaTime() {
    return this._deltaTime
  }

  get currentFrameTime() {
    return this._currentFrameTime
  }

  get previousFrameTime() {
    return this._previousFrameTime
  }

  get runningTime() {
    return this._runningTime
  }

  get currentFrame() {
    return this._currentFrame
  }
}

export default Time