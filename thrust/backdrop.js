"use strict";
import {p5instance as p5} from './lib.js'
import {render, point} from './shapes.js'

export function newBackdrop(){

    const size = {x:5, y:4}
    let stars = []
    let depths = []

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
        }
    }

    function draw(groundOffsetX, groundOffsetY){
        p5.push()
        p5.background(30)
        for (let i=0; i < depths.length; i++){
            let scaleForDepth = depths[i]
            let scaleForParallax = 0.72 + scaleForDepth/4 // so we get range 0.7 - 0.97
            p5.strokeWeight(4 * scaleForDepth)
            p5.stroke(50 + 200*scaleForDepth)
            render(point, [(stars[2*i] * scaleForDepth) + (groundOffsetX * scaleForParallax), (stars[2*i+1] * scaleForDepth) + (groundOffsetY * scaleForParallax)])
        }
        p5.pop()
    }
}