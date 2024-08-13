"use strict"
define(["constants", "ball"],
function(constants, ball){
    return {
        init: function(ctx){
        },
        update: function(ctx){
            // Get the ball position.
            // Has it gone too far?
            let ballPos = ball.getPosition()    // x,y coords

            // Wait for the ball to drift right out of the box. Even at the corner.
            let xFromCentre = ballPos.x - constants.centre.x
            let yFromCentre = ballPos.y - constants.centre.y
            if (ballPos.x < 0 || ballPos.x > constants.width || ballPos.y < 0 || ballPos.y > constants.height) {
            //if (Math.sqrt((xFromCentre * xFromCentre) + (yFromCentre * yFromCentre)) > constants.width * 1.4){
                if (ball.lastBat()){
                    ball.lastBat().points++
                }
                ball.reset()
            }
        }
    }

})
