
const electron = require('electron');
const {ipcRenderer} = require('electron')
const {desktopCapturer} = require('electron')


var myNotification

function show_notification() {
    myNotification = new Notification('Title', {
        body: 'Notification from the Renderer process'
    })

    myNotification.onclick = () => {
        console.log('Notification clicked')
    }
}

function capture_region() {
    ipcRenderer.invoke('start-capture-region')
}

function capture_entire_screen() {
    alert("not implemented")
}

function capture() {

    desktopCapturer.getSources({types: ['screen']}).then(async sources => {
        for (const source of sources) {
            console.log(source)
        }
    }
    )
}