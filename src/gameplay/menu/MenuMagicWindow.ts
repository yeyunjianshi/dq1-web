import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import { audio, flashing, message, setInputType } from '../events/EventExector'
import ListComponent, {
  KeyValueAdapter,
} from '../../engine/components/ListComponent'
import { useTextPostProcessing } from '../../engine/helper'
import { globalGameData, InputType } from '../asset/gameData'
import Magic from '@gameplay/asset/magic'
import TextComponent from '@engine/components/TextComponent'
import { Audios } from '@gameplay/audio/AudioConfig'

@GameplayComponent
export default class MenuMagicWindow extends BaseWindow {
  private _selectWindow?: ListComponent
  private _mpText?: TextComponent

  start() {
    this._selectWindow = this.root.getComponentInChildByName(
      'menuMagicSelectWindow',
      ListComponent
    ) as ListComponent

    this._mpText = this.root.getComponentInChildByName(
      'menuMagicMPText',
      TextComponent
    ) as TextComponent

    this.enable = false
    this._selectWindow!.enable = false

    this.init()
  }

  private _data = [] as Magic[]

  private init() {
    this._data = []
    const _adapter = new KeyValueAdapter([])

    this._selectWindow!.setAdapter(_adapter)
    this._selectWindow!.addSelectListener((_, pos) => {
      const selectedMagic = this._data[pos]
      const hero = globalGameData.hero

      if (hero.MP < selectedMagic.cost) {
        message(this.engine.i18n.getTextValue('NotEnoughMP'))
        return
      }

      hero.MP -= selectedMagic.cost
      audio().playME(Audios.Magic)
      flashing({ duration: 400, times: 2, color: '#EEEEEE88' })

      const usePrefix = `{name}使用了${selectedMagic.name}`

      const useText =
        (selectedMagic.useCommonTime === 'after'
          ? ''
          : selectedMagic.useInCommon()) ||
        selectedMagic.useCommonText ||
        ''

      message(
        useTextPostProcessing(`${usePrefix}\n${useText}`, hero.name),
        async () => {
          if (selectedMagic.useCommonTime === 'after') {
            setInputType(InputType.Move)
            const useText = selectedMagic.useInCommon()
            if (useText.length > 0) {
              await message(useTextPostProcessing(useText, hero.name))
            }
          }
        }
      )
      this.refreshData()
    })
    this.refreshData()
  }

  private refreshData() {
    this._mpText!.setText(
      `${globalGameData.hero.MP} / ${globalGameData.hero.maxMP}`
    )

    this._data.splice(0, this._data.length)
    this._data.push(...globalGameData.hero.magicsInCommon)

    this._selectWindow!.adapter<KeyValueAdapter>()!.setData(
      this._data.map((m) => ({
        key: m.name,
        value: `${m.cost}`,
      }))
    )
  }

  show(init?: boolean) {
    super.show(init)
    this.refreshData()
    this._selectWindow?.setCursorIndex(0)
  }

  update(): void {
    this._selectWindow?.update()
  }
}
