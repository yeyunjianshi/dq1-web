import { GameplayComponent } from '../../engine/components'
import Component from '../../engine/component'
import { GlobalWindowMarker } from '../../engine/engine'
import GameObject from '../../engine/gameObject'
import ListComponent, {
  TextAdapter,
} from '../../engine/components/ListComponent'
import CommonStatusWindow from './CommonStatusWindow'
import CommonGoldWindow from './CommonGoldWindow'
import BaseWindow from '../../engine/components/BaseWindow'
import { globalGameData, InputType } from '../asset/gameData'
import MenuStatusWindow from './MenuStatusWindow'
import MenuEquipmentWindow from './MenuEquipmentWindow'
import MenuItemWindow from './MenuItemWindow'
import ShopWindow from './ShopWindow'
import AlertWindow from './AlertWindow'
import MessageWindow from './MessageWindow'
import SaveWindow from './SaveWindow'

interface IWindowStack {
  pushWindow(w: BaseWindow | string): void
  popWindow(): void
}

export enum WindowMarker {
  None = 0x00,
  Menu = 0b01,
  Shop = 0b10,
}

@GameplayComponent
export default class GlobalWindowComponent
  extends Component
  implements IWindowStack
{
  private _messageWindow?: MessageWindow
  private _menuWindow?: MenuWindow
  private _commonStatusWindow?: CommonStatusWindow
  private _commonGoldWindow?: CommonGoldWindow
  private _menuStatusWindow?: MenuStatusWindow
  private _menuEquipmentWindow?: MenuEquipmentWindow
  private _menuItemWindow?: MenuItemWindow
  private _shopWindow?: ShopWindow
  private _saveWindow?: SaveWindow
  private _alertWindow?: AlertWindow
  private _windowStack: BaseWindow[] = []
  private _pressedFrame = 0
  public windowMarker = WindowMarker.None

  awake(): void {
    this._messageWindow = this.root.getComponentInChildByName(
      'messageWindow',
      MessageWindow
    ) as MessageWindow
    this._menuWindow = new MenuWindow(
      this.root.getComponentInChildByName(
        'menuWindow',
        ListComponent
      ) as ListComponent,
      this.root,
      this
    )
    this._commonStatusWindow = this.root.getComponentInChildByName(
      'commonStatusWindow',
      CommonStatusWindow
    ) as CommonStatusWindow

    this._commonGoldWindow = this.root.getComponentInChildByName(
      'commonGoldWindow',
      CommonGoldWindow
    ) as CommonGoldWindow

    this._menuStatusWindow = this.root.getComponentInChildByName(
      'menuStatusWindow',
      MenuStatusWindow
    ) as MenuStatusWindow

    this._menuEquipmentWindow = this.root.getComponentInChildByName(
      'menuEquipmentWindow',
      MenuEquipmentWindow
    ) as MenuEquipmentWindow

    this._menuItemWindow = this.root.getComponentInChildByName(
      'menuItemWindow',
      MenuItemWindow
    ) as MenuItemWindow

    this._shopWindow = this.root.getComponentInChildByName(
      'shopWindow',
      ShopWindow
    ) as ShopWindow

    this._saveWindow = this.root.getComponentInChildByName(
      'saveWindow',
      SaveWindow
    ) as SaveWindow

    this._alertWindow = this.root.getComponentInChildByName(
      'alertWindow',
      AlertWindow
    ) as AlertWindow

    this.engine.setVariable(GlobalWindowMarker, this)

    this._menuWindow.awake()
  }

  start() {
    this.menuWindow.start()
  }

  showMenu() {
    this.windowMarker = WindowMarker.Menu
    this._pressedFrame = this.time.currentFrame

    this.menuWindow.show()
    this._commonStatusWindow?.show()
    this._commonGoldWindow?.show()
    this._windowStack.push(this.menuWindow)
  }

  hideMenu() {
    this._commonGoldWindow?.hide()
    this._commonStatusWindow?.hide()
    this.menuWindow.hide()
    this._windowStack = []
  }

  showShop(shopId: number) {
    this.windowMarker = WindowMarker.Shop
    this._pressedFrame = this.time.currentFrame

    this._commonGoldWindow?.show()
    this._shopWindow!.show(true, shopId)
    this._windowStack.push(this._shopWindow!)
  }

  alert(content: string, callback: ListenerFunction) {
    this._pressedFrame = this.time.currentFrame
    this._alertWindow!.addListener(callback)
    this._alertWindow!.show(true, content)
    this._windowStack.push(this._alertWindow!)
  }

  pushWindow(w: BaseWindow | string) {
    const window =
      w instanceof BaseWindow
        ? w
        : w === 'status'
        ? this._menuStatusWindow!
        : w === 'equip'
        ? this._menuEquipmentWindow!
        : w === 'item'
        ? this._menuItemWindow!
        : w === 'save'
        ? this._saveWindow
        : undefined

    if (window) {
      window.show()
      this._windowStack.push(window)
    }
  }

  popWindow() {
    const window = this._windowStack.pop()
    window?.hide()

    if (this._windowStack.length == 0) {
      globalGameData.inputType = InputType.Move
      this.hideMenu()
      this.windowMarker = WindowMarker.None
    }
  }

  update(): void {
    if (
      globalGameData.inputType !== InputType.Menu ||
      this.time.currentFrame === this._pressedFrame
    )
      return

    if (this.input.isCancelPressed()) {
      if (!this.activeWindow?.interceptCancel()) {
        console.log('cancel')
        this.popWindow()
      }
    } else {
      this.activeWindow?.update()
    }
  }

  get activeWindow() {
    return this._windowStack.length > 0
      ? this._windowStack[this._windowStack.length - 1]
      : undefined
  }

  get messageWindow() {
    return this._messageWindow!
  }

  get menuWindow() {
    return this._menuWindow!
  }
}

class MenuWindow extends BaseWindow {
  constructor(
    private _menuWindow: ListComponent,
    root: GameObject,
    private _windowStack: IWindowStack
  ) {
    super(root)
    this._menuWindow.enable = false
  }

  menuCommands = [
    { text: '装备', name: 'equip' },
    { text: '状态', name: 'status' },
    { text: '道具', name: 'item' },
    { text: '咒语', name: 'magic' },
    { text: '存档', name: 'save' },
    { text: '设置', name: 'config' },
  ]

  start(): void {
    const adapter = new TextAdapter(this.menuCommands)
    this._menuWindow.setAdapter(adapter)
    this._menuWindow.addSelectListener((item: string, pos: number) => {
      console.log(item)
      console.log(pos)
      this._windowStack.pushWindow(this.menuCommands[pos].name)
    })
    this._menuWindow.addHoverListenner((_, pos) => {
      console.log('hover ' + pos)
    })
  }

  show(init = true) {
    this._menuWindow.root.active = true
    if (init) this._menuWindow.setCursorIndex(0)
  }

  hide() {
    this._menuWindow.root.active = false
  }

  update() {
    this._menuWindow.update()
  }
}
