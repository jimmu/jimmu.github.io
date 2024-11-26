"use strict";
import {p5instance as p5} from './lib.js'

export function newScene(level){

    return {
        setup,
        draw,
        collisionCheck,
        collectionCheck,
        isComplete: ()=>{return level.isComplete()},
        greeting: level.name,
        startCoords: level.startCoords
    }

    function setup(){
    }

    function draw(){
        drawGround()
        drawObjects()
    }

    function drawGround(){
        p5.push()
        p5.strokeWeight(1)
        p5.noStroke()
        p5.fill(100)
        for (let shape of level.ground){
            drawShape(shape)
        }
        p5.pop()
    }

    function drawObjects(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(200)
        p5.fill(150)
        for (let shape of level.objects.filter((s)=>{return !s.collected && !s.disabled})){
            drawShape(shape)
        }
        p5.pop()
    }

    function collisionCheck(position, diameter){
        // Have these coords collided with the ground?
        // Maybe check the front of the ship separately from the back. In case we want to detect landings.
        // First off just check every shape in turn.
        // Could do something more fancy to cull shapes far out of view if need be.
        for (let shape of level.ground){
            if (collisionCheckShape(position, shape, diameter)) {
                return true
            }
        }
        return false
    }

    function collectionCheck(position, diameter, onlyChecking){
        // Only check things which have not already been collected
        for (let shape of level.objects.filter((s)=>{return !s.collected && !s.disabled})){
            if (collisionCheckShape(position, shape, diameter)) {
                if (onlyChecking){
                    console.log("Detected a "+shape)
                }
                else {
                    console.log("Collected a "+shape)
                    shape.collected = true
                    level.isComplete()  // Run this in case it has side effects such as enabling the landing pad when everything has been collected
                }
                return shape
            }
        }
        return false
    }

    function drawShape(shape){
        let coords = scale(shape.coords)
        shape.type.render(coords)
    }

    function collisionCheckShape(position, shape, collisionDiameter){
        let coords = scale(shape.coords)
        if (shape.type.collision(position, coords, collisionDiameter)){
            return shape
        }
    }

    function scale(coords){
        return coords.map((e,i)=>{return e * (i%2==0 ? p5.windowWidth * level.scales.x : p5.windowHeight * level.scales.y)})
    }
}