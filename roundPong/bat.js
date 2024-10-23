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
                //TODO. Can a bat spawn its own left/right control buttons too?
                //For use on a touch screen device.
                //One just off each end of the bat's start position.
                let leftButton=document.createElement("button")
                leftButton.textContent=String.fromCharCode(0x2193)
                leftButton.style.background=colour
                leftButton.style.transform="rotate("+(initialPosition+constants.batSize)+"rad)"
                document.body.appendChild(leftButton)
                leftButton.style.position="absolute"
                let leftPos = angleTools.coordsFromAngle(initialPosition + constants.batSize)
                leftButton.style.top = (leftPos.y + constants.radius) + "px"
                leftButton.style.left = (leftPos.x + constants.windowCentre) + "px"
                leftButton.addEventListener("touchstart", leftPressed)
                leftButton.addEventListener("touchend", (e)=>{
                    goingCCW = false
                    speed = 0
                })

                let rightButton=document.createElement("button")
                rightButton.textContent=String.fromCharCode(0x2191)
                rightButton.style.background=colour
                rightButton.style.transform="rotate("+(initialPosition - constants.batSize)+"rad)"
                document.body.appendChild(rightButton)
                rightButton.style.position="absolute"
                let rightPos = angleTools.coordsFromAngle(initialPosition - constants.batSize)
                rightButton.style.top = (rightPos.y + constants.radius) + "px"
                rightButton.style.left = (rightPos.x + constants.windowCentre) + "px"
                rightButton.addEventListener("touchstart", rightPressed)
                rightButton.addEventListener("touchend", (e)=>{
                    goingCW = false
                    speed = 0
                })
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
                    leftPressed()
                }
                if (key.toUpperCase() == rightKey){
                    rightPressed()
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
                //TODO. Cope with wrapping around 0.
                else if (angleOfTouchPoint > centreOfTouchArea && angleOfTouchPoint < cwTouchAreaBound){
                    if (goingCCW){
                        // We're changing direction
                        speed = 0
                    }
                    goingCCW = false
                    goingCW = true
                }
            },
            touchEnd: function(e){  // But how do we know it was _our_ touch which ended?
                //let x = Math.floor(e.touches[0].clientX) - constants.windowCentre
                //let y = Math.floor(e.touches[0].clientY) - constants.windowCentre
                //document.getElementById("debug").value += ("Touch ended at "+x+","+y)
                speed = 0
                goingCCW = false
                goingCW = false
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

        function leftPressed(){
            if (goingCW){
                // We're changing direction
                speed = 0
            }
            goingCCW = true
            goingCW = false
        }

        function rightPressed(){
            if (goingCCW){
                // Change of direction
                speed = 0
            }
            goingCCW = false
            goingCW = true
        }

        function moveCw(deltaSeconds){
            speed = Math.min(speed + acceleration * Math.abs(deltaSeconds), topSpeed)
            batPosition = angleTools.limitRange(batPosition + (speed * deltaSeconds))
        }
    }

})
