"use strict";
import {p5instance as p5} from './lib.js'
import {newInventory} from './inventory.js'
import {newControls} from './controls.js'

export function newShip(){

    //TODO. Explode
    let controls = newControls()
    let size = 0.04   // Fraction of the screen width or height (whichever is smaller)
    let rotationSpeed = 3   // Radians per second
    let thrust = 0.2
    const maxLandingSpeed = 50
    const maxLandingAngle = Math.PI/6
    const maxSpeed = 300   // Coordinate units per second.
    let position = p5.createVector(0, 0)
    let angle = -Math.PI/2
    let grabberPosition = p5.createVector(0, 0)
    let grabberSize = size/2
    let grabberZoneSize = size  // Near enough the grabber to show some visual indication
    let velocity = p5.createVector(0, 0)
    let fuel = 100  // Percent
    let health = 100 // Percent. Undamagedness
    let fuelPerSecondThrust = 10    // Percentage points per second
    let damagePerSecond = 50
    let gravity = p5.constructor.Vector.fromAngle(Math.PI/2).mult(thrust/5)
    let friction = 0.005
    let thrusting = false
    let colliding = false
    let grabbing = false
    let grabAdjacent
    let payloadSize = size*0.75
    let payloadRopeLength = size * 3
    let payload // Shall we consider this to be a mass?
    let payloadPosition = p5.createVector(0, 0)
    let payloadVelocity = p5.createVector(0, 0)
    let inventory = newInventory()

    return {
        setup,
        draw,
        drawGrabber,
        drawGrabberZone,
        update,
        position,
        velocity,
        hit,
        grab,
        nearAnObject,
        carrying,
        collisionShape: {position, size: scale([size])[0]},
        grabberShape: {position: grabberPosition, size: scale([grabberSize])[0]},   //TODO. Make the size a function so that its value is recalcualted if the screensize changes?
        grabberZoneShape: {position: grabberPosition, size: scale([grabberZoneSize])[0]},
        payloadCollisionShape: {position: payloadPosition, size: scale([payloadSize])[0]},
        fuelPercent,
        healthPercent,
        setPos: (x, y)=>{position.set(scale([x])[0], scale([y])[0])},
        slowEnoughToLand,
        inventory
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
        if (payload){
            drawPayload()
        }

        if (colliding){
            outlineCircle()
        }
        p5.pop()
    }

    function drawShip(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(200)
        p5.fill(30)

        p5.rotate(angle)
        quad(size*0.66, 0,
            -size*0.33, -size/3,
            -size*0.5, 0,
            -size*0.33, size/3)
        if (slowEnoughToLand()){
            // Draw landing legs
            line(-size, 0, -size*0.4, 0)
            line(-size, -size*0.05, -size, size*0.05)
            line(-size, -size*0.3, -size*0.4, -size*0.2)
            line(-size, -size*0.35, -size, -size*0.25)
            line(-size, size*0.3, -size*0.4, size*0.2)
            line(-size, size*0.25, -size, size*0.35)
        }

        p5.noFill()
        if (thrusting && !grabbing){
            circle(-size*0.32, -size/7, size*0.1)
            circle(-size*0.32, size/7, size*0.1)
            p5.strokeWeight(0.5)
            p5.rotate(Math.PI/10)
            line(-size*0.85, 0, -size*0.6, 0)
            p5.rotate(-Math.PI/10)
            line(-size*0.85, 0, -size*0.6, 0)
            p5.rotate(-Math.PI/10)
            line(-size*0.85, 0, -size*0.6, 0)
        }
        p5.pop()
    }

    function drawPayload(){
        p5.push()
        // The canvas will have been moved so that the ship will be at 0,0
        // So the coordinates for the payload depend on the difference between the ships and payloads positions.
        p5.stroke(100)
        p5.strokeWeight(0.3)
        // Using p5.line instead of line to _avoid_ scaling the coords here.
        p5.line(0,0, payloadPosition.x - position.x, payloadPosition.y - position.y)
        p5.translate(payloadPosition.x - position.x, payloadPosition.y - position.y)
        p5.fill(150)
        p5.noStroke()
        circle(0,0, payloadSize)
        p5.pop()
    }

    function drawGrabber(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(200)
        p5.noFill()
        p5.rotate(angle)
        circle(-size*0.75, 0, grabberSize)
        p5.pop()
    }

    function drawGrabberZone(){
        p5.push()
        p5.strokeWeight(0.5)
        p5.stroke(200)
        p5.noFill()
        p5.rotate(angle)
        quad(-size*1.25, -grabberZoneSize/2,
            grabberZoneSize-size, -grabberZoneSize/2,
            grabberZoneSize-size, grabberZoneSize/2,
            -size*1.25, grabberZoneSize/2
            )
        p5.pop()
    }

    function checkControls(){
        let elapsedSeconds = p5.deltaTime/1000
        let directions = controls.directions()
        let leftOrRight = directions.right - directions.left
        angle += (leftOrRight * elapsedSeconds * rotationSpeed)
        thrusting = (directions.up + directions.down) > 0 && fuel>0
        if (thrusting){
            // Change the velocity based on the direction and the amount of thrust
            let thrustVector = p5.constructor.Vector.fromAngle(angle)
            let velocityChange = p5.constructor.Vector.mult(thrustVector, directions.up * thrust * p5.deltaTime)
            velocity.add(velocityChange)
            velocity.limit(maxSpeed)
            fuel = Math.max(0, fuel - (fuelPerSecondThrust * elapsedSeconds * directions.up))
        }
    }

    function move(){
        // Are we towing something?
        if (payload){
            // Subject the payload to gravity too.
            // It will also have its own position and velocity.
            // The only other force to act on it is a pull towards the ship if the ship is thrusting.
            // Which will only be the component of the thrust in that direction.
            payloadVelocity.mult(1-friction)
            let gravityIncrement = p5.constructor.Vector.mult(gravity, p5.deltaTime)
            payloadVelocity.add(gravityIncrement)
            let moveIncrement = p5.constructor.Vector.mult(payloadVelocity, p5.deltaTime/1000)
            payloadPosition.add(moveIncrement)
            // That's the payload drifting an falling.
            // Now is it tugging on the string?
            let scaledRopeLength = scale([payloadRopeLength])[0]
            let shipToPayload = p5.constructor.Vector.sub(payloadPosition, position)
            if (shipToPayload.mag() > scaledRopeLength){
                // Constrain the payload to stay near enough the ship
                shipToPayload.normalize().mult(scaledRopeLength)   // or use limit.
                payloadPosition.set(position.x+shipToPayload.x, position.y+shipToPayload.y)
                // Give the velocity of the payload and the ship a tug too.
                // These should really be in proportion to the masses of the ship (1) and the payload.
                payloadVelocity.sub(p5.constructor.Vector.mult(shipToPayload, 0.75))
                // And tug the ship too
                velocity.add(p5.constructor.Vector.mult(shipToPayload, 0.25))
            }
        }
        velocity.mult(1-friction)
        let gravityIncrement = p5.constructor.Vector.mult(gravity, p5.deltaTime)
        velocity.add(gravityIncrement)
        let moveIncrement = p5.constructor.Vector.mult(velocity, p5.deltaTime/1000)
        position.add(moveIncrement)
        // Now update the grabber position. It's at the back of the ship, so it depends on the ship's position and angle.
        let grabberOffset = p5.constructor.Vector.fromAngle(angle+Math.PI)
        grabberOffset.mult(...scale([size*0.75]))
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

    function carrying(thing){
        if (thing === undefined){
            return payload
        }
        payload = thing
        payloadPosition.set(grabberPosition.x, grabberPosition.y)
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

    function outlineCircle(){
        p5.push()
        p5.strokeWeight(0.25)
        p5.stroke(200)
        p5.noFill()
        circle(0, 0, size)
        p5.pop()
    }

    function slowEnoughToLand(){
        return velocity.mag() <= maxLandingSpeed &&
                angle <= maxLandingAngle - Math.PI/2 &&
                angle >= -Math.PI/2 - maxLandingAngle &&
                grabAdjacent && grabAdjacent.landingPad
    }

    function line(...coords){
        p5.line(...scale(coords))
    }

    function circle(...coords){
        p5.circle(...scale(coords))
    }

    function quad(...coords){
        p5.quad(...scale(coords))
    }

    // Note that this scaling is not quite the same as is used for the landscape, where widths and heights scale separately
    function scale(coords){
        let scalingDimension = Math.min(p5.windowWidth, p5.windowHeight)
        return coords.map((e)=>{return e * scalingDimension})
    }
}