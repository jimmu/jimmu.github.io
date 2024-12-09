"use strict";
import {p5instance as p5} from './lib.js'
import {circle, render} from './shapes.js'

export function newVapourTrail(){

    let vapourPoints = []
    const speed = 0.02
    const lifetime = 20 // Frames.
    const maxSize = 0.03

    return {
        draw,
        add
    }

    function add(direction){
        let velocity = p5.constructor.Vector.fromAngle(direction)
        velocity.mult(speed)  // Speed
        vapourPoints.push({position: p5.createVector(0, 0), velocity, age: 0})
    }

    function draw(){
        p5.push()
        let nonExpired = vapourPoints.filter((p)=>{return p.age <= lifetime})
        vapourPoints = nonExpired
        update()
        p5.noFill()
        p5.stroke(100)
        for (let vapourPoint of vapourPoints){
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