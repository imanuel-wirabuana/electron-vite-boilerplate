import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type UpdateChannel =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'progress'
  | 'downloaded'
  | 'error'

export interface UpdatePayloadMap {
  checking: void
  available: { version: string }
  'not-available': { version: string }
  progress: { percent: number }
  downloaded: { version: string }
  error: { message: string }
}

export type UpdateEventMessage<C extends UpdateChannel = UpdateChannel> = {
  channel: C
  payload: UpdatePayloadMap[C]
}

const EVENT_CHANNEL = 'update:event'
const CHECK_CHANNEL = 'updater:check'
const INSTALL_CHANNEL = 'updater:install'
const VERSION_CHANNEL = 'updater:getVersion'

export interface UpdaterApi {
  checkForUpdates: () => Promise<void>
  quitAndInstall: () => Promise<void>
  getVersion: () => Promise<string>
  onUpdateEvent: (
    listener: (message: UpdateEventMessage) => void
  ) => () => void
}

const api: UpdaterApi = {
  checkForUpdates: () => ipcRenderer.invoke(CHECK_CHANNEL),
  quitAndInstall: () => ipcRenderer.invoke(INSTALL_CHANNEL),
  getVersion: () => ipcRenderer.invoke(VERSION_CHANNEL),
  onUpdateEvent: (listener) => {
    const subscription = (
      _event: IpcRendererEvent,
      message: UpdateEventMessage
    ): void => listener(message)
    ipcRenderer.on(EVENT_CHANNEL, subscription)
    return () => {
      ipcRenderer.off(EVENT_CHANNEL, subscription)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('updater', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.updater = api
}