"use strict"

const hRule = document.getElementById("h-rule");
const vRule = document.getElementById("v-rule");
const region = document.getElementById("region");
var is_selecting = false;
var startPoint;
var endPoint;

// MOUSE MOVE, draw the selection rectangle
document.addEventListener("mousemove", (e) => {
    calc_selected_region(e)
});

// Calc and draw the rectangle
function calc_selected_region(e) {
    hRule.style.top = `${e.pageY}px`;
    vRule.style.left = `${e.pageX}px`;

    if (is_selecting) {

        endPoint = {
            pageX: e.pageX,
            pageY: e.pageY
        };

        region.style.top = (num(startPoint.pageY) < num(endPoint.pageY) ? startPoint.pageY : endPoint.pageY) + "px"
        region.style.left = (num(startPoint.pageX) < num(endPoint.pageX) ? startPoint.pageX : endPoint.pageX) + "px"
        region.style.width = Math.abs(num(endPoint.pageX) - num(startPoint.pageX)) + "px"
        region.style.height = Math.abs(num(endPoint.pageY) - num(startPoint.pageY)) + "px"

        console.log('moving', region.style.top, region.style.left, region.style.width, region.style.height)
    }
}


// MOUSE DOWN, start selecting, start drawing rect
document.addEventListener("mousedown",
    (e) => {
        e.preventDefault();

        is_selecting = true;

        startPoint = {
            pageX: e.pageX,
            pageY: e.pageY
        };

        console.log("Starting", startPoint);

        calc_selected_region(e)

        region.style.display = "block";

    });

// MOUSE UP, end selection
document.addEventListener("mouseup", (e) => {
    e.preventDefault();

    console.log('selected', region.style.top, region.style.left, region.style.width, region.style.height)
    if (isNaN(num(region.style.top))) {
        // this can happen if mouseup occurs before other events
        return;
    }
    // tell main.js what our selection is.
    window.api.send('selected-region', num(region.style.top), num(region.style.left), num(region.style.width), num(region.style.height))

    // The following doesn't actually matter because main.js is going to close this window.
    // but just in case, here's how to get back to an initial state.
    // Reset
    is_selecting = false;
    region.style.width = "0px";
    region.style.height = "0px";
    region.style.display = "none";
});

// strip off "px"
function num(n) {
    return parseInt(n, 10);
}