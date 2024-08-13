"use strict";
define(["constants"],
function(constants){

    return function(theBats){
        let bats = theBats

        // We are given an array of all the bats (players)
        for (let bat of bats){
            bat.points = 0
        }

        return {
            init: function(ctx){
            },
            update: function(ctx){
                ctx.save()
                ctx.font = "16px Arial"
                // Draw the scores on the screen
                let baseLine = 20
                let margin = 5
                ctx.fillText("Scores:", margin, baseLine)
                for (let bat of bats){
                    baseLine += 20
                    ctx.fillStyle = bat.colour()
                    ctx.fillText(bat.points, margin, baseLine)
                }
                ctx.restore()
            }
        }
    }
})
