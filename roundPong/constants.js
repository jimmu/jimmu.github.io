"use strict"
define([],
function(){
    const width = Math.min(window.innerWidth, window.innerHeight)
    const height = width
    const batThickness = 10
    const windowCentre = window.innerWidth/2
    return {
        framesPerSecond: 60,
        width,
        height,
        windowCentre,
        batSize: 20 * (Math.PI/180),
        batThickness,
        radius: (width - batThickness)/2,
        ballRadius: 10,
        ballInitialSpeed: 200,    // pixels per second
        batInitialSpeed: 3.0,     // radians per second
        bounceMaxRandomAngle: 6 * (Math.PI/180),
        speedBasedBounceAngle: 15 * (Math.PI/180),
        bounceSpeedIncrement: 1.05
    }

})
