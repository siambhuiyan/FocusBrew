const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getStoreValue: (key) => ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key, value) =>
    ipcRenderer.invoke("set-store-value", key, value),
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  showOverlay: () => ipcRenderer.invoke("show-overlay"),
  hideOverlay: () => ipcRenderer.invoke("hide-overlay"),
  minimizeToTray: () => ipcRenderer.invoke("minimize-to-tray"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
