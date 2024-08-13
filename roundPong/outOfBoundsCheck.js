"use strict"
define(["constants", "ball"],
function(constants, ball){
    return {
        init: function(ctx){
        },
        update: function(ctx, deltaSeconds){
            // Get the ball position.
            // Has it gone too far?
            let ballPos = ball.getPosition()    // x,y coords

            // Wait for the ball to drift right out of the box. Even at the corner.
            let xFromCentre = ballPos.x - constants.centre.x
            let yFromCentre = ballPos.y - constants.centre.y
            let oneFrameOfMovement = ball.speed() * deltaSeconds
            if (ballPos.x < -oneFrameOfMovement || ballPos.x > (constants.width + oneFrameOfMovement) ||
                ballPos.y < -oneFrameOfMovement || ballPos.y > (constants.height + oneFrameOfMovement)) {
                if (ball.lastBat()){
                    ball.lastBat().points++
                }
                ball.reset()
            }
        }
    }

})
