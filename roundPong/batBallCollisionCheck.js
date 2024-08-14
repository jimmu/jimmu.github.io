"use strict"
define(["constants", "ball"],
function(constants, ball){

    return function(theBat){
        let bat = theBat

        return {
            init: function(ctx){
            },
            update: function(ctx, deltaSeconds){
                if (!ball.lastBat() || ball.lastBat() != bat){
                    // Get the bat and ball positions.
                    // Are they colliding?
                    let ballPos = ball.getPosition()    // x,y coords
                    let batPos = ball.getPosition()     // angle in radians
                    let ballSize = ball.getSize()       // Radius
                    let batSize = bat.getSize()         // Arc angle in radians

                    // Has the ball reached the bat radius boundary?
                    let distFromCentre = Math.sqrt((ballPos.x * ballPos.x) + (ballPos.y * ballPos.y))
                    let minBounceRadius = constants.radius - constants.ballRadius - (constants.batThickness/2)
                    let maxBounceRadius = minBounceRadius + (ball.speed() * deltaSeconds)
                    if (distFromCentre >= minBounceRadius && distFromCentre < maxBounceRadius){
                        // Only make it bounce if it has hit the bat
                        if (bat.areCoordsWithinBatSector(ballPos.x, ballPos.y)){
                            // Tell the ball it was hit.
                            ball.lastBat(bat)
                        }
                    }
                }
            }
        }
    }
})
