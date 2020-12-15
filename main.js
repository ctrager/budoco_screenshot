const {app, BrowserWindow, screen, ipcMain, desktopCapturer, contextBridge} = require('electron')
const fs = require('fs');

var main_win
var transparent_win

// Otherwise, transparent window won't be transparent
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');

function createWindow() {
    console.log("createWindow")
    main_win = new BrowserWindow({
        width: 1000,
        height: 680,
        alwaysOnTop: false, // not needed
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: `${__dirname}/preload.js`, // use a preload script
        }
    })

    main_win.loadFile('index.html')

}


function createTransparentWindow() {
    console.log("createTransparentWindow")
    transparent_win = new BrowserWindow({
        frame: false,
        fullScreen: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: `${__dirname}/preload.js`,
        }
    })

    transparent_win.loadFile('transparent.html')
    transparent_win.setFullScreen(true);
    transparent_win.setResizable(false);

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

max_width = 0
max_height = 0

// rederer.js telling us to launch transparent window
ipcMain.on('start-capture', (event, entire_or_region, delay, max_w, max_h) => {
    console.log("on start-capture", entire_or_region, delay, max_w, max_h)
    max_width = max_w
    max_height = max_h

    main_win.hide()

    // doing it async to give our window a chance to hide, because
    // we don't want it to be part of the captured image
    // The 600 millisecond delay seems to help give our window time to hide.
    setTimeout(
        function () {start_capture(entire_or_region, delay)},
        400)
})

function start_capture(entire_or_region, delay) {
    console.log("actual start_capture", entire_or_region, delay)

    if (entire_or_region == "region") {
        createTransparentWindow()
    }
    else {
        // entire
        milliseconds = delay * 1000
        setTimeout(function () {capture("entire")}, milliseconds)
    }
}




// this is the transparent window giving us what was selected
var selection_size
ipcMain.on('selected-region', (event, top, left, width, height) => {

    console.log("main selected-region", top, left, width, height);
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

            width = img.getSize().width
            height = img.getSize().height

            console.log("ORIGINAL SIZE", width, height)

            // resize, keep aspect ratio
            width_factor = 1
            height_factor = 1

            if (width > max_width) {
                width_factor = max_width / width
            }
            if (height > max_height) {
                height_factor = max_height / height
            }

            console.log("FACTORS", width_factor, height_factor)

            if (width_factor != 1 || height_factor != 1) {

                if (width_factor < height_factor) {
                    img = img.resize({
                        width: Math.floor(width * width_factor),
                        height: Math.floor(height * width_factor)
                    })
                }
                else {
                    img = img.resize({
                        width: Math.floor(width * height_factor),
                        height: Math.floor(height * height_factor)
                    })
                }
            }

            width = img.getSize().width
            height = img.getSize().height
            console.log("AFTER SIZE", width, height)

            //fs.writeFileSync("AFTER_RESIZE.png", img.toPNG())

            // Pass the image to renderer.js to display
            main_win.webContents.send('img-captured', img.toDataURL(), width, height);

            main_win.show()
            break
        }
    }).catch(function (e) {console.log(e)})

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

const CONFIG_FILE_NAME = "budoco_screenshot_config.txt"

ipcMain.on("read-config-file", (event, args) => {
    console.log("on read-config-file", args)
    if (fs.existsSync(CONFIG_FILE_NAME)) {
        text = fs.readFileSync(CONFIG_FILE_NAME, {encoding: "utf8"})
        main_win.webContents.send("config-file-contents", text);
    }

});


ipcMain.on("save-config", (event, contents) => {
    console.log("on save-config", contents)
    text = fs.writeFileSync(CONFIG_FILE_NAME, contents, {encoding: "utf8"})
});