"use strict"
define(["constants", "angleTools"],
function(constants, angleTools){

    return function(theColour, initialPosition, left, right){
        let colour = theColour
        let batPosition = initialPosition   // Radians
        let leftKey = left.toUpperCase()
        let rightKey = right.toUpperCase()
        const angleSubtendedByBallRadius = angleTools.angleFromCoords(constants.radius, constants.ballRadius)

        let centreOfTouchArea = initialPosition
        let cwTouchAreaBound = angleTools.limitRange(centreOfTouchArea + Math.PI * 0.33)
        let ccwTouchAreaBound = angleTools.limitRange(centreOfTouchArea - Math.PI * 0.33)

        let goingCW = false
        let goingCCW = false
        let acceleration = 0
        let topSpeed = 0
        let speed = 0
        let points = 0

        return {
            init: function(ctx){
                topSpeed = constants.batTopSpeed
                speed = 0
                acceleration = constants.batAcceleration
            },
            update: function(ctx, deltaSeconds){
                // Update bat position
                if (goingCW){
                    moveCw(deltaSeconds)
                }
                else if (goingCCW){
                    moveCw(-deltaSeconds)
                }
                // Draw the bat
                ctx.beginPath()
                ctx.strokeStyle = colour
                ctx.lineWidth = constants.batThickness
                ctx.lineCap = "round"
                ctx.arc(0, 0,
                        constants.radius,
                        batPosition + (constants.batSize/2),
                        batPosition - (constants.batSize/2),
                        true)
                ctx.stroke()
            },
            keyDown: function(key){
                if (key.toUpperCase() == leftKey){
                    if (goingCW){
                        // We're changing direction
                        speed = 0
                    }
                    goingCCW = true
                    goingCW = false
                }
                if (key.toUpperCase() == rightKey){
                    if (goingCCW){
                        // Change of direction
                        speed = 0
                    }
                    goingCCW = false
                    goingCW = true
                }
            },
            keyUp: function(key){
                if (key.toUpperCase() == leftKey){
                    goingCCW = false
                }
                if (key.toUpperCase() == rightKey){
                    goingCW = false
                }
                if (!(goingCW || goingCCW)){
                    speed = 0
                }
            },
            touchStart: function(e){
                let x = Math.floor(e.touches[0].clientX) - constants.windowCentre
                let y = Math.floor(e.touches[0].clientY) - constants.windowCentre
                //document.getElementById("debug").value += ("Touch started at "+x+","+y)
                let angleOfTouchPoint = angleTools.angleFromCoords(x, y)
                if (angleOfTouchPoint < centreOfTouchArea && angleOfTouchPoint > ccwTouchAreaBound){
                    if (goingCW){
                        // We're changing direction
                        speed = 0
                    }
                    goingCCW = true
                    goingCW = false
                }
                else if (angleOfTouchPoint > centreOfTouchArea && angleOfTouchPoint < cwTouchAreaBound){
                    if (goingCCW){
                        // We're changing direction
                        speed = 0
                    }
                    goingCCW = false
                    goingCW = true
                }
            },
            touchEnd: function(e){
                let x = Math.floor(e.touches[0].clientX) - constants.windowCentre
                let y = Math.floor(e.touches[0].clientY) - constants.windowCentre
                //document.getElementById("debug").value += ("Touch ended at "+x+","+y)
                speed = 0
            },
            getPosition: function(){
                return batPosition
            },
            getSize: function(){
                return constants.batSize
            },
            getDirection: function(){
                if (goingCW){
                    return 1
                }
                if (goingCCW){
                    return -1
                }
                return 0
            },
            colour: function(theColour){    // getter/setter
                if (theColour){
                    colour = theColour
                }
                return colour
             },
            areCoordsWithinBatSector: function(x, y){
                // Find the angle created by x,y
                // Check if that's within the bat's position and size range.
                let angle = angleTools.angleFromCoords(x, y)
                let lowerLimit = angleTools.limitRange(batPosition - (constants.batSize/2) - angleSubtendedByBallRadius)
                let upperLimit = angleTools.limitRange(batPosition + (constants.batSize/2) + angleSubtendedByBallRadius)
                if (upperLimit > lowerLimit){
                    // This is the common case. But is not the case when the bat spans the 4th and 1st quadrants.
                    return angle >= lowerLimit && angle <= upperLimit
                }
                if (angle < Math.PI){
                    return angle < upperLimit
                }
                return  angle > lowerLimit
            }
        }

        function moveCw(deltaSeconds){
            speed = Math.min(speed + acceleration * Math.abs(deltaSeconds), topSpeed)
            batPosition = angleTools.limitRange(batPosition + (speed * deltaSeconds))
        }
    }

})
