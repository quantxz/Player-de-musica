const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

    selectMusics: () => {
        return ipcRenderer.invoke("selectMusics");
    },

    loadMusics: () => {
        return ipcRenderer.invoke("loadMusics");
    },

    openMusicFolder: () => {
        return ipcRenderer.invoke("openMusicFolder");
    }

});