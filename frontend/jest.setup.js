import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock File API
global.File = class MockFile {
  constructor(bits, name, options) {
    this.name = name
    this.size = bits.length
    this.type = options?.type || 'text/plain'
  }
}

// Mock FormData
global.FormData = class MockFormData {
  constructor() {
    this.data = new Map()
  }
  append(key, value) {
    this.data.set(key, value)
  }
  get(key) {
    return this.data.get(key)
  }
  has(key) {
    return this.data.has(key)
  }
  delete(key) {
    this.data.delete(key)
  }
  entries() {
    return this.data.entries()
  }
  keys() {
    return this.data.keys()
  }
  values() {
    return this.data.values()
  }
  forEach(callback) {
    this.data.forEach(callback)
  }
} 