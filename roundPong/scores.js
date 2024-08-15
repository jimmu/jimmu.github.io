"use strict";
define(["constants"],
function(constants){

    return function(theBats){
        let bats = theBats

        // We are given an array of all the bats (players)
        bats.forEach((bat)=>{bat.points = 0})

        return {
            init: function(ctx){
            },
            update: function(ctx){
                ctx.font = constants.scoreFontSizePixels + "px " + constants.scoreFont
                // Draw the scores on the screen
                let baseLine = -constants.height/2 + (constants.scoreFontSizePixels * 1.25)
                let margin = -constants.width/2 + (constants.scoreFontSizePixels * 0.25)
                ctx.fillText("Scores:", margin, baseLine)
                for (let bat of bats){
                    baseLine += (constants.scoreFontSizePixels * 1.25)
                    ctx.fillStyle = bat.colour()
                    ctx.fillText(bat.points, margin, baseLine)
                }
            }
        }
    }
})
