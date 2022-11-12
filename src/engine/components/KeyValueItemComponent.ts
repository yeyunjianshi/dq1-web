import { InnerGameComponent } from '.'
import GameObject from '../gameObject'
import { AssetLoader } from '../resource'
import { ListItem } from './ListComponent'
import TextComponent from './TextComponent'

type TextItemData = {
  type: string
  canSelect?: boolean
}

@InnerGameComponent
export default class KeyValueItemComponent extends ListItem {
  private _keyComponent?: TextComponent
  private _valueComponent?: TextComponent
  private _arrow?: GameObject

  awake(): void {
    this._keyComponent = this.root.children[0].components.find(
      (com) => com instanceof TextComponent
    ) as TextComponent
    if (this.root.children.length > 2) {
      this._valueComponent = this.root.children[1].components.find(
        (com) => com instanceof TextComponent
      ) as TextComponent
      this._arrow = this.root.children[2]
    } else {
      this._arrow = this.root.children[1]
    }
    if (this._arrow) this._arrow.alpha = 0
  }

  setKeyText(text: string) {
    this._keyComponent?.setText(text)
  }

  setValueText(text: string) {
    this._valueComponent?.setText(text)
  }

  select(): void {
    if (!this.isCanSelect || !this._arrow) return
    this._arrow.alpha = 1
  }

  unselect(): void {}

  hover(): void {
    if (!this.isCanSelect || !this._arrow) return
    this._arrow.active = true
    this._arrow.alpha = 0.5
  }

  unhover(): void {
    if (!this.isCanSelect || !this._arrow) return
    this._arrow.active = false
  }

  parseData(_: AssetLoader, data: TextItemData): void {
    this.isCanSelect =
      typeof data.canSelect === 'boolean' ? data.canSelect : this.isCanSelect
  }
}