"use strict";
import {p5instance as p5} from './lib.js'

const leftKey="a".toUpperCase().charCodeAt(0) // 65 -> "a" keycode
const rightKey="s".toUpperCase().charCodeAt(0) // 68 -> "d" keycode
const upKey="p".toUpperCase().charCodeAt(0)
const downKey="l".toUpperCase().charCodeAt(0)

// TODO. Different touch controls.
// L/R buttons on the left. Thrust button on the right
// Visible buttons on the GUI layer? Only shown after a touch is detected?
//export function newControls(){
//    return {
//        directions,
//        setup,
//        draw
//    }

export function setup(){
        // draw the area where we'll look for
//        let leftRightContainer = p5.createElement("div")
//        let left = p5.createElement("span", "Left")
//        let right = p5.createElement("span", "Right")
//        leftRightContainer.child(left)
//        leftRightContainer.child(right)
}

export function draw(){
    // TODO. Only draw the controls if touch is being used.
    p5.push()
    p5.fill(50)
    p5.noStroke()
    p5.rect(0, p5.height - 100, 100, 100)
    p5.rect(120, p5.height - 100, 100, 100)
    p5.rect(p5.width-220, p5.height-100, 220, 100)
    p5.pop()
}

// Return a single direction object containing left/right/up/down as values from 0 to 1?
export function directions(){
    let touchDirections = checkTouches()
    return {
        left: touchDirections.left + leftPressed()? 1 : 0,
        right: touchDirections.right + rightPressed()? 1 : 0,
        up: touchDirections.up + upPressed()? 1 : 0,
        down: touchDirections.down + downPressed()? 1 : 0
    }
}

function leftPressed(){
    return p5.keyIsDown(leftKey) || p5.keyIsDown(p5.LEFT_ARROW)
}

function rightPressed(){
    return p5.keyIsDown(rightKey) || p5.keyIsDown(p5.RIGHT_ARROW)
}

function upPressed(){
    return p5.keyIsDown(upKey) || p5.keyIsDown(p5.UP_ARROW)
}

function downPressed(){
    return p5.keyIsDown(downKey) || p5.keyIsDown(p5.DOWN_ARROW)
}

function checkTouches(){
    let directions = {left: 0, right: 0, up: 0, down: 0}
    for (let touch of p5.touches){
        // Touch.x/y are relative to the top left of the canvas.
        // Touch.winX/Y are relative to the browser
        // Either way, let's divide the space into left quarter and right quarter
        // and the middle half into top and bottom
        if (touch.y > p5.height - 100){
            if (touch.x < 100){
                directions.left = 1
            }
            else if (touch.x > 120 && touch.x < 220){
                directions.right = 1
            }
            else if (touch.x > p5.width - 220){
                directions.up = 1
            }
        }
//        if (touch.winX > p5.windowWidth * 0.75){
//            directions.right = 1
//        }
//        else if (touch.winX < p5.windowWidth * 0.25){
//            directions.left = 1
//        }
//        else if (touch.winY < p5.windowHeight/2){
//            directions.up = 1
//        }
//        else if (touch.winY > p5.windowHeight/2){
//            directions.down = 1
//        }
    }
    return directions
}
