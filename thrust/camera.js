"use strict";
import {p5instance as p5} from './lib.js'

// Create a camera which follows the given object.
export function newCamera(targetPosition){
    const margin = 0.1
    // Start by looking straight at the target
    let cameraCentre = {x: targetPosition.x, y: targetPosition.y}
    // Camera should control how much the canvas coordinates are translated before things are drawn.
    // This can allow the ship to move around the screen and only start panning the background
    // when the ship is too close to an edge.
    return {
        centreOfView: function(){
            return {x: cameraCentre.x, y: cameraCentre.y}
        },
        keepTargetInFrame: function(targetPosition){
            // First - slowly drift back towards having the target be at the centre
            // by averaging the view centre towards the target pos.
            cameraCentre.x = (19 * cameraCentre.x + targetPosition.x)/20
            cameraCentre.y = (19 * cameraCentre.y + targetPosition.y)/20

            // If that wasn't drastic enough, move the camera to keep
            // the target further than the fixed margin amount from the edge.
            let outOfBoundsToRight = targetPosition.x - rightMargin()
            if (outOfBoundsToRight > 0){
                cameraCentre.x += outOfBoundsToRight
            }
            else {
                let outOfBoundsToLeft = leftMargin() - targetPosition.x
                if (outOfBoundsToLeft > 0){
                    cameraCentre.x -= outOfBoundsToLeft
                }
            }
            // And now the vertical equivalents
            let outOfBoundsToTop = topMargin() - targetPosition.y
            if (outOfBoundsToTop > 0){
                cameraCentre.y -= outOfBoundsToTop
            }
            else {
                let outOfBoundsToBottom = targetPosition.y - bottomMargin()
                if (outOfBoundsToBottom > 0){
                    cameraCentre.y += outOfBoundsToBottom
                }
            }
        }
    }

    // The leftmost coordinate that we're willing to let the target reach.
    // If they go beyond that then we move the camera leftwards enough to compensate.
    function leftMargin(){
        return cameraCentre.x - margin
    }

    function rightMargin(){
        return cameraCentre.x + margin
    }

    function topMargin(){
        return cameraCentre.y - margin
    }

    function bottomMargin(){
        return cameraCentre.y + margin
    }

}