"use strict"
define([],
function(){
    const degree = Math.PI/180
    const width = Math.min(window.innerWidth, window.innerHeight)
    const height = width
    const batThickness = 10
    const windowCentre = window.innerWidth/2
    return {
        framesPerSecond: 60,
        width,
        height,
        windowCentre,
        batSize: 20 * degree,
        batThickness,
        radius: (width - batThickness)/2,
        ballRadius: 10,
        ballInitialSpeed: 200,    // pixels per second
        batInitialSpeed: 2.5,     // radians per second
        ballColour: "black",
        bounceMaxRandomAngle: 6 * degree,
        speedBasedBounceAngle: 15 * degree,
        bounceSpeedIncrement: 1.05,
        scoreFontSizePixels: 24,
        scoreFont: "Arial"
    }

})
