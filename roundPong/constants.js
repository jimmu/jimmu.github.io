"use strict"
define([],
function(){
    const width = Math.min(window.innerWidth, window.innerHeight)
    const height = width
    const batThickness = 10
    const windowCentre = window.innerWidth/2
    return {
        width,
        height,
        windowCentre,
        centre: {x: width/2, y: height/2},
        batSize: 20 * (Math.PI/180),
        batThickness,
        radius: (width - batThickness)/2,
        ballRadius: 10,
        ballInitialSpeed: 4,
        batInitialSpeed: 0.06,
        bounceMaxRandomAngle: 6 * (Math.PI/180),
        speedBasedBounceAngle: 15 * (Math.PI/180),
        bounceSpeedIncrement: 1.05
    }

})
