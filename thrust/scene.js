"use strict";
import {p5instance as p5} from './lib.js'
import {shapes as shapeHandlers} from './shapes.js'

export function newScene(level){

    return {
        setup,
        draw,
        collisionCheck,
        collectionCheck
    }

    function setup(){
        // TODO. Do the scaling of the coords here just one time? And the making of vertex equivalents?
    }

    function draw(){
        drawGround()
        drawObjects()
    }

    function drawGround(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(150)
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
        for (let shape of level.objects.filter((s)=>{return !s.collected})){
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

    function collectionCheck(position, diameter){
        // Only check things which have not already been collected
        for (let shape of level.objects.filter((s)=>{return !s.collected})){
            if (collisionCheckShape(position, shape, diameter)) {
                console.log("Collected a "+shape)
                shape.collected = true
                if (shape.landingPad){
                    console.log("Landed") //TODO. Landed softly?
                }
                return true
            }
        }
        return false
    }

    function drawShape(shape){
        if (!shape.collected){
            let coords = scale(shape.coords)
            shape.type.render(coords)
        }
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