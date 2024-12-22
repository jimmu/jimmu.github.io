"use strict";
import {p5instance as p5} from './lib.js'
import {colours} from './config.js'

export function newGui(){

    const textSize = 1/80   // Fraction of the screen width
    const elements = []
    let splashMessage
    let splashTimeout

    return {
        setup,
        draw,
        addElement,
        splash
    }

    function setup(){
    }

    function draw(){
        p5.push()
        let characterSize = Math.ceil(p5.windowWidth * textSize)
        p5.translate(characterSize, characterSize)
        p5.noStroke()
        p5.fill(colours.guiText)
        p5.textStyle(p5.BOLD)
        p5.textFont("Courier New", characterSize)
        let rowNum = 1
        for (let element of elements){
            let text = element.label
            if (element.valueFunction){
                text += element.valueFunction()
            }
            p5.text(text, 0, characterSize * rowNum)
            rowNum++
        }
        // Is there a message to put in big text in the middle?
        if (splashMessage){
            p5.textSize(characterSize*5)
            let stringWidth = p5.textWidth(splashMessage)
            p5.text(splashMessage, (p5.windowWidth-stringWidth)/2, p5.windowHeight/2)
        }
        p5.pop()
    }

    function addElement(label, valueFunction){
        elements.push({label, valueFunction})
    }

    function splash(message, timeoutSeconds){
        splashMessage = message
        if (!timeoutSeconds){
            timeoutSeconds = 0.5
        }
        if (splashTimeout){
            clearTimeout(splashTimeout)
        }
        splashTimeout = setTimeout(()=>{splashMessage = null}, timeoutSeconds*1000)
    }
}