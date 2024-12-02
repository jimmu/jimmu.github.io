"use strict";
import {p5instance as p5} from './lib.js'
import {scale} from './shapes.js'

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
        let startTime = Date.now()
        // Measure how long drawing takes and automatically shrink the stars array if it's too slow
        let scaledStars = scale(stars)
        for (let i=0; i < depths.length; i++){
            let scaleForDepth = depths[i]
            let scaleForParallax = 0.72 + scaleForDepth/4 // so we get range 0.7 - 0.97
            p5.strokeWeight(4 * scaleForDepth)
            p5.stroke(50 + 200*scaleForDepth)
            p5.point((scaledStars[2*i] * scaleForDepth) + (groundOffsetX * scaleForParallax), (scaledStars[2*i+1] * scaleForDepth) + (groundOffsetY * scaleForParallax))
        }
        let elapsedMillis = Date.now()-startTime
        if (elapsedMillis > 2){
            stars.pop()
            stars.pop()
            depths.pop()
        }
        p5.pop()
    }
}