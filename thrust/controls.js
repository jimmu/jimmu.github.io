"use strict";
import {p5instance as p5} from './lib.js'

const leftKey="a".toUpperCase().charCodeAt(0) // 65 -> "a" keycode
const rightKey="s".toUpperCase().charCodeAt(0) // 68 -> "d" keycode
const upKey="p".toUpperCase().charCodeAt(0)
const downKey="l".toUpperCase().charCodeAt(0)

let touchEnabled = false

export function setup(){
}

export function enableTouch(){
    touchEnabled = true
}

export function draw(){
    if (touchEnabled){
        p5.push()
        p5.fill(50)
        p5.noStroke()
        let coords = getButtonCoords()
        p5.rect(coords.left.x, coords.left.y, coords.left.width, coords.left.height)
        p5.rect(coords.right.x, coords.right.y, coords.right.width, coords.right.height)
        p5.rect(coords.up.x, coords.up.y, coords.up.width, coords.up.height)
        p5.pop()
    }
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
    if (touchEnabled){
        let coords = getButtonCoords()
        for (let touch of p5.touches){
            // Touch.x/y are relative to the top left of the canvas.
            // Touch.winX/Y are relative to the browser
            // Either way, let's divide the space into left quarter and right quarter
            // and the middle half into top and bottom
            if (touch.y > coords.left.y){   // All buttons have the same y coord.
                if (touch.x > coords.left.x && touch.x < coords.left.x + coords.left.width){
                    directions.left = 1
                }
                else if (touch.x > coords.right.x && touch.x < coords.right.x + coords.right.width){
                    directions.right = 1
                }
                else if (touch.x > coords.up.x && touch.x < coords.up.x + coords.up.width){
                    directions.up = 1
                }
            }
        }
    }
    return directions
}

function getButtonCoords(){
    let smallButtonWidth = p5.width/5
    let height = p5.height/5
    let y = p5.height - height
    return {
        left: {x:0, y, width: smallButtonWidth, height},
        right: {x: smallButtonWidth, y, width: smallButtonWidth, height},
        up: {x: smallButtonWidth*3, y, width: smallButtonWidth*2, height}
    }
}
