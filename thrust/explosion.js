"use strict";
import {p5instance as p5} from './lib.js'
import {colours} from './config.js'

export function newExplosion(size, durationSeconds){

    let startTime = Date.now()
    let durationMillis = durationSeconds * 1000
    const minSizeFactor = 0.0125
    const shrapnelCount = 24
    const maxShrapnelSize = p5.width*0.15

    return{
        draw
    }

    function draw(){
        p5.push()
        let elapsedMillis = Date.now()-startTime
        let sizeFactor = elapsedMillis/durationMillis
        // sizeFactor is now between 0 and 1
        // But for an explosion the expansion should start quickly and then slow down.
        // Start at an eighth size. Hit about 75% of full size within the time.
        // Then keep growing slowly up to the max size.
        sizeFactor = (1 + minSizeFactor)-(1/Math.exp(sizeFactor))
        if (sizeFactor <= 1){
            p5.noFill()
            p5.stroke(colours.explosion)
            p5.strokeWeight(6 - (6*sizeFactor))
            for (let i = 0; i < shrapnelCount; i++){
                p5.rotate(2*Math.PI/shrapnelCount)
                p5.arc(size*sizeFactor/2, 0,
                        (0.5+sizeFactor)*maxShrapnelSize, (0.5+sizeFactor)*0.7*maxShrapnelSize,
                        -Math.PI/4, Math.PI/4)
            }
        }
        p5.pop()
    }
}