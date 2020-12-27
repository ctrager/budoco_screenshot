"use strict"


/*
var myNotification

function show_notification() {
    myNotification = new Notification('Title', {
        body: 'Notification from the Renderer process'
    })

    myNotification.onclick = () => {
        console.log('Notification clicked')
    }
}
*/

// Tell main.js to launch the transparent.html, to select a region.
function capture() {
    var entire_or_region = document.getElementById("entire").checked ? "entire" : "region"
    var delay = document.getElementById("delay_input").value

    // send max height, width so that main can do the resize
    var image_frame = document.getElementById("image_frame")

    var room_for_border = 6
    var max_width = num(image_frame.offsetWidth) - room_for_border
    var max_height = num(image_frame.offsetHeight) - room_for_border

    console.log("max", max_width, max_height)

    window.api.send('start-capture', entire_or_region, delay, max_width, max_height)
}

var saved_data_url = null
var canvas = null
var context = null

// Receive the image from main.js and display it in canvas
window.api.receive("img-captured", (data_url, width, height) => {

    saved_data_url = data_url

    canvas = document.getElementById("canvas")
    context = canvas.getContext('2d')

    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // resize canvas for incoming image
    canvas.width = width;
    canvas.height = height;

    // create invisible image
    var new_img = new Image();
    new_img.src = data_url;

    new_img.onload = function () {
        /// draw image to canvas
        context.drawImage(this, 0, 0) //  width, height) // , 0, 0, width, height);
        canvas.style.display = "inline-block"

        context.lineWidth = 3;

        // get ready for drawing
        document.getElementById("click_on_image").className = ""
        document.getElementById("color_select").disabled = false;
        canvas.onmousedown = canvas_mousedown
        canvas.onmousemove = canvas_mousemove
        canvas.onmouseup = canvas_mouseup
        canvas.addEventListener("mouseleave", canvas_mouseup);
        canvas.addEventListener("mouseenter", (e) => {
            if (e.buttons === 0) {
                return;
            }

            canvas_mousedown();
        });
    }

})

var drawing_mode = false

function canvas_mousedown(e) {
    color_select = document.getElementById("color_select")
    color = color_select.options[color_select.selectedIndex]
    context.strokeStyle = color.innerText

    drawing_mode = true
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
}

function canvas_mousemove(e) {
    if (!drawing_mode)
        return;

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
}

function canvas_mouseup(e) {
    if (!drawing_mode)
        return;

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();

    drawing_mode = false;
}

// user hit button to submit to budoco
function submit_form() {
    var url = document.getElementById("url").value
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value
    var description = document.getElementById("description").value
    var image_data = document.getElementById("canvas").toDataURL()

    if (url == "") {
        alert("URL is required")
        return
    }
    if (username == "") {
        alert("Username is required")
        return
    }
    if (password == "") {
        alert("Password is required")
        return
    }

    if (image_data == "") {
        alert("You don't seem to have taken a screenshot yet")
        return
    }

    if (description == "") {
        alert("Description is required")
        return
    }

    var params = "username=" + encodeURIComponent(username)
        + "&password=" + encodeURIComponent(password)
        + "&description=" + encodeURIComponent(description)
        + "&image_data=" + encodeURIComponent(image_data)

    ajaxPost(url, params, description);

}

// post to budoco
function ajaxPost(url, params, description) {

    var http = new XMLHttpRequest();

    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        console.log("onreadystatechange", http.readyState, http.status);
        console.log(http.readyState)
        console.log(http.status)

        if (http.readyState == 4) {
            document.getElementById("sending").style.display = "none"
            if (http.status == 200) {
                console.log(http.response)
                try {
                    var result = JSON.parse(http.response)
                    alert("Success!\n" + "Created Issue #" + result.issue_id)
                }
                catch (e) {
                    alert("Unexpected error: " + e);
                }
            }
            else {
                console.log(http.response)
                alert("failure\n" + http.status)
            }
        }
    }

    document.getElementById("sending").style.display = "block"
    setTimeout(function () {http.send(params)}, 100);
}

function handle_entire_or_region(el) {
    if (el.value == "entire") {
        document.getElementById("delay_label").className = ""
        document.getElementById("delay_input").disabled = false;
    }
    else {
        document.getElementById("delay_label").className = "disabled"
        document.getElementById("delay_input").disabled = true;

    }
}


function on_load() {
    console.log("sending read-config-file")
    window.api.send("read-config-file")
}

// read contents of config file
window.api.receive("config-file-contents", (text) => {
    console.log(text)
    var config = JSON.parse(text)
    document.getElementById("url").value = config.url
    document.getElementById("username").value = config.username
    document.getElementById("password").value = config.password
})



function save_configuration() {

    var save_password = document.getElementById("save_password").checked
    if (save_password) {
        if (!confirm("Your password will be saved in a file unencrypted.\n" +
            "Are you sure you want to save your password?")) {
            return
        }
    }
    var url = document.getElementById("url").value
    var username = document.getElementById("username").value
    var password = ""

    if (save_password) {
        password = document.getElementById("password").value
    }

    var config =
    {
        url: url,
        username: username,
        password: password
    }

    // save it, just for fun
    window.api.send("save-config", JSON.stringify(config))

    const CONFIG_FILE_NAME = "budoco_screenshot_config.txt"

    alert("Configuration was saved as " + CONFIG_FILE_NAME)

}


function num(n) {
    return parseInt(n, 10);
}
