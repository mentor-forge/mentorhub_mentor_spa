import { beforeEach } from 'vitest'

/**
 * Node 24+ can expose a broken global `localStorage` (missing Storage methods) when
 * web storage is enabled without a valid `--localstorage-file`. Vitest/jsdom then
 * inherits that object instead of a real Storage implementation.
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
  }
}

function ensureStorage(name: 'localStorage' | 'sessionStorage'): Storage {
  const current = globalThis[name] as Storage | undefined
  if (current && typeof current.clear === 'function' && typeof current.getItem === 'function') {
    return current
  }
  const storage = createMemoryStorage()
  Object.defineProperty(globalThis, name, {
    value: storage,
    configurable: true,
    writable: true,
  })
  return storage
}

const localStorageRef = ensureStorage('localStorage')
ensureStorage('sessionStorage')

beforeEach(() => {
  localStorageRef.clear()
})
