
const electron = require('electron');
const {ipcRenderer} = require('electron')


var myNotification

function show_notification() {
    myNotification = new Notification('Title', {
        body: 'Notification from the Renderer process'
    })

    myNotification.onclick = () => {
        console.log('Notification clicked')
    }
}

function talk_to_main() {
    console.log("sending...");
    ipcRenderer.invoke('my-action', "msg1")
}

function start_timer() {
    setTimeout(talk_to_main2, 3000)
}

function talk_to_main2() {
    console.log("sending...");
    ipcRenderer.invoke('my-action2', "msg2")
}

function hide() {
    console.log("sending...");
    // tell main to hide me
    ipcRenderer.invoke('my-action2', "hide")

    // 3 seconds later, tell main to show me
    setTimeout(show, 3000)

}

function show() {
    console.log("timeout callback")
    ipcRenderer.invoke('my-action2', "show")
}
