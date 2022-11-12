import { InnerGameComponent } from '.'
import Component from '../component'
import { DefaultInputCheckDelay } from '../input'
import GridLayout from '../layout/GridLayout'
import { clamp } from '../math'
import { AssetLoader } from '../resource'
import KeyValueItemComponent from './KeyValueItemComponent'

enum WrapLayoutType {
  None = 0b00,
  Height = 0b01,
  Width = 0b10,
}

type ListComponentData = {
  type: string
  canSelect?: boolean
  wrapLayout?: WrapLayoutType
  wrapLayoutOffset?: number
  layoutOffset?: number
}

@InnerGameComponent
export default class ListComponent extends Component {
  private _hoverListener: ListenerFunction[] = []
  private _selectListener: ListenerFunction[] = []
  private _cancelListener: ListenerFunction[] = []
  private _isCanSelect = true
  private _items: ListItem[] = []
  private _adapter?: Adapter<ItemData>
  private _col = 1
  private _row = 1

  private _wrapLayout = WrapLayoutType.None
  private _wrapLayoutOffset = 0

  private _currentIndex = 0
  private _selecting = true

  awake(): void {
    this._items = this.root.getComponentsInChildren(ListItem) as ListItem[]
    this.getRowAndColfromLayout()
    this.setCanSelect(this._isCanSelect)
  }

  private getRowAndColfromLayout() {
    if (this.root.configLayout instanceof GridLayout) {
      this._col = Math.max(1, this.root.configLayout.col)
      this._row = Math.max(1, this.root.configLayout.row)
      this.layout()
    } else {
      this._row = this._items.length
      this._col = 1
      this._wrapLayout = WrapLayoutType.None
    }
  }

  update(): void {
    if (!this._selecting || !this._isCanSelect || this.renderLength === 0)
      return

    if (this.input.isConfirmPressed()) {
      this._items[this._currentIndex].select()
      this.trigger('select')
    } else if (this.input.isCancelPressed()) {
      this.trigger('cancel')
    } else {
      const hor = this.input.getHorizontalValue(DefaultInputCheckDelay)
      const ver = this.input.getVerticalValue(DefaultInputCheckDelay)
      let index = this._currentIndex
      if (
        (hor === 1 &&
          (this._currentIndex + hor) % this._col !== 0 &&
          this._currentIndex < this.renderLength - 1) ||
        (hor === -1 && this._currentIndex % this._col !== 0)
      ) {
        index += hor
      }
      if (
        this._currentIndex + ver * this._col >= 0 &&
        this._currentIndex + ver * this._col < this.renderLength
      ) {
        index += ver * this._col
      }
      if (index !== this._currentIndex) {
        this._items[this._currentIndex].unhover()
        this.setCursorIndex(index)
      }
    }
  }

  setCursorIndex(index: number) {
    this._currentIndex = index
    this.refreshHover()
  }

  refreshHover() {
    if (!this._isCanSelect) return

    this._currentIndex = clamp(this._currentIndex, 0, this.renderLength - 1)

    if (this._items.length === 0) return
    for (let i = 0; i < this._items.length; i++) {
      if (i === this._currentIndex) this._items[i].hover()
      else this._items[i].unhover()
    }
    this._items[this._currentIndex].hover()
    this.trigger('hover')
  }

  setAdapter<T extends ItemData>(adapter: Adapter<T>) {
    this._adapter = adapter
    adapter.conainer = this
    this.refresh()
  }

  refresh(layout = true) {
    if (layout) this.layout()
    if (this._adapter) {
      for (let i = 0; i < this._items.length; i++) {
        if (i < this.renderLength) {
          this._items[i].root.active = true
          this._adapter.getView(this._items[i], this._adapter.getData(i), i)
        } else {
          this._items[i].root.active = false
        }
      }
      this.refreshHover()
    }
  }

  setCanSelect(isCanSelect: boolean) {
    if (!isCanSelect) {
      for (let i = 0; i < this._items.length; i++) {
        this._items[i].unhover()
      }
    }
    this._isCanSelect = isCanSelect
  }

