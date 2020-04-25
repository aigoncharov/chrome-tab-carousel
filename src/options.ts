import { promisify } from './utils'
import { Settings } from './carousel'

const intervalInput = document.getElementById('interval') as HTMLInputElement
const saveButton = document.getElementById('save') as HTMLButtonElement

let settings: Settings

const save = async () => {
  const newInterval = parseInt(intervalInput.value)

  if (!isNaN(newInterval) && newInterval > 0) {
    await promisify(
      chrome.storage.sync.set.bind(chrome.storage.sync, {
        ...settings,
        speed: newInterval,
      }),
    )
  }
}

const restore = async () => {
  settings = (await promisify(chrome.storage.sync.get.bind(chrome.storage.sync, null))) as Settings

  intervalInput.disabled = false
  intervalInput.value = settings.speed.toString()

  saveButton.disabled = false
}

document.addEventListener('DOMContentLoaded', restore)
saveButton.addEventListener('click', save)
