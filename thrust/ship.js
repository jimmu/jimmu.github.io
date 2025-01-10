"use strict";
import {p5instance as p5} from './lib.js'
import {newInventory} from './inventory.js'
import {directions as getDirections} from './controls.js'
import {quadrilateral, render, rotate, line, circle} from './shapes.js'
import {newVapourTrail} from './vapour.js'
import {devMode, colours, shipSize as size,
        shipRotationSpeed as rotationSpeed,
        shipThrust as thrust,
        maxSpeed, gravityStrength, payloadGravityStrength, friction,
        maxLandingSpeed, maxLandingAngle} from './config.js'

export function newShip(){
    let shipShape = {type: quadrilateral,
                    coords: [size*0.66, 0,
                            -size*0.33, -size/3,
                            -size*0.5, 0,
                            -size*0.33, size/3]}
    // Landing legs collision mask. Must match the actual drawn legs shape reasonably.
    let landingLegsShape = {type: quadrilateral,
                    coords: [-size, -size*0.35,
                             -size, size*0.35,
                             -size*0.4, size*0.2,
                             -size*0.4, -size*0.2]}
    // Zone in which to trigger the lowering of the landing legs
    let landerZoneShape = {type: circle, coords: [-size * 1.5, 0, size * 3]}
    let payloadSize = size * 0.75
    let payloadShape = {type: circle, coords: [0, 0, payloadSize]}
    const upwards = Math.PI * 1.5
    let position = p5.createVector(0, 0)
    let angle = Math.PI * 1.5
    let grabberPosition = p5.createVector(0, 0)
    let grabberSize = size/2
    let grabberZoneSize = size  // Near enough the grabber to show some visual indication
    let velocity = p5.createVector(0, 0)
    let fuel = 100  // Percent
    let health = 100 // Percent. Undamagedness
    let fuelPerSecondThrust = devMode? 0 : 8.5    // Percentage points per second TODO - make this optionally level specific
    let damagePerSecond = devMode? 0 : 67
    let gravity = p5.constructor.Vector.fromAngle(Math.PI/2).mult(gravityStrength)
    let payloadGravity = p5.constructor.Vector.fromAngle(Math.PI/2).mult(payloadGravityStrength)
    let thrusting = false
    let colliding = false
    let grabbing = false
    let grabAdjacent
    let payloadRopeLength = size * 3
    let payloads = [] // Allow more than one!
    //let payloadPositions = [] //p5.createVector(0, 0)
    //let payloadVelocities = [] //p5.createVector(0, 0)
    let inventory = newInventory()
    let trail = newVapourTrail()

    return {
        setup,
        draw,
        update,
        position,
        velocity,
        getAngle,
        hit,
        grab,
        nearAnObject,
        addPayload,
        hasPayload,
        dropPayload,
        collisionShape: {position, shape: shipShape},
        landingLegsCollisionShape: {position, shape: landingLegsShape},
        landerZoneCollisionShape: {position, shape: landerZoneShape},
        payloadCollisionShape: {positions: payloads, shape: payloadShape},
        fuelPercent,
        healthPercent,
        setPos: (x, y)=>{position.set(x, y)},
        slowEnoughToLand,
        inventory
    }

    function getAngle(){
        return angle
    }

    function setup(){
    }

    function update(){
        checkControls()
        move()
    }

    function draw(){
        p5.push()
        drawShip()
        if (payloads.length > 0){
            drawPayload()
        }
        if (devMode && colliding){
            drawCollisionShape()
        }
        p5.pop()
    }

    function drawShip(){
        p5.push()
        p5.strokeWeight(1)
        p5.fill(colours.background)

        p5.rotate(angle)
        p5.stroke(colliding? colours.shipOutlineWhenColliding : colours.shipOutline)
        render(shipShape.type, shipShape.coords)
        p5.stroke(colours.shipOutline)
        if (slowEnoughToLand()){
            // Draw landing legs
            render(line, [-size, 0, -size*0.4, 0])
            render(line, [-size, -size*0.05, -size, size*0.05])
            render(line, [-size, -size*0.3, -size*0.4, -size*0.2])
            render(line, [-size, -size*0.35, -size, -size*0.25])
            render(line, [-size, size*0.3, -size*0.4, size*0.2])
            render(line, [-size, size*0.25, -size, size*0.35])
        }

        p5.noFill()
        if (thrusting && !grabbing){
            render(circle, [-size*0.32, -size/7, size*0.1])
            render(circle, [-size*0.32, size/7, size*0.1])
            p5.strokeWeight(0.5)
            p5.rotate(Math.PI/10)
            render(line, [-size*0.85, 0, -size*0.6, 0])
            p5.rotate(-Math.PI/10)
            render(line, [-size*0.85, 0, -size*0.6, 0])
            p5.rotate(-Math.PI/10)
            render(line, [-size*0.85, 0, -size*0.6, 0])
            p5.rotate(Math.PI/10)
            trail.add(angle + Math.PI)
            trail.add(angle + Math.PI - Math.PI/10)
            trail.add(angle + Math.PI + Math.PI/10)
        }
        p5.pop()
        trail.draw()
    }

    function drawPayload(){
        p5.push()
        // Because the canvas will already have been moved to put the ship at the centre,
        // the coordinates for the payload depend on the difference between the ships and payloads positions.
        p5.strokeWeight(0.3)
        for (let payload of payloads){
            let payloadPosition = payload.position
            p5.stroke(colours.payloadRope)
            render(line, [0,0, payloadPosition.x - position.x, payloadPosition.y - position.y])
            p5.fill(colours.payload)
            p5.noStroke()
            render(circle, [payloadPosition.x - position.x, payloadPosition.y - position.y, payloadSize])
        }
        p5.pop()
    }

//    function drawLandingZone(){
//        p5.push()
//        p5.strokeWeight(0.5)
//        p5.stroke(200)
//        p5.noFill()
//        render(landerZoneShape.type, landerZoneShape.coords)
//        p5.pop()
//    }

    function checkControls(){
        let elapsedSeconds = p5.deltaTime/1000
        let directions = getDirections()
        let leftOrRight = directions.right - directions.left
        angle += (leftOrRight * elapsedSeconds * rotationSpeed)
        if (angle >= 2 * Math.PI){
            angle = angle - (2 * Math.PI)
        }
        else if (angle < 0){
            angle = angle + (2 * Math.PI)
        }
        thrusting = (directions.up + directions.down) > 0 && fuel>0
        if (thrusting){
            // Change the velocity based on the direction and the amount of thrust
            let thrustVector = p5.constructor.Vector.fromAngle(angle)
            let velocityChange = p5.constructor.Vector.mult(thrustVector, (Math.max(directions.up, directions.down)) * thrust * p5.deltaTime)
            velocity.add(velocityChange)
            velocity.limit(maxSpeed)
            fuel = Math.max(0, fuel - (fuelPerSecondThrust * elapsedSeconds * directions.up))
        }
    }

    function move(){
        // Are we towing something?
        if (payloads.length > 0){
            for (let payload of payloads){
                let payloadVelocity = payload.velocity
                let payloadPosition = payload.position
                // Subject the payload to gravity too.
                // It will also have its own position and velocity.
                // The only other force to act on it is a pull towards the ship if the ship is thrusting.
                // Which will only be the component of the thrust in that direction.
                payloadVelocity.mult(1-friction)
                let gravityIncrement = p5.constructor.Vector.mult(payloadGravity, p5.deltaTime)
                payloadVelocity.add(gravityIncrement)
                let moveIncrement = p5.constructor.Vector.mult(payloadVelocity, p5.deltaTime/1000)
                payloadPosition.add(moveIncrement)
                // That's the payload drifting an falling.
                // Now is it tugging on the string?
                let shipToPayload = p5.constructor.Vector.sub(payloadPosition, position)
                if (shipToPayload.mag() > payloadRopeLength){
                    // Constrain the payload to stay near enough the ship
                    shipToPayload.normalize().mult(payloadRopeLength)   // or use limit.
                    payloadPosition.set(position.x+shipToPayload.x, position.y+shipToPayload.y)
                    // Give the velocity of the payload and the ship a tug too.
                    // We need the component of the ship velocity that is away from the payload
                    // plus the component of the payload velocity that is away from the ship.
                    // Which we can get by just subtracting one vector from the other.
                    let velocityDiff = p5.constructor.Vector.sub(payloadVelocity, velocity).mag()
                    let howHardToTugPayload = velocityDiff * 0.75
                    let howHardToTugShip = velocityDiff * 0.25
                    payloadVelocity.sub(p5.constructor.Vector.mult(shipToPayload, howHardToTugPayload))
                    // And tug the ship too
                    velocity.add(p5.constructor.Vector.mult(shipToPayload, howHardToTugShip))
                }
            }
        }
        velocity.mult(1-friction)
        let gravityIncrement = p5.constructor.Vector.mult(gravity, p5.deltaTime)
        velocity.add(gravityIncrement)
        let moveIncrement = p5.constructor.Vector.mult(velocity, p5.deltaTime/1000)
        position.add(moveIncrement)
        // Now update the grabber position. It's at the back of the ship, so it depends on the ship's position and angle.
        let grabberOffset = p5.constructor.Vector.fromAngle(angle+Math.PI)
        grabberOffset.mult(size*0.75)
        grabberPosition.set(position.x, position.y)
        grabberPosition.add(grabberOffset)
    }

    function hit(hit){
        if (hit === undefined){
            return colliding
        }
        colliding = hit
        if (colliding){
            health = Math.max(0, health - (p5.deltaTime/1000 * damagePerSecond))
            if (health == 0){
                thrusting = false
            }
        }
    }

   function grab(grab){
        if (grab === undefined){
            return grabbing
        }
        grabbing = grab
    }

    function nearAnObject(near){
        if (near === undefined){
            return grabAdjacent
        }
        grabAdjacent = near
    }

    function addPayload(thing){
        if (thing){
            let payloadPosition = p5.createVector(0, 0)
            if (thing.type == circle){
                payloadPosition.set(thing.coords[0], thing.coords[1])
                payloadSize = thing.coords[2]
            }
            else {
                // Just in case.
                payloadPosition.set(grabberPosition.x, grabberPosition.y)
            }
            payloads.push({payload: thing, position: payloadPosition, velocity: p5.createVector(0, 0)})
        }
    }

    function dropPayload(thing){
        if (thing){
            // drop this particular item
            return thing
        }
        // Drop something.
        return payloads.shift()
    }

    function hasPayload(){
        return payloads.length > 0
    }

    function fuelPercent(percentage){
        // Either add this amount of fuel, or return the percentage left
        if (percentage){
            fuel = Math.min(fuel + percentage, 100)
        }
        return Math.ceil(fuel)
    }

    function healthPercent(percentage){
        // Either add this amount of healthiness, or return the percentage left
        if (percentage){
            health = Math.min(health + percentage, 100)
        }
        return Math.ceil(health)
    }

    function drawCollisionShape(){
        p5.push()
        p5.strokeWeight(0.75)
        p5.stroke("red")
        p5.noFill()
        render(shipShape.type, rotate(angle, shipShape.coords))
        p5.pop()
    }

    function slowEnoughToLand(){
        return velocity.mag() <= maxLandingSpeed &&
                angle <= (upwards + maxLandingAngle) &&
                angle >= (upwards - maxLandingAngle) &&
                grabAdjacent && grabAdjacent.landingPad
    }
}