"use strict";

import {p5instance as p5} from './lib.js'

const resizableClass = "__resizable"
const idField = resizableClass+"Id"

const sizeFunctions = new Map()

export function makeResizable(element, width, height, fontSize, xPos, yPos){
    element.addClass(resizableClass)
    let id = crypto.randomUUID()
    element.attribute(idField, id)
    sizeFunctions.set(id, {width, height, fontSize, xPos, yPos})
    return element
}

export function resize(){
    for (let resizable of p5.selectAll("."+resizableClass)){
        let sizeFns = sizeFunctions.get(resizable.attribute(idField))
        if (sizeFns.width){
            if (sizeFns.height){
                resizable.size(sizeFns.width(), sizeFns.height())
            }
            else {
                resizable.size(sizeFns.width())
            }
        }
        if (sizeFns.fontSize){
            setFontSize(resizable, sizeFns.fontSize())
        }
        if (sizeFns.xPos){
            resizable.position(sizeFns.xPos(), sizeFns.yPos())
        }
    }
}

function setFontSize(element, size){
    let fontSize = Math.floor(size)
    element.style('font-size', fontSize+"px")
}