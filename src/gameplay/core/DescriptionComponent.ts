import Component from '@engine/component'
import { GameplayComponent } from '@engine/components'
import { delay } from '@engine/time'
import { transitionTo } from '@gameplay/events/EventExector'

@GameplayComponent
export default class DescriptionComponent extends Component {
  start() {
    this.init()
  }

  private async init() {
    await delay(2000)
    transitionTo('Logo')
  }
}
