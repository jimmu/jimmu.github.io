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
            let opposite = Math.abs(y)
            let adjacent = Math.abs(x)
            let hypotenuse = Math.sqrt((opposite * opposite) + (adjacent * adjacent))
            let angle = Math.asin(opposite/hypotenuse)
            if (hypotenuse == 0){
                // Kind of undefined, really
                return 0
            }

            if (x >= 0){
                // first or fourth quadrant
                if (y >= 0){
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
                if (y >= 0){
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

})
