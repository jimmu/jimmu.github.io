"use strict";
define(["constants"],
function(constants){

    const TAU = 2 * Math.PI
    let x
    let y
    let speed
    let direction

    return {
        angleFromCoords: function(x, y){
            let opposite = Math.abs(y - constants.centre.y)
            let adjacent = Math.abs(x - constants.centre.x)
            let hypotenuse = Math.sqrt((opposite * opposite) + (adjacent * adjacent))
            let angle = Math.asin(opposite/hypotenuse)
            if (hypotenuse == 0){
                // Kind of undefined, really
                return 0
            }

            if (x >= constants.centre.x){   // TODO. Can I add a translation to the canvas to move the origin to the middle of it?
                // first or fourth quadrant
                if (y >= constants.centre.y){
                    // first quadrant
                    return angle
                }
                else {
                    // fourth
                    return limitRange(TAU - angle)
                }
            }
            else {
                // second or third quadrant
                if (y >= constants.centre.y){
                    // second quadrant
                    return limitRange(Math.PI - angle)
                }
                else {
                    // third
                    return limitRange(Math.PI + angle)
                }
            }
        },
        limitRange
    }

    function limitRange(angle){
        if (angle < 0){
            return angle + TAU
        }
        if (angle >= TAU){
            return angle - TAU
        }
        return angle
    }

//    function selfTest(){
//        console.assert(limitRange(0) == 0, "limitRange 1")
//        console.assert(limitRange(-1) == TAU-1, "limitRange 2")
//        console.assert(limitRange(8) == 8 - TAU, "limitRange 3")
//        console.assert(angleFromCoords(constants.centre.x, constants.height) - Math.PI/2 < 0.001, "angleFromCoords1")
//        console.assert(angleFromCoords(constants.centre.x + 100, constants.centre.y + 100) - Math.PI/4 < 0.001, "angleFromCoords2")
//        console.assert(angleFromCoords(0, constants.centre.y) - Math.PI < 0.001, "angleFromCoords3")
//        console.log("Ball self test complete")
//    }
})
