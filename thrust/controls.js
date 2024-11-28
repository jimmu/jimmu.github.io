"use strict";
import {p5instance as p5} from './lib.js'

const leftKey="a".toUpperCase().charCodeAt(0) // 65 -> "a" keycode
const rightKey="s".toUpperCase().charCodeAt(0) // 68 -> "d" keycode
const upKey="p".toUpperCase().charCodeAt(0)
const downKey="l".toUpperCase().charCodeAt(0)

export function newControls(){
    return {
        leftPressed, rightPressed, upPressed, downPressed, directions
    }

    // Return a single direction object containing left/right/up/down as values from 0 to 1?
    function directions(){
        return {
            left: leftPressed()? 1 : 0,
            right: rightPressed()? 1 : 0,
            up: upPressed()? 1 : 0,
            down: downPressed()? 1 : 0
        }
    }

    //TODO. Check the touches array too.
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
    }

}