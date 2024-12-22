"use strict";
import {p5instance as p5} from './lib.js'
import {render, point, translateScreen} from './shapes.js'
import {starDensity as density, maxStars, colours} from './config.js'

export function newBackdrop(){

    const reddish = {r: 220, g: 100, b: 100}
    const blueish = {r: 100, g: 100, b: 220}
    const white = {r: 200, g: 200, b: 200}
    let stars = []

    return {
        setup,
        draw
    }

    function setup(limits){
        let width = limits.right - limits.left
        let height = limits.bottom - limits.top
        // We'll produce stars at some given density. A number per unit area. But also limit it.
        let howManyStars = Math.min(density * width * height, maxStars)
        for (let i=0; i<howManyStars; i++){
            let thisStar = {
                x: limits.left + (width * Math.random()),
                y: limits.top + (height * Math.random()),
                z: Math.random()
            }
            let randomColour = Math.random()
            // Some reddish and some blueish.
            if (randomColour > 0.9){
                thisStar.colour = reddish
            }
            else if (randomColour > 0.8){
                thisStar.colour = blueish
            }
            else {
                thisStar.colour = white
            }
            stars.push(thisStar)
        }
    }

    function draw(groundOffsetX, groundOffsetY){
        p5.push()
        translateScreen(0, 0)   // Put the origin in the centre
        p5.background(colours.background)
        for (let star of stars){
            let scaleForDepth = star.z
            let scaleForParallax = 0.72 + scaleForDepth/4 // so we get range 0.7 - 0.97
            p5.strokeWeight(4 * scaleForDepth)
            p5.stroke(star.colour.r, star.colour.g, star.colour.b)
            render(point, [(star.x * scaleForDepth) + (groundOffsetX * scaleForParallax), (star.y * scaleForDepth) + (groundOffsetY * scaleForParallax)])
        }
        p5.pop()
    }
}