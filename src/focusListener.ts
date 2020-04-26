import { promisify } from './utils'

export class FocusListener {
  private targetWindowId?: number
  private unsubscribe?: () => void

  constructor(private readonly onFocusCheck: (isFocused: boolean) => void) {}

  public async start(targetWindowId: number) {
    this.unsubscribe?.()

    this.targetWindowId = targetWindowId

    this.listenWindowFocusChange()
  }

  public stop() {
    this.unsubscribe?.()
    this.targetWindowId = undefined
  }

  private listenWindowFocusChange() {
    const onFocusChanged = () => this.checkFocusUpdate()
    chrome.windows.onFocusChanged.addListener(onFocusChanged)

    const intervalId = setInterval(() => this.checkFocusUpdate(), 100)

    this.unsubscribe = () => {
      clearInterval(intervalId)
      chrome.windows.onFocusChanged.removeListener(onFocusChanged)
    }
  }

  private async checkFocusUpdate() {
    if (this.targetWindowId === undefined) {
      return
    }

    const targetWindow = await promisify(chrome.windows.get.bind(chrome.windows, this.targetWindowId, {}))
    this.onFocusCheck(targetWindow.focused)
  }
}
