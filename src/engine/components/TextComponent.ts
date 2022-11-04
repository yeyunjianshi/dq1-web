import Component from '../component'
import { AssetLoader } from '../resource'
import { InnerGameComponent } from '.'
import { measureLocalPositionByGravity } from '../layout/layout'

export type TextData = {
  type: string
  text?: string
  font?: Font
  lineHeight?: number
  padding?: Vector4 // [top, right, bottom, left]px
}
export const DefaultLineHeight = 1.25
export const DefaultFont: Required<Font> = {
  color: '#eee',
  family: 'ipix',
  size: 30,
  bold: false,
  italic: false,
  align: 'left',
}

@InnerGameComponent
export default class TextComponent extends Component {
  private _text = ''
  font = DefaultFont
  lineHeight = DefaultLineHeight
  showTextLineInfo?: LineInfo
  padding: Vector4 = [0, 0, 0, 0]

  start() {
    this.setText(this._text)
  }

  setText(text: string) {
    const lineInfos =
      text.trim().length === 0
        ? [undefined]
        : this.renderer.measureText(text, this.textMaxWidth, this.font)
    this.showTextLineInfo = lineInfos[0]
  }

  render() {
    if (!this.showTextLineInfo) return

    const offsetY =
      (this.padding[0] + Math.max(1 - this.lineHeight, 1) * this.font.size) >> 1
    const offsetX =
      measureLocalPositionByGravity(
        this.font.align,
        this.textMaxWidth,
        this.showTextLineInfo.width
      ) + this.padding[3]
    this.renderer.drawTextOneLine(
      this.showTextLineInfo.text,
      this.worldPosition[0] + offsetX,
      this.worldPosition[1] + offsetY,
      this.font,
      this.textMaxWidth,
      this.root.alpha
    )
  }

  get textMaxWidth() {
    return this.width - this.padding[1] - this.padding[3]
  }

  parseData(_: AssetLoader, data: TextData): void {
    this._text = data.text ?? this._text
    if (data.font) this.font = { ...this.font, ...data.font }
    this.lineHeight = data.lineHeight ?? this.lineHeight
    this.padding = data.padding ?? this.padding
  }
}
