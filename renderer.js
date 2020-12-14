
const {ipcRenderer} = require('electron')

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
    entire_or_region = document.getElementById("entire").checked ? "entire" : "region"
    delay = document.getElementById("delay_input").value
    ipcRenderer.invoke('start-capture', entire_or_region, delay)
}


// Receive the image from main.js
ipcRenderer.on('img', (event, data_url) => {
    // put image in img tag
    img_el = document.getElementById("img")
    img_el.src = data_url

    // put image in form too
    document.getElementById("image_data").value = data_url

    // show
    img.style.display = "block"
    document.getElementById("submit_button").style.display = "block"

})

// user hit button to submit to budoco
function submit_form() {
    var url = document.getElementById("url").value
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value
    var description = document.getElementById("description").value
    var image_data = document.getElementById("image_data").value

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
            if (http.status == 200) {
                console.log(http.status)
                alert("success\n" + http.response)
            }
            else {
                console.log(http.response)
                alert("failure\n" + http.status)
            }
        }
    }
    http.send(params);
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