"use strict";

import {p5instance as p5} from './lib.js'

const resizableClass = "__resizable"
const sizeFunctions = new Map()

export function makeResizable(element, sizeFns){
    element.addClass(resizableClass)
    if (!element.id()){
        element.id(crypto.randomUUID())
    }
    sizeFunctions.set(element.id(), sizeFns)
    return element
}

export function resize(){
    for (let resizable of p5.selectAll("."+resizableClass)){
        let sizeFns = sizeFunctions.get(resizable.id())
        if (sizeFns.width){
            resizable.size(sizeFns.width(), sizeFns.height?.())
        }
        if (sizeFns.fontSize){
            resizable.style('font-size', Math.floor(sizeFns.fontSize())+"px")
        }
        if (sizeFns.xPos){
            resizable.position(sizeFns.xPos(), sizeFns.yPos())
        }
    }
}