  setSelecting(selecting: boolean) {
    this._selecting = selecting
    this.refreshHover()
  }

  layout() {
    if (this._wrapLayout !== WrapLayoutType.None) {
      const gridLayout = this.root.configLayout as GridLayout
      if (this._wrapLayout === WrapLayoutType.Height) {
        this._row = Math.max(1, Math.ceil(this.dataLength / this._col))
        gridLayout.regenerate(this._row, this._col)
        this.root.measureHeight += this._wrapLayoutOffset
      } else {
        this._col = Math.max(1, Math.ceil(this.dataLength / this._row))
        gridLayout.regenerate(this._row, this._col)
        this.root.measureWidth += this._wrapLayoutOffset
      }
      this._items = this.root.getComponentsInChildren(ListItem) as ListItem[]
    }
  }

  public addHoverListenner(listener: ListenerFunction) {
    this._hoverListener.push(listener)
  }

  public addSelectListener(listener: ListenerFunction) {
    this._selectListener.push(listener)
  }

  public addCancelListener(listener: ListenerFunction) {
    this._cancelListener.push(listener)
  }

  public removeHoverListenner(listener: ListenerFunction) {
    this._hoverListener = this._hoverListener.filter((l) => l !== listener)
  }

  public removeSelectListener(listener: ListenerFunction) {
    this._selectListener = this._selectListener.filter((l) => l !== listener)
  }

  public removeCancelListener(listener: ListenerFunction) {
    this._cancelListener = this._cancelListener.filter((l) => l !== listener)
  }

  public trigger(type: 'hover' | 'select' | 'cancel') {
    if (type === 'hover') {
      this._hoverListener.forEach((l) =>
        l(this.currentItem, this._currentIndex)
      )
    } else if (type === 'select') {
      this._selectListener.forEach((l) =>
        l(this.currentItem, this._currentIndex)
      )
    } else {
      this._cancelListener.forEach((l) => l())
    }
  }

  public get renderLength(): number {
    return Math.min(this._items.length, this.dataLength)
  }

  public get dataLength(): number {
    return this._adapter?.length ?? 0
  }

  public get currentItem() {
    return this._items[this._currentIndex]
  }

  public adapter<T>() {
    return this._adapter ? (this._adapter as T) : undefined
  }

  parseData(_: AssetLoader, data: ListComponentData): void {
    this._isCanSelect =
      typeof data.canSelect === 'boolean' ? data.canSelect : this._isCanSelect
    this._wrapLayout = data.wrapLayout ?? this._wrapLayout
    this._wrapLayoutOffset = data.wrapLayoutOffset ?? this._wrapLayoutOffset
  }
}

export abstract class ListItem extends Component implements SelectListener {
  isCanSelect = false

  abstract select(...args: unknown[]): void
  abstract unselect(...args: unknown[]): void
  abstract hover(...args: unknown[]): void
  abstract unhover(...args: unknown[]): void
}

export type ItemData = Record<string, unknown>

export abstract class Adapter<T extends ItemData> {
  private _data: T[] = []
  conainer?: ListComponent

  constructor(data: T[]) {
    this._data = data
  }

  public getData(index: number) {
    return this._data[index]
  }

  public get length() {
    return this._data.length
  }

  public setData(data: T[]) {
    const previousLength = this._data.length
    this._data = data
    this.conainer?.refresh(previousLength !== data.length)
  }

  abstract getView(view: ListItem, data: T, position: number): void
}

export class TextAdapter extends Adapter<{ text: string }> {
  getView(view: KeyValueItemComponent, data: { text: string }): void {
    view.setKeyText(data.text)
  }
}

export class KeyValueAdapter extends Adapter<{ key: string; value: string }> {
  getView(
    view: KeyValueItemComponent,
    data: { key: string; value: string }
  ): void {
    view.setKeyText(data.key)
    view.setValueText(data.value)
  }
}
