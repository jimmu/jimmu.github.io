"use strict";
import {p5instance as p5} from './lib.js'

export function newGui(){

    const scales = {x:1, y:1}
    const textSize = 1/80   // Fraction of the screen width
    const elements = []

    return {
        setup,
        draw,
        addElement
    }

    function setup(){
    }

    function draw(){
        p5.push()
        let characterSize = p5.windowWidth * textSize * scales.x
        p5.translate(characterSize, characterSize)
        p5.noStroke()
        p5.fill(200)
        p5.textStyle(p5.BOLD)
        p5.textFont("Courier New")
        p5.textSize(characterSize)
        let rowNum = 1
        for (let element of elements){
            let text = element.label
            if (element.valueFunction){
                text += element.valueFunction()
            }
            p5.text(text, 0, characterSize * rowNum)
            rowNum++
        }
        p5.pop()
    }

    function addElement(label, valueFunction){
        elements.push({label, valueFunction})
    }
}