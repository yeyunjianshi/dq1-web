export interface Storage {
  save(key: string, val: string): void
  read(key: string): string | null
  remove(key: string): void
  clear(): void
}

export class LocalStorage implements Storage {
  save(key: string, val: string): void {
    localStorage.setItem(key, val)
  }

  read(key: string): string | null {
    return localStorage.getItem(key)
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

export let storage: Storage = new LocalStorage()

export function setStorage(s: Storage) {
  storage = s
}
export default storage
