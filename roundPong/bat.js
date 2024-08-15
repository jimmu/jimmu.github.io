"use strict"
define(["constants", "angleTools"],
function(constants, angleTools){

    return function(theColour, initialPosition, left, right){
        let colour = theColour
        let batPosition = initialPosition   // Radians
        let leftKey = left.toUpperCase()
        let rightKey = right.toUpperCase()
        const angleSubtendedByBallRadius = angleTools.angleFromCoords(constants.radius, constants.ballRadius)

        let goingCW = false
        let goingCCW = false
        let speed = 0
        let points = 0

        return {
            init: function(ctx){
                speed = constants.batInitialSpeed
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
                    goingCCW = true
                    goingCW = false
                }
                if (key.toUpperCase() == rightKey){
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
            batPosition = angleTools.limitRange(batPosition + (speed * deltaSeconds))
        }
    }

})
