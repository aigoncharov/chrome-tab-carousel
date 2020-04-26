import { Carousel, Settings } from './carousel'
import { FocusListener } from './focusListener'
import { promisify } from './utils'

// TODO: Proper error handling
const carousel = new Carousel((error) => {
  console.error(error)
})
const focusListener = new FocusListener((isFocused) => (isFocused ? carousel.pause() : carousel.resume()))

const enable = async () => {
  const window = await promisify(chrome.windows.getCurrent.bind(chrome.windows, {}))

  carousel.start(window.id)
  focusListener.start(window.id)

  await promisify(chrome.browserAction.setBadgeText.bind(chrome.browserAction, { text: 'ON' }))
}

const disable = async () => {
  carousel.stop()
  focusListener.stop()

  await promisify(chrome.browserAction.setBadgeText.bind(chrome.browserAction, { text: '' }))
}

chrome.browserAction.onClicked.addListener(() => {
  if (carousel.state === 'inactive') {
    enable()
  } else {
    disable()
  }
})

chrome.windows.onRemoved.addListener((closedWindowId) => {
  if (carousel.windowId === closedWindowId) {
    disable()
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  const settings = (await promisify(chrome.storage.sync.get.bind(chrome.storage.sync, null))) as Partial<Settings>

  if (!Object.keys(settings).length) {
    await promisify(chrome.storage.sync.set.bind(chrome.storage.sync, carousel.settings))
    return
  }

  carousel.settings = settings as Settings
})

chrome.storage.onChanged.addListener(async (changes) => {
  const changesTyped = changes as { [Key in keyof Settings]: chrome.storage.StorageChange }

  carousel.settings = {
    speed: changesTyped.speed.newValue,
  }
})
