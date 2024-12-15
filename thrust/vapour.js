"use strict";
import {p5instance as p5} from './lib.js'
import {circle, render} from './shapes.js'

export function newVapourTrail(){

    let pulseCount = 0
    let vapourPoints = []
    const speed = 0.004
    const lifetime = 30 // Frames.
    const maxSize = 0.03

    return {
        draw,
        add
    }

    function add(direction){
        let speedPulses = [0, 1, 2, 3, 4, 4, 4, 5, 4, 4, 3, 2, 1, 1, 1, 1]
        let velocity = p5.constructor.Vector.fromAngle(direction)
        pulseCount = (pulseCount + 1) % speedPulses.length
        let pulse = speedPulses[pulseCount]
        velocity.mult(speed + pulse/1500)
        let position = p5.createVector(0, 0)    // That's the middle of the ship. Move to the back.
        position.add(velocity)
        position.add(velocity)
        position.add(velocity)
        vapourPoints.push({position, velocity, age: 0, colour: 65+pulse*10})
    }

    function draw(){
        p5.push()
        vapourPoints = vapourPoints.filter((p)=>{return p.age < lifetime})
        update()
        p5.noFill()
        for (let vapourPoint of vapourPoints){
            p5.stroke(vapourPoint.colour)
            //p5.fill(vapourPoint.colour || 75)
            let sizeFactor = vapourPoint.age / lifetime
            p5.strokeWeight(1-sizeFactor)
            render(circle, [vapourPoint.position.x, vapourPoint.position.y, maxSize * sizeFactor])
        }
        p5.pop()
    }

    function update(){
        // Move every point.
        for (let vapourPoint of vapourPoints){
            vapourPoint.position.add(vapourPoint.velocity)
            vapourPoint.age++
        }
    }
}