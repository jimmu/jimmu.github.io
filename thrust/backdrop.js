"use strict";
import {p5instance as p5} from './lib.js'
import {render, point} from './shapes.js'

export function newBackdrop(){

    // TODO. Take size arguments - maybe derived from the level size.
    const size = {x:5, y:4}
    let stars = []
    let depths = []
    let colours = []

    return {
        setup,
        draw
    }

    function setup(howManyStars){
        if (!howManyStars){
            howManyStars = 500
        }
        for (let i=0; i<howManyStars; i++){
            stars.push(size.x * (Math.random()-0.5))   // x coord. Will be scaled to window width later
            stars.push(size.y * (Math.random()-0.5))   // y. likewise
            depths.push(Math.random())  // Depth. Won't be scaled.
            let randomColour = Math.random()
            // Some reddish and some blueish.
            if (randomColour > 0.9){
                colours.push({r: 220, g: 100, b: 100})
            }
            else if (randomColour > 0.8){
                colours.push({r: 100, g: 100, b: 220})
            }
            else {
                colours.push({r: 200, g: 200, b: 200})
            }
        }
    }

    function draw(groundOffsetX, groundOffsetY){
        p5.push()
        p5.background(30)
        for (let i=0; i < depths.length; i++){
            let scaleForDepth = depths[i]
            let scaleForParallax = 0.72 + scaleForDepth/4 // so we get range 0.7 - 0.97
            p5.strokeWeight(4 * scaleForDepth)
            p5.stroke(colours[i].r, colours[i].g, colours[i].b)
            render(point, [(stars[2*i] * scaleForDepth) + (groundOffsetX * scaleForParallax), (stars[2*i+1] * scaleForDepth) + (groundOffsetY * scaleForParallax)])
        }
        p5.pop()
    }
}