import { promisify } from './utils'

export class FocusListener {
  private state?: { targetWindowId: number; focused: boolean }

  constructor(private readonly onTargetWindowFocusChange: (isFocused: boolean) => void) {
    this.listenWindowFocusChange()
  }

  public async setTargetWindow(targetWindowId: number) {
    const targetWindow = await promisify(chrome.windows.get.bind(chrome.windows, targetWindowId, {}))
    this.state = {
      targetWindowId,
      focused: targetWindow.focused,
    }
  }

  private listenWindowFocusChange() {
    chrome.windows.onFocusChanged.addListener(() => this.checkFocusUpdate())
    setInterval(() => this.checkFocusUpdate(), 100)
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
