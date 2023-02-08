import { Buffer } from './buffer'

export default class ImmunotoxicityBuffer implements Buffer {
  owner = 0
  turns = 0
  turnsDownEveryTurn?: (() => string) | undefined

  execute() {
    return ''
  }

  clone(): Buffer {
    return new ImmunotoxicityBuffer()
  }
}
