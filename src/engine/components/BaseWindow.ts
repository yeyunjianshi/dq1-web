import Component from '../component'
import { nextFrame } from '../time'

export default abstract class BaseWindow extends Component {
  async InputConfirmOrCancel() {
    await nextFrame()
    while (
      !this.engine.input.isConfirmPressed() &&
      !this.engine!.input.isCancelPressed()
    ) {
      await nextFrame()
    }
  }

  show(init = true) {
    this.root.active = true
  }

  hide() {
    this.root.active = false
  }
}
