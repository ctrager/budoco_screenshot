const {app, BrowserWindow, screen} = require('electron')
const {ipcMain} = require('electron');
const {desktopCapturer} = require('electron')
const fs = require('fs');

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


ipcMain.handle('start-capture-region', (event, arg) => {
    main_win.hide()
    setTimeout(createTransparentWindow(), 100)

})

var selection_size
ipcMain.handle('selected', (event, top, left, width, height) => {

    console.log("main", top, left, width, height);
    selection_size = {x: left, y: top, width: width, height: height}

    transparent_win.close()

    // give a chance for transparent window  to close
    setTimeout(capture, 500)

})

function capture() {
    var screen_size = screen.getPrimaryDisplay().workAreaSize
    console.log("screen size", screen_size)
    console.log("selection size", selection_size);
    var options = {types: ['screen'], thumbnailSize: screen_size}

    desktopCapturer.getSources(options).then(async sources => {
        for (const source of sources) {
            console.log(source)
            // We are assuming the first source is the right one

            // crop it
            cropped = source.thumbnail.crop(selection_size)

            // save it
            try {
                fs.writeFile("MY_SCREENSHOT.PNG", cropped.toPNG(), handle_fs_error)
            }
            catch (e) {
                console.log("Error", e)
            }


            main_win.show()
            break
        }
    })
}


function handle_fs_error(error) {
    console.log("fs error", error);
}
