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
    let allowedToBounce = true

    return {
        init: function(ctx){
            selfTest()
            reset()
        },
        update: function(ctx, deltaSeconds){
            // Update the ball position.
            moveIncrement(deltaSeconds)
            // Draw the ball.
            ctx.beginPath()
            ctx.stokeStyle = ballColour
            ctx.fillStyle = ballColour
            ctx.arc(x, y, constants.ballRadius, 0, TAU)
            ctx.fill()
        },
        bounce,
        colour,
        reset,
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

    function reset(){
        ballSpeed = constants.ballInitialSpeed
        x = (Math.random()-0.5) * (constants.radius/2)
        y = (Math.random()-0.5) * (constants.radius/2)
        direction = Math.random() * TAU
        ballColour = "black"
        lastBatToHit = null
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
        if (allowedToBounce){
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
            allowedToBounce = false // Don't bounce again until the ball has moved
        }
    }

    function moveIncrement(deltaSeconds){
        // Update the ball position.
        x += deltaSeconds * ballSpeed * Math.cos(direction)
        y += deltaSeconds * ballSpeed * Math.sin(direction)
        allowedToBounce = true
    }

    function selfTest(){
        console.assert(angleTools.limitRange(0) == 0, "limitRange 1")
        console.assert(angleTools.limitRange(-1) == TAU-1, "limitRange 2")
        console.assert(angleTools.limitRange(8) == 8 - TAU, "limitRange 3")
        console.assert(angleTools.angleFromCoords(0, constants.radius) - Math.PI/2 < 0.001, "angleFromCoords1")
        console.assert(angleTools.angleFromCoords(100, 100) - Math.PI/4 < 0.001, "angleFromCoords2")
        console.assert(angleTools.angleFromCoords(0, 0) - Math.PI < 0.001, "angleFromCoords3")
        console.log("Ball self test complete")
    }
})
