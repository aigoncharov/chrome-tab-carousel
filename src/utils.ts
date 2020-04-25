export const promisify = <T>(fn: (cb: (res?: T) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      fn((res) => {
        if (!res) {
          reject(chrome.runtime.lastError ?? 'Unknown error')
          return
        }
        resolve(res)
      })
    } catch (error) {
      reject(error)
    }
  })
