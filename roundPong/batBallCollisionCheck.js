"use strict"
define(["constants", "ball"],
function(constants, ball){

    return function(theBats){
        let bats = theBats

        return {
            init: function(ctx){
            },
            update: function(ctx, deltaSeconds){
                if (!ball.insideBatRadius() && !ball.beyondBat()) {
                    let ballPos = ball.getPosition()    // x,y coords
                    bats.forEach((bat)=>{
                        if (!ball.lastBat() || ball.lastBat() != bat){
                            // Get the bat and ball positions.
                            // Are they colliding?
                            // Has the ball reached the bat radius boundary without having gone too far?
                            // We allow a little slop so the bat can make a lunge for the ball and save it off the line.
                            // Only make it bounce if it has hit the bat
                            if (bat.areCoordsWithinBatSector(ballPos.x, ballPos.y)){
                                // Tell the ball it was hit.
                                ball.lastBat(bat)
                            }
                        }
                    })
                }
            }
        }
    }
})
