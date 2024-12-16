"use strict";
import {p5instance as p5} from './lib.js'
import {render, collision, circle} from './shapes.js'

export function newScene(level){

    let pattern

    return {
        setup,
        draw,
        collisionCheck,
        collectionCheck,
        isComplete: ()=>{return level.isComplete()},
        greeting: level.name,
        startCoords: level.startCoords,
        useKey,
        toggleSwitchableObjects,
        isOutOfBounds
    }

    function setup(){
        if (level.usePatternFill){
            let patternCanvas = p5.createGraphics(10, 10)
            patternCanvas.pixelDensity(1)
            patternCanvas.background(30)
            patternCanvas.noFill()
            patternCanvas.stroke(level.backgroundColour)
            patternCanvas.strokeWeight(5)
            patternCanvas.point(5,5)
            //patternCanvas.line(0,1,10,1)
            //patternCanvas.line(0,0,10,10)
            pattern = p5.drawingContext.createPattern(patternCanvas.canvas, 'repeat')
        }
    }

    function draw(){
        drawGround()
        drawObjects()
    }

    function drawGround(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(level.backgroundColour)
        p5.fill(level.backgroundColour)
        if (level.usePatternFill){  // Experimental use of patterned fill.
            p5.noStroke()
            p5._renderer._setFill(pattern)
        }
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

    function collisionCheck(collisionShape){
        // Has this shape, at these coords collided with the ground?
        // Maybe check the front of the ship separately from the back. In case we want to detect landings.
        // First off just check every shape in turn.
        // Could do something more fancy to cull shapes far out of view if need be.
        for (let groundShape of level.ground){
            if (collisionCheckShape(collisionShape, groundShape)) {
                return true
            }
        }
        return false
    }

    function collectionCheck(collisionShape, onlyChecking){
        // Only check things which have not already been collected
        for (let collectableObject of level.objects.filter((s)=>{return !s.collected && !s.disabled})){
            if (collisionCheckShape(collisionShape, collectableObject)) {
                if (onlyChecking){
                    //console.log("Detected a "+shape)
                }
                else {
                    if (collectableObject.permanent){
                        // Don't mark it as collected. This must be a switch or something which doesn't go away.
                    }
                    else {
                        collectableObject.collected = true
                    }
                    level.isComplete()  // Run this in case it has side effects such as enabling the landing pad when everything has been collected
                }
                return collectableObject
            }
        }
        return false
    }

    function useKey(key){
        for (let shape of level.objects.filter((s)=>{return s.needsKey == key})){
            shape.disabled = true
        }
    }

    function toggleSwitchableObjects(switchName){
        for (let shape of level.objects.filter((s)=>{return s.switchedBy && s.switchedBy.includes(switchName)})){
            shape.disabled = !shape.disabled
        }
    }

    function drawShape(shape){
        p5.push()
        if (shape.colour){
            p5.fill(shape.colour)
            p5.stroke(shape.colour)
        }
        render(shape.type, shape.coords)
        p5.pop()
    }

    // Check if the shapes collided. If they did, return the second one.
    function collisionCheckShape(collisionMask, shape){
        if (collision(collisionMask.type, collisionMask.coords, shape.type, shape.coords)){
            return shape
        }
    }

    function isOutOfBounds(position){
        return position.mag() > 6    // TODO. Work this out from the level size.
    }

}