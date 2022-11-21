import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import { message } from '../../engine/components/events/EventExector'
import ListComponent, {
  KeyValueAdapter,
  TextAdapter,
} from '../../engine/components/ListComponent'
import TextComponent from '../../engine/components/TextComponent'
import { GlobalWindowMarker } from '../../engine/engine'
import GameObject from '../../engine/gameObject'
import { GetShopItems, globalGameData, InputType } from '../asset/gameData'
import { ItemSlot } from '../inventory/inventory'
import { HasType, ItemType } from '../inventory/item'
import GlobalWindowComponent from './GlobalWindowComponent'

enum ShopType {
  Buy = 0,
  Sell,
  GiveUp,
}

@GameplayComponent
export default class ShopWindow extends BaseWindow {
  private _selectWindow?: ListComponent
  private _itemsWindow?: ListComponent
  private _messageWindow?: GameObject
  private _messageLableText?: TextComponent
  private _messageNameText?: TextComponent
  private _messageValueText?: TextComponent

  private _selecting = true

  start() {
    this._selectWindow = this.root.getComponentInChildByName(
      'shopSelectWindow',
      ListComponent
    ) as ListComponent
    this._itemsWindow = this.root.getComponentInChildByName(
      'shopItemWindow',
      ListComponent
    ) as ListComponent
    this._messageWindow = this.root.getGameObjectInChildren('shopMessageWindow')
    this._messageLableText = this.root.getComponentInChildByName(
      'shopMessageLabelText',
      TextComponent
    ) as TextComponent
    this._messageNameText = this.root.getComponentInChildByName(
      'shopMessageNameText',
      TextComponent
    ) as TextComponent
    this._messageValueText = this.root.getComponentInChildByName(
      'shopMessageValueText',
      TextComponent
    ) as TextComponent

    this.enable = false
    this._itemsWindow!.enable = false
    this._selectWindow!.enable = false

    this.init()
  }

  private _buyItems: ItemSlot[] = []
  private _itemData = [] as ItemSlot[]
  private _shopType = ShopType.Sell

  private init() {
    this.setSelect(this._selecting)

    this._messageNameText?.setText(this.hero.name)

    const selectAdapter = new TextAdapter([
      { text: '购买' },
      { text: '卖出' },
      { text: '放弃' },
    ])
    this._selectWindow?.setAdapter(selectAdapter)
    this._selectWindow?.addSelectListener((_, pos) => {
      if (pos === ShopType.GiveUp) {
        globalGameData.inputType = InputType.Move
        ;(
          this.engine.getVariable(GlobalWindowMarker) as GlobalWindowComponent
        ).popWindow()
        return
      }
      if (pos === ShopType.Sell && globalGameData.inventory.isEmpty()) {
        message('背包中没有物品可以出售')
        return
      }
      this._shopType = pos
      this.setSelect(false)
      this.refreshItemData()
      this._itemsWindow?.setCursorIndex(0)
    })

    const itemAdapter = new KeyValueAdapter([])

    this._itemsWindow?.setAdapter(itemAdapter)
    this._itemsWindow?.addHoverListenner((_, pos) => {
      const itemSlot = this._itemData[pos]
      if (itemSlot.item.isAllItem) {
        this._messageLableText?.setText('拥有')
        this._messageValueText?.setText(
          ` ${globalGameData.inventory.itemCount(itemSlot.item.id)}`
        )
      }
      if (itemSlot.item.isEquipment) {
        const { attack, defend } = this.hero.tryEquipment(itemSlot)
        if (HasType(itemSlot.item.type, ItemType.Weapon)) {
          this._messageLableText?.setText('攻')
          this._messageValueText?.setText(`${this.hero.attack}→${attack}`)
        } else {
          this._messageLableText?.setText('防')
          this._messageValueText?.setText(`${this.hero.defend}→${defend}`)
        }
      }
    })
    this._itemsWindow?.addSelectListener((_, pos) => {
      const itemSlot = this._itemData[pos]
      if (this._shopType === ShopType.Buy) {
        if (globalGameData.hero.gold < itemSlot.item.price) {
          message(`金额不足，无法购买 ${itemSlot.item.name}`)
        } else if (globalGameData.inventory.isFull()) {
          message('背包已经满了，无法装下更多物品了')
        } else {
          globalGameData.hero.addGold(-itemSlot.item.price)
          const newItemSlot = globalGameData.inventory.addItem(itemSlot.item.id)
          if (itemSlot.item.isEquipment) {
            const globalWindow = this.engine.getVariable(
              GlobalWindowMarker
            ) as GlobalWindowComponent
            globalWindow.alert('是否立即装备？', (confirm: boolean) => {
              if (confirm) {
                globalGameData.heroEquip(newItemSlot)
                this._itemsWindow?.refreshHover()
              }
              globalWindow.popWindow()
            })
          }
        }
      } else if (this._shopType === ShopType.Sell) {
        if (itemSlot.item.isCanSell) {
          globalGameData.inventoryRemoveItemSlotById(itemSlot.id)
          this.hero.addGold(itemSlot.item.sellPrice)
          this.refreshItemData()
          if (globalGameData.inventory.isEmpty()) this.interceptCancel()
        }
      }
    })

    this.refreshItemData()
  }

  private refreshItemData() {
    this._itemData.splice(0, this._itemData.length)

    const renderItems = [] as { key: string; value: string }[]
    if (this._shopType === ShopType.Buy) {
      this._itemData.push(...this._buyItems)
      renderItems.push(
        ...this._itemData.map((slot) => ({
          key: `${slot.item.name}`,
          value: `${slot.item.price} G`,
        }))
      )
    } else if (this._shopType === ShopType.Sell) {
      this._itemData.push(
        ...globalGameData.inventory.all().filter((slot) => slot.item.isCanSell)
      )
      renderItems.push(
        ...this._itemData.map((slot) => ({
          key: `${slot.item.name} ${slot.isEquip ? 'E' : ''}`,
          value: `${slot.item.sellPrice} G`,
        }))
      )
    }

    this._itemsWindow!.adapter<KeyValueAdapter>()!.setData(renderItems)
  }

  get hero() {
    return globalGameData.hero
  }

  show(init = true, shopId = 1): void {
    super.show(init)

    this._buyItems = GetShopItems(shopId).map((item) => ({
      id: 0,
      item,
      isEquip: false,
    }))

    this.refreshItemData()
    this._selectWindow?.setCursorIndex(0)
    this.setSelect(true)
  }

  update(): void {
    if (this._selecting) this._selectWindow?.update()
    else this._itemsWindow?.update()
  }

  setSelect(select: boolean) {
    this._selecting = select
    if (select) {
      this._itemsWindow!.root.active = false
      this._messageWindow!.active = false
      this._selectWindow!.setSelecting(true)
    } else {
      this._selectWindow!.setSelecting(false)
      this._itemsWindow!.root.active = true
      this._messageWindow!.active = true
    }
  }

  interceptCancel(): boolean {
    if (!this._selecting) {
      this.setSelect(true)
      return true
    }
    return false
  }
}
