import { promisify } from './utils'

export interface Settings {
  speed: number
}

type State = 'inactive' | 'paused' | 'active'

export class Carousel {
  private settingsInternal: Settings = {
    speed: 10000,
  }
  private timerId?: number
  private windowIdInternal?: number
  private stateInternal: State = 'inactive'
  constructor(private onError: (error: Error) => void) {}

  public start(windowId: number) {
    if (this.stateInternal !== 'inactive') {
      throw new Error('Already started')
    }
    this.windowIdInternal = windowId
    this.stateInternal = 'paused'
  }

  public stop() {
    if (this.stateInternal === 'inactive') {
      console.warn('Already stopped')
      return
    }
    this.stateInternal = 'inactive'
    this.windowIdInternal = undefined
    this.clearSchedule()
  }

  public pause() {
    if (this.stateInternal !== 'active') {
      return
    }
    this.stateInternal = 'paused'
    this.clearSchedule()
  }

  public resume() {
    if (this.stateInternal !== 'paused') {
      return
    }
    this.stateInternal = 'active'
    this.scheduleFocusShift()
  }

  public get settings() {
    return this.settingsInternal
  }
  public set settings(newSettings: Settings) {
    this.settingsInternal = newSettings
  }

  public get state() {
    return this.stateInternal
  }

  public get windowId() {
    return this.windowIdInternal
  }

  private async focusNextTab() {
    try {
      if (this.windowIdInternal === undefined) {
        throw new Error('windowId is not set!')
      }

      const tabs = await promisify(
        chrome.tabs.query.bind(chrome.tabs, {
          windowId: this.windowIdInternal,
        }),
      )

      if (!tabs.length) {
        return
      }

      const activeTabI = tabs.findIndex(({ active }) => active)

      let nextActiveTabI = activeTabI + 1
      if (nextActiveTabI >= tabs.length) {
        nextActiveTabI = 0
      }
      const nextActiveTab = tabs[nextActiveTabI]

      await promisify(
        chrome.tabs.update.bind(chrome.tabs, nextActiveTab.id!, {
          active: true,
        }),
      )
    } catch (error) {
      this.onError(error)
    }
  }

  private scheduleFocusShift() {
    this.clearSchedule()

    this.timerId = setTimeout(async () => {
      await this.focusNextTab()
      this.scheduleFocusShift()
    }, this.settingsInternal.speed)
  }

  private clearSchedule() {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = undefined
    }
  }
}
