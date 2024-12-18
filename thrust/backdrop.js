"use strict";
import {p5instance as p5} from './lib.js'
import {render, point, translateScreen} from './shapes.js'

export function newBackdrop(){

    const density = 50
    const maxStars = 1000
    const reddish = {r: 220, g: 100, b: 100}
    const blueish = {r: 100, g: 100, b: 220}
    const white = {r: 200, g: 200, b: 200}
    let stars = []
    let depths = []
    let colours = []

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
            stars.push(limits.left + (width * Math.random()))   // x coord. Will be scaled to window width later
            stars.push(limits.top + (height * Math.random()))   // y. likewise
            depths.push(Math.random())  // Depth. Won't be scaled.
            let randomColour = Math.random()
            // Some reddish and some blueish.
            if (randomColour > 0.9){
                colours.push(reddish)
            }
            else if (randomColour > 0.8){
                colours.push(blueish)
            }
            else {
                colours.push(white)
            }
        }
    }

    function draw(groundOffsetX, groundOffsetY){
        p5.push()
        translateScreen(0, 0)   // Put the origin in the centre
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