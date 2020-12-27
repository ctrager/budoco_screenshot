"use strict"

// from https://github.com/electron/electron/issues/9920#issuecomment-575839738

// https://github.com/electron/electron/issues/23506


const {
    contextBridge,
    ipcRenderer
} = require("electron");

console.log("in preload.js")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {

    send: (channel, ...args) => {

        // whitelist channels
        let validChannels = [
            "selected-region",
            "start-capture",
            "read-config-file",
            "save-config"];

        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },

    receive: (channel, func) => {

        let validChannels = ["img-captured", "config-file-contents"];

        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
