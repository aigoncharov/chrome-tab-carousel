import { Carousel } from './carousel'
import { FocusListener } from './focusListener'

// TODO: Proper error handling
const carousel = new Carousel((error) => {
  console.error(error)
})
const focusListener = new FocusListener((isFocused) => {
  if (isFocused) {
    if (carousel.state !== 'active') {
      return
    }
    carousel.pause()
  } else {
    if (carousel.state !== 'paused') {
      return
    }
    carousel.resume()
  }
})

chrome.browserAction.onClicked.addListener(() => {
  if (carousel.state === 'inactive') {
    chrome.browserAction.setBadgeText({ text: 'ON' })
    chrome.windows.getCurrent((window) => {
      carousel.start(window.id)
      focusListener.setTargetWindow(window.id)
    })
  } else {
    chrome.browserAction.setBadgeText({ text: '' })
    carousel.stop()
  }
})
