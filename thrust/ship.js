"use strict";
import {p5instance as p5} from './lib.js'

export function newShip(){

    //TODO. Touch controls too.
    const leftKey="a".toUpperCase().charCodeAt(0) // 65 -> "a" keycode
    const rightKey="d".toUpperCase().charCodeAt(0) // 68 -> "d" keycode
    const forwardKey="p".toUpperCase().charCodeAt(0)

    let size = 0.04   // Fraction of the screen width or height (whichever is smaller)
    let rotationSpeed = 3   // Radians per second
    let thrust = 0.2
    let maxSpeed = 300   // Coordinate units per second.
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
    let grabAdjacent = false

    return {
        setup,
        draw,
        drawGrabber,
        drawGrabberZone,
        update,
        position,
        hit,
        grab,
        nearAnObject,
        collisionShape: {position, size: scale([size])[0]},
        grabberShape: {position: grabberPosition, size: scale([grabberSize])[0]},   //TODO. Make the size a function so that its value is recalcualted if the screensize changes?
        grabberZoneShape: {position: grabberPosition, size: scale([grabberZoneSize])[0]},
        fuelPercent,
        healthPercent
    }

    function setup(){
    }

    function update(){
        checkControls()
        move()
    }

    function draw(){
        p5.push()
        p5.strokeWeight(1)
        p5.stroke(200)
        p5.fill(30)

        p5.rotate(angle)
        quad(size*0.66, 0,
            -size*0.33, -size/3,
            -size*0.5, 0,
            -size*0.33, size/3)

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

        if (colliding){
            outlineCircle()
        }

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

    function getCollisionShape(){
    }

    function checkControls(){
        let elapsedSeconds = p5.deltaTime/1000
        if (leftPressed()){
            angle -= (elapsedSeconds * rotationSpeed)
        }
        if (rightPressed()){
            angle += (elapsedSeconds * rotationSpeed)
        }
        thrusting = forwardPressed() && fuel>0
        if (thrusting){
            // Change the velocity based on the direction and the amount of thrust
            let thrustVector = p5.constructor.Vector.fromAngle(angle)
            let velocityChange = p5.constructor.Vector.mult(thrustVector, thrust * p5.deltaTime)
            velocity.add(velocityChange)
            velocity.limit(maxSpeed)
            fuel = Math.max(0, fuel - (fuelPerSecondThrust * elapsedSeconds))
        }
    }

    function move(){
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
        circle(0, 0, size)
        p5.pop()
    }

    function leftPressed(){
        return p5.keyIsDown(leftKey) || p5.keyIsDown(p5.LEFT_ARROW)
    }

    function rightPressed(){
        return p5.keyIsDown(rightKey) || p5.keyIsDown(p5.RIGHT_ARROW)
    }

    function forwardPressed(){
        return p5.keyIsDown(forwardKey) || p5.keyIsDown(p5.UP_ARROW)
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