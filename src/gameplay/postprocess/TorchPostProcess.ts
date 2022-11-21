import CanvasRenderer, { RenderOrder } from '../../engine/canvasRenderer'
import TeamControllerComponent, {
  PlayerCenterPosition,
} from '../../engine/components/TeamControllerComponent'
import Engine, { GlobalTeamControllerMarker } from '../../engine/engine'
import { globalGameData } from '../asset/gameData'

export default class TorchPostProcess implements IPostProcess {
  private _engine: Engine

  constructor(engine: Engine) {
    this._engine = engine
  }

  render(r: IRenderer) {
    const renderer = r as CanvasRenderer
    renderer.context.save()
    renderer.context.clearRect(0, 0, renderer.width, renderer.height)

    try {
      const currentScene = this._engine.sceneManager.currentScene

      let clip = false

      if (currentScene.isCave) {
        const teamController =
          this._engine.getVariable<TeamControllerComponent>(
            GlobalTeamControllerMarker
          )

        if (globalGameData.lightTime > 0) {
          globalGameData.lightTime -= this._engine.time.deltaTime
          if (globalGameData.lightTime <= 0) {
            globalGameData.lightTime = 0
            globalGameData.lightRadius = 0
          }
        }

        if (teamController !== null) {
          renderer.context.save()
          const [x, y] = PlayerCenterPosition(teamController.headCameraPosition)
          renderer.context.beginPath()
          renderer.context.arc(
            x,
            y,
            Math.max(globalGameData.lightRadius, 20),
            0,
            Math.PI * 2
          )
          renderer.context.clip()
          clip = true
        }
      }

      renderer.cacheInfos.forEach((info) => {
        if (clip && info.renderOrder === RenderOrder.Window) {
          renderer.context.restore()
        }
        renderer.context.drawImage(
          info.canvas,
          0,
          0,
          renderer.width,
          renderer.height,
          0,
          0,
          renderer.width,
          renderer.height
        )
      })
    } catch (e) {
      console.log(e)
    }
    renderer.context.restore()

    // }
  }
}
