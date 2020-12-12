const {app, BrowserWindow} = require('electron')
const electron = require('electron')
const {ipcMain} = require('electron');
const {desktopCapturer} = require('electron')

var main_win
var transparent_win

// Otherwise, transparent window won't be transparent
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');


function createWindow() {
    console.log("inside createWindow")
    main_win = new BrowserWindow({
        width: 300,
        height: 300,
        alwaysOnTop: false, // not needed
        webPreferences: {
            nodeIntegration: true
        }
    })

    main_win.loadFile('index.html')

}

function createTransparentWindow() {
    transparent_win = new BrowserWindow({
        frame: false,
        fullScreen: true,
        xwidth: 600,
        xheight: 400,
        transparent: true,
        webPreferences: {
            nodeIntegration: true

        }
    })

    transparent_win.loadFile('transparent.html')
    transparent_win.setFullScreen(true);
}

// boiler plate
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

// end boiler plate


ipcMain.handle('show-transparent', (event, arg) => {
    createTransparentWindow()
})

ipcMain.handle('selected', (event, top, left, width, height) => {

    console.log("main", top, left, width, height);
    transparent_win.close()
})

