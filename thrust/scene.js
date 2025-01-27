"use strict";
import {p5instance as p5} from './lib.js'
import {render, collision, circle} from './shapes.js'
import {colours} from './config.js'

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
        isOutOfBounds,
        updateDynamicObjects,
        mandatoryCount: level.howManyMandatory,
        mandatoryCollected: ()=>{return level.howManyMandatoryCollected()},
        addObject,
    }

    function setup(){
        if (level.usePatternFill){
            let patternCanvas = p5.createGraphics(8, 8)
            patternCanvas.pixelDensity(1)
            patternCanvas.background(colours.background)
            patternCanvas.noFill()
            patternCanvas.stroke(level.backgroundColour)
            patternCanvas.strokeWeight(1)
            if (level.generatePattern) {
                level.generatePattern(patternCanvas)
            }
            else {
                //patternCanvas.rotate(Math.PI/4)
                //patternCanvas.point(4, 4)
                //patternCanvas.rect(0, 0, 8, 8)
                patternCanvas.line(0,0,8,8)
                patternCanvas.line(0,8,8,0)
                //patternCanvas.line(0,0,10,10)
            }
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
        p5.stroke(colours.collectibleOutline)
        p5.fill(colours.collectibleFill)
        for (let shape of level.objects.filter((s)=>{return !s.collected && !s.disabled})){
            drawShape(shape)
        }
        p5.pop()
    }

    function updateDynamicObjects(){
        level.updateDynamicObjects?.(level.objects)
    }

    function checkGroundCollisions(collisionShape){
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

    function toggleSwitchableObjects(switchObject){
        let switchName = switchObject.isSwitch
        for (let shape of level.objects.filter((s)=>{return s.switchedBy && s.switchedBy.includes(switchName)})){
            shape.disabled = !shape.disabled
        }
        // Flick the switch. This could be changing its appearance rather than hiding it entirely
        switchObject.disabled = true
        // Set it to come back on soon.
        setTimeout(()=>{switchObject.disabled = false}, 2000)
    }

    function addObject(object){
        if (object){
            level.objects.push(object)
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
        return position.x < level.limits.left ||
               position.x > level.limits.right ||
               position.y < level.limits.top ||
               position.y > level.limits.bottom
    }

}