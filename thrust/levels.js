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
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05]},
        ],
        objects: [
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
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
    }
]

export function getLevel(levelNum){
    return levels[levelNum % levels.length]
}
