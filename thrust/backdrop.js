"use strict";
import {p5instance as p5} from './lib.js'

export function newBackdrop(){

    const scales = {x:5, y:4}
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
            stars.push(Math.random()-0.5)   // x coord. Will be scaled to window width later
            stars.push(Math.random()-0.5)   // y. likewise
            depths.push(Math.random())  // Depth. Won't be scaled.
        }
    }

    function draw(groundOffsetX, groundOffsetY){
        p5.push()
        p5.background(30)
        let scaledStars = scale(stars)
        for (let i=0; i < scaledStars.length-1; i+=2){
            let scaleForDepth = depths[i/2]
            let scaleForParallax = 0.72 + scaleForDepth/4 // so we get range 0.7 - 0.97
            p5.strokeWeight(4 * scaleForDepth)
            p5.stroke(50 + 200*scaleForDepth)
            p5.point((scaledStars[i] * scaleForDepth) + (groundOffsetX * scaleForParallax), (scaledStars[i+1] * scaleForDepth) + (groundOffsetY * scaleForParallax))
        }
        p5.pop()
    }

    function scale(coords){
        return coords.map((e,i)=>{return e * (i%2==0 ? p5.windowWidth * scales.x: p5.windowHeight*scales.y)})
    }

}