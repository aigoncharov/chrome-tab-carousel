import { promisify } from './utils'

export class FocusListener {
  private state?: { targetWindowId: number; focused: boolean }
  private unsubscribe?: () => void

  constructor(private readonly onTargetWindowFocusChange: (isFocused: boolean) => void) {}

  public async start(targetWindowId: number) {
    this.unsubscribe?.()

    this.state = {
      targetWindowId,
      focused: true,
    }

    this.listenWindowFocusChange()
  }

  public stop() {
    this.unsubscribe?.()
    this.state = undefined
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
    if (!this.state) {
      return
    }

    const targetWindow = await promisify(chrome.windows.get.bind(chrome.windows, this.state.targetWindowId, {}))

    if (targetWindow.focused !== this.state.focused) {
      this.state.focused = targetWindow.focused
      this.onTargetWindowFocusChange(targetWindow.focused)
    }
  }
}
