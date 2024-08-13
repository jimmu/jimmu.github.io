"use strict";
define(["constants", "angleTools"],
function(constants, angleTools){

    const TAU = 2 * Math.PI
    let x
    let y
    let ballSpeed
    let direction
    let ballColour = "black"
    let lastBatToHit = null

    return {
        init: function(ctx){
            selfTest()
            x = constants.centre.x
            y = constants.centre.y
            direction = Math.PI/10 // Radians
            ballSpeed = constants.ballInitialSpeed
        },
        update: function(ctx){
            ctx.save()
            // Update the ball position.
            moveIncrement()
            // Draw the ball.
            ctx.beginPath()
            ctx.stokeStyle = ballColour
            ctx.fillStyle = ballColour
            ctx.arc(x, y, constants.ballRadius, 0, TAU)
            ctx.fill()
            ctx.restore()
        },
        bounce,
        colour,
        reset: function(){
            ballSpeed = constants.ballInitialSpeed
            x = constants.centre.x
            y = constants.centre.y
            direction = Math.random() * TAU
            ballColour = "black"
            lastBatToHit = null
        },
        getPosition: function(){
            return {x, y}
        },
        getSize: function(){
            return constants.ballRadius
        },
        speed,
        lastBat: function(bat){
            if (bat){
                lastBatToHit = bat
                colour(bat.colour())
                bounce(bat.getDirection())
            }
            return lastBatToHit
        }
    }

    function colour(theColour){    // getter/setter
        if (theColour){
            ballColour = theColour
        }
        return ballColour
    }

    function speed(theSpeed){
        if (theSpeed){
            ballSpeed = theSpeed
        }
        return ballSpeed
    }

    function bounce(batMovement){
            // Work out the angle of the normal (radius to this point).
            // Then the angle of the bounce.
            // Which should be twice the angle of the normal minus the angle of the ball.
            // Presuming everything is in the first quadrant.
            let normalDir = angleTools.angleFromCoords(x, y)
            let angleDiff = normalDir - direction
            let newDirection = angleTools.limitRange(normalDir + angleDiff)
            newDirection = angleTools.limitRange(newDirection + Math.PI) // Go the opposite direction.
            // Make the bounce angle have a random element plus an element based on the bat speed.
            newDirection += (Math.random() - 0.5) * constants.bounceMaxRandomAngle
            newDirection -= constants.speedBasedBounceAngle * batMovement
            direction = newDirection
            ballSpeed = ballSpeed * constants.bounceSpeedIncrement
            moveIncrement() // Move away from the bounce place. Or we could flag no more bounces to happen before the next move
    }

    function moveIncrement(){
        // Update the ball position.
        x += ballSpeed * Math.cos(direction)
        y += ballSpeed * Math.sin(direction)
    }

    function selfTest(){
        console.assert(angleTools.limitRange(0) == 0, "limitRange 1")
        console.assert(angleTools.limitRange(-1) == TAU-1, "limitRange 2")
        console.assert(angleTools.limitRange(8) == 8 - TAU, "limitRange 3")
        console.assert(angleTools.angleFromCoords(constants.centre.x, constants.height) - Math.PI/2 < 0.001, "angleFromCoords1")
        console.assert(angleTools.angleFromCoords(constants.centre.x + 100, constants.centre.y + 100) - Math.PI/4 < 0.001, "angleFromCoords2")
        console.assert(angleTools.angleFromCoords(0, constants.centre.y) - Math.PI < 0.001, "angleFromCoords3")
        console.log("Ball self test complete")
    }
})
