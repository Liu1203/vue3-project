import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('counter store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始 count 为 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })

  it('doubleCount 是 count 的两倍', () => {
    const store = useCounterStore()
    expect(store.doubleCount).toBe(0)
    store.count = 5
    expect(store.doubleCount).toBe(10)
  })

  it('increment 使 count 加 1', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
    store.increment()
    expect(store.count).toBe(2)
  })
})
