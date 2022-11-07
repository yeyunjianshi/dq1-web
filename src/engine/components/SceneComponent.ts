import { InnerGameComponent } from '.'
import Component from '../component'
import { GlobalSceneComponent } from '../engine'
import { vector2Include } from '../math'
import {
  SceneTransition,
  SceneTransitionDestination,
} from './events/transition'

@InnerGameComponent
export default class SceneComponent extends Component {
  private _transitions: SceneTransition[] = []
  private _transitionDestinations: SceneTransitionDestination[] = []

  awake(): void {
    this.engine.setVariable(GlobalSceneComponent, this)

    this._transitions = this.root.getComponentsInChildren(
      SceneTransition
    ) as SceneTransition[]
    this._transitionDestinations = this.root.getComponentsInChildren(
      SceneTransitionDestination
    ) as SceneTransitionDestination[]
  }

  triggerTransition(position: Vector2): SceneTransition | undefined {
    return this._transitions.find((t) => {
      return vector2Include(position, t.root.boundingBox)
    })
  }
}
