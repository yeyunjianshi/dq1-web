import EventEmitter from './eventEmitter'
import { Resource } from './resource'

export const LanguageSimplifiedChinese = 'simplified_chinese'
export const DefaultLanguage = LanguageSimplifiedChinese
export const DefaultSuppoertLanguage = [LanguageSimplifiedChinese]

export interface I18NEntry {
  key: string
  value: string
  infos?: Record<string, string>
}

export default class I18N {
  language: string = DefaultLanguage
  values: Map<string, I18NEntry> = new Map()
  supportLanguages: string[] = [DefaultLanguage]
  events = new EventEmitter()
  prefix = ''

  constructor(
    defaultLanguage = DefaultLanguage,
    suppertLaunguages: string[] = [DefaultLanguage],
    values: I18NEntry[] = [],
    prefix = ''
  ) {
    this.supportLanguages = suppertLaunguages
    this.prefix = prefix
    this.setLanguageAndEntries(defaultLanguage, values)
  }

  async changeLanguage(language: string) {
    if (this.supportLanguages.indexOf(language) === -1) {
      throw new Error(`i18n Error: 不支持 ${language}`)
    }
    const entries = await this.loadLanguageEntries(language)
    this.setLanguageAndEntries(language, entries)
  }

  async loadLanguageEntries(
    language: string,
    resouce?: IResource
  ): Promise<I18NEntry[]> {
    return await (resouce ?? new Resource()).loadJson<I18NEntry[]>(
      `i18n/${language}.json`
    )
  }

  setLanguageAndEntries(language: string, values: I18NEntry[]) {
    if (this.supportLanguages.indexOf(language) === -1) {
      throw new Error(`i18n Error: 不支持 ${language}`)
    }

    this.language = language
    values.forEach((v) => {
      if (v.key) {
        this.values.set(v.key, v)
      }
    })
    this.events.emit(this)
  }

  getEntryValue(key: string): I18NEntry {
    const defaultEntry = { key, value: key }
    if (!key.startsWith(this.prefix)) return defaultEntry
    return this.values.get(key) ?? defaultEntry
  }

  getTextValue(key: string): string {
    return this.getEntryValue(key).value
  }

  getEntriesByStartWith(key: string): I18NEntry[] {
    if (!key.startsWith(this.prefix)) return []
    return Array.from(this.values.values()).filter((v) => v.key.startsWith(key))
  }

  getEntries(pre?: (v: I18NEntry) => boolean): I18NEntry[] {
    return Array.from(this.values.values()).filter((v) => {
      return !pre || (pre && pre(v))
    })
  }
}
