"use strict";
import {shapes} from './shapes.js'

const levels = [
    {
        name: "Level 1",
        scales: {x:2, y:1},
        ground: [
            {type: shapes.triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: shapes.triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: shapes.quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.01], landingPad: true},
            {type: shapes.circle, coords:[-0.1, 0.1, 0.01], fuel: 25},
            {type: shapes.circle, coords:[-0.2, 0.1, 0.01], health: 50}
        ],
        isComplete: function(){
            // Are all objects collected?
            //        for (let collectable of this.objects){
            //            if (!collectable.collected){
            //                return false
            //            }
            //        }
            //        return true
            // Has the ship landed?
            for (let landingPad of this.objects.filter((e)=>{return e.landingPad})){
                return landingPad.collected
            }
            return false
        }
    },
    {
        name: "Level 2",
        scales: {x:1, y:0.5},
        ground: [
            {type: shapes.triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: shapes.triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: shapes.quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
            {type: shapes.circle, coords:[-0.1, 0.1, 0.01], fuel: 25},
            {type: shapes.circle, coords:[-0.2, 0.1, 0.01], health: 50}
        ],
        isComplete: function(){
            return false
        }
    }
]

export function getLevel(levelNum){
    let level = levels[levelNum % levels.length]
    // Return a copy of it, because some state in it gets mutated during play.
    // Can't use structuredClone because of the type fields which contain functions.
    return {name: level.name,
            scales: level.scales,
            ground: cloneGroundOrObjects(level.ground),
            objects: cloneGroundOrObjects(level.objects),
            isComplete: level.isComplete
            }
}

function cloneGroundOrObjects(originalArray){
    return originalArray.map((e)=>{
        let copy=clone(e)
        copy.type = e.type
        return copy
    })
}

function clone(original){
    let copy = JSON.parse(JSON.stringify(original))
    copy.type = original.type
    return copy
}
