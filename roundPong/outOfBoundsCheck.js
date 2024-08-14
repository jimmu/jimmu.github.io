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

            // Wait for the ball to drift out of the box.
            let oneFrameOfMovement = ball.speed() * deltaSeconds
            let tooFarX = constants.width/2 + oneFrameOfMovement
            let tooFarY = constants.height/2 + oneFrameOfMovement
            if (ballPos.x < -tooFarX || ballPos.x > tooFarX ||
                ballPos.y < -tooFarY || ballPos.y > tooFarY) {
                if (ball.lastBat()){
                    ball.lastBat().points++
                }
                ball.reset()
            }
        }
    }

})
