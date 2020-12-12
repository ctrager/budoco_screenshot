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

var selection_size
ipcMain.handle('selected', (event, top, left, width, height) => {

    console.log("main", top, left, width, height);
    selection_size = {x: top, y: left, width: width, height: height}

    transparent_win.close()
    main_win.hide()

    // give a chance for our windows to close
    setTimeout(capture, 1000)

})

function capture() {
    var screen_size = screen.getPrimaryDisplay().workAreaSize
    console.log("screen size", screen_size)
    console.log("selection size", selection_size);
    var options = {types: ['screen'], thumbnailSize: screen_size}

    desktopCapturer.getSources(options).then(async sources => {
        for (const source of sources) {
            cropped = source.thumbnail.crop(selection_size)
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

/*
function determineScreenShotSize() {
    const screenSize = screen.getPrimaryDisplay().workAreaSize
    const maxDimension = Math.max(screenSize.width, screenSize.height)
    if (nativeCaptureValue.checked == true) {
        return {
            width: maxDimension * window.devicePixelRatio,
            height: maxDimension * window.devicePixelRatio
        }
    } else {
        return {
            width: screenSize.width * window.devicePixelRatio,
            height: screenSize.height * window.devicePixelRatio
        }
    }
}
*/

