import EventEmitter from './eventEmitter'

const DefaultLanguage = 'chinese'

export default class i18n {
  language: string
  values: Map<string, Map<string, string>>
  supportLanguages: string[]
  events = new EventEmitter()
  prefix: string

  constructor(
    defaultLanguage = DefaultLanguage,
    suppertLaunguages: string[] = [DefaultLanguage],
    values: { language: string; data: { key: string; value: string }[] }[] = [],
    prefix = 'S_'
  ) {
    this.supportLanguages = suppertLaunguages
    this.language = defaultLanguage
    this.prefix = prefix
    this.values = new Map()

    values.forEach((v) => {
      if (this.values.has(v.language)) {
        this.values.set(this.language, new Map())
      }
      const markers = this.values.get(this.language)!
      v.data.forEach((d) => markers.set(d.key, d.value))
    })
  }

  changeLanguage(language: string): void {
    if (this.supportLanguages.indexOf(language) < 0)
      console.error(`i18n Error: 不支持该语言`)
    this.language = language
    this.events.emit(this)
  }

  getValue(key: string): string {
    if (!key.startsWith(this.prefix)) return key

    return this.values.get(this.language)?.get(key.slice(key.length)) || key
  }
}
