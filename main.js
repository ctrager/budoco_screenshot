const {app, BrowserWindow} = require('electron')
const electron = require('electron')
const {ipcMain} = require('electron');
var win

app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');


function createWindow() {
    console.log("inside createWindow")
    win = new BrowserWindow({
        width: 800,
        height: 600,
        alwaysOnTop: false, // not needed
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

}

function createTransparentWindow() {
    const win = new BrowserWindow({
        frame: false,
        width: 400,
        height: 400,
        // fullScreen: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: true

        }
    })

    win.loadFile('transparent.html')
    // win.setFullScreen(true);
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
        init()
    }

})

ipcMain.handle('my-action', (event, arg) => {
    console.log("corey 1", arg)
})

ipcMain.handle('show-transparent', (event, arg) => {
    createTransparentWindow()
})


ipcMain.handle('my-action2', (event, arg) => {
    console.log("corey 2", arg)

    if (arg == "hide") {
        win.hide();
    }
    else if (arg == "show") {
        win.show();
        //win.focus(); // not needed
    }

})

///--enable-transparent-visuals --disable-gpu 
