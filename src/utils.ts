export const promisify = <T>(fn: (cb: (res?: T) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      fn((res) => {
        if (!res && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }
        resolve(res)
      })
    } catch (error) {
      reject(error)
    }
  })
