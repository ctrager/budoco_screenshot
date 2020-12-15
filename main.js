const {app, BrowserWindow, screen, ipcMain, desktopCapturer} = require('electron')
const fs = require('fs');

var main_win
var transparent_win

// Otherwise, transparent window won't be transparent
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');


function createWindow() {
    console.log("inside createWindow")
    main_win = new BrowserWindow({
        width: 1000,
        height: 680,
        alwaysOnTop: false, // not needed
        webPreferences: {
            nodeIntegration: true
        }
    })

    main_win.loadFile('index.html')

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


// rederer.js telling us to launch transparent window
ipcMain.handle('start-capture', (event, entire_or_region, delay) => {
    console.log(entire_or_region, delay)

    main_win.hide()

    // doing it async to give our window a chance to hide, because
    // we don't want it to be part of the captured image
    // The 600 millisecond delay seems to help give our window time to hide.
    setTimeout(
        function () {start_capture(entire_or_region, delay)},
        600)
})

function start_capture(entire_or_region, delay) {
    console.log(entire_or_region, delay)

    if (entire_or_region == "region") {
        createTransparentWindow()
    }
    else {
        // entire
        milliseconds = delay * 1000
        setTimeout(function () {capture("entire")}, milliseconds)
    }
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


// this is the transparent window giving us what was selected
var selection_size
ipcMain.handle('selected', (event, top, left, width, height) => {

    console.log("main", top, left, width, height);
    selection_size = {x: left, y: top, width: width, height: height}
    console.log("selection size", selection_size);

    transparent_win.close()

    // give a chance for transparent window  to close
    setTimeout(function () {capture("region")}, 500)

})

// capture the screen and use the selected area to crop what we capture
function capture(entire_or_region) {

    var screen_size = screen.getPrimaryDisplay().workAreaSize
    console.log("screen size", screen_size)
    var options = {types: ['screen'], thumbnailSize: screen_size}
    var img

    //try {
    desktopCapturer.getSources(options).then(async sources => {
        for (const source of sources) {

            console.log(source)
            // We are assuming the first source is the right one

            // crop it
            if (entire_or_region == "region") {
                img = source.thumbnail.crop(selection_size)
            }
            else {
                img = source.thumbnail
            }

            // Pass the image to renderer.js to display
            main_win.webContents.send('img', img.toDataURL(), img.getSize().width, img.getSize().height);

            main_win.show()
            break
        }
    }).catch(function (e) {console.log(e)})

    //}
    // catch (e) {
    //     alert(e)
    // }
}


// // experiment with handling the selection window losing focus
// app.on('browser-window-blur', (event, win) => {
//     if (win == transparent_win) {
//         console.log("transparent_win");
//     }
//     if (win.webContents.isDevToolsFocused()) {
//         console.log('Ignore this case')
//     } else {
//         console.log('browser-window-blur', win.webContents.id)
//     }
// })