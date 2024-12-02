"use strict";
import {shapes} from './shapes.js'

const levels = [
    {
        name: "Land Carefully",
        scales: {x:1, y:1},
        // GroundBlocks are a way to quickly express some version of background.
        // An array of equal length strings, representing the full scene.
        // So an array of 10 string of length 10 would be a 100 pixel version of the background.
        // Treat each character as a rectangle. No properties set on any of them.
        // Can optimise later be merging the rectangles in to a smaller number of larger shapes.
        groundBlocks: {
            size: {x:3, y:3},   // Optional. How many screens wide/high do these blocks cover?
            blocks: [
            "###",
            "# #",
            "###"
            ]
        },
        ground: [
            {type: shapes.rectangle, coords:[-0.05, 0.25, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: shapes.rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true},
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Collect",
        scales: {x:1, y:1},
        groundBlocks: {
            size: {x:3, y:3},
            blocks: [
            "###",
            "# #",
            "###"
            ]
        },
        ground: [
            {type: shapes.rectangle, coords:[-0.05, 0.25, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: shapes.rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true, disabled: true},
            {type: shapes.circle, coords:[-0.25, 0.25, 0.05], message: "Nom"},
        ],
        isComplete: function(){
            for (let collectable of this.objects){
                if (!collectable.landingPad && !collectable.collected){
                    return false
                }
            }
            // Everything has been collected. Enable the landing pad.
            this.objects[0].disabled = false    // Assumes the landing pad is first object. Rather than scanning for it.
            return true
        }
    },
    {
        name: "Refuel",
        scales: {x:1, y:1}, // Wide
        startCoords: {x:-3, y:-0.25},    //TODO. When these are passed to the ship, they use the ship's scaling, but I want them to use the _level_/scene scaling.
        groundBlocks: {
            size: {x:6, y:2},
            blocks: [
            "############",
            "#          #",
            "########## #",
            "#          #",
            "############"
            ]
        },
        ground: [
            {type: shapes.rectangle, coords:[-2.25, 0.5, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: shapes.rectangle, coords:[-2.25, 0.5, 0.1, 0.01], landingPad: true, disabled: true},
            {type: shapes.circle, coords:[2.35, 0, 0.08], fuel: 75, message: "Fuel"},
        ],
        isComplete: function(){
            for (let collectable of this.objects){
                if (!collectable.landingPad && !collectable.collected){
                    return false
                }
            }
            // Everything has been collected. Enable the landing pad.
            this.objects[0].disabled = false    // Assumes the landing pad is first object. Rather than scanning for it.
            return true
        }
    },
    {
        name: "Carry",
        scales: {x:1, y:1},
        ground: [
            {type: shapes.rectangle, coords:[-1, -1, 2, 0.5]},
            {type: shapes.rectangle, coords:[-1, 0.5, 2, 0.5]},
            {type: shapes.rectangle, coords:[-1, -0.5, 0.5, 1]},
            {type: shapes.rectangle, coords:[0.5, -0.5, 0.5, 1]}
        ],
        objects: [
            {type: shapes.rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true, disabled: true},
            {type: shapes.circle, coords:[-0.25, 0.25, 0.02], message: "Carry me", payload: 1},
        ],
        isComplete: function(){
            for (let collectable of this.objects){
                if (!collectable.landingPad && !collectable.collected){
                    return false
                }
            }
            // Everything has been collected. Enable the landing pad.
            this.objects[0].disabled = false    // Assumes the landing pad is first object. Rather than scanning for it.
            return true
        }
    },
    {
        name: "Unlock",
        scales: {x:1, y:1},
        startCoords: {x: -0.25, y: 0},
        ground: [
            {type: shapes.rectangle, coords:[-1, -1, 2, 0.5]},
            {type: shapes.rectangle, coords:[-1, 0.5, 2, 0.5]},
            {type: shapes.rectangle, coords:[-1, -0.5, 0.5, 1]},
            {type: shapes.rectangle, coords:[0.5, -0.5, 0.5, 1]},
            {type: shapes.rectangle, coords: [-0.02, -0.5, 0.04, 0.4]},
            {type: shapes.rectangle, coords: [-0.02, 0.1, 0.04, 0.4]},
        ],
        objects: [
            {type: shapes.rectangle, coords:[0.25, 0.25, 0.1, 0.01], landingPad: true, disabled: false},
            {type: shapes.triangle, coords:[-0.25, 0.25, -0.24, 0.27, -0.26, 0.27], message: "Key A", key: "A"},
            {type: shapes.rectangle, coords: [-0.01, -0.15, 0.02, 0.3], needsKey: "A", message: "Unlocked"}
        ],
        isComplete: function(){
            // If you can reach the landing pad then that's all there is to it.
            return true
        }
    },
    {
        name: "Tight Squeeze",
        scales: {x:1, y:1},
        startCoords: {x:-0.4, y:0},
        ground: [
            {type: shapes.rectangle, coords:[-1, -0.85, 1, 0.8]},
            {type: shapes.rectangle, coords:[-1, 0.05, 3, 1]},
            {type: shapes.rectangle, coords:[0.05, -0.75, 0.5, 0.8]},
            {type: shapes.rectangle, coords:[-1, -1.05, 2.5, 0.2]},
            {type: shapes.rectangle, coords:[0.6, -1, 0.1, 0.95]},
            {type: shapes.rectangle, coords:[1.2, -1, 1, 1.25]}
        ],
        objects: [
            {type: shapes.rectangle, coords:[-0.75, 0.045, 0.1, 0.01], landingPad: true},
            {type: shapes.triangle, coords:[0.95, -0.45, 0.945, -0.425, 0.955, -0.425], key: "A"},
            {type:shapes.circle, coords:[0.95, -0.3, 0.025], fuel:100},
            {type:shapes.circle, coords:[-0.4, 0, 0.025], fuel:100},
            {type: shapes.rectangle, coords:[-0.375, -0.1, 0.05, 0.2], needsKey: "A"}
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Level x",
        scales: {x:2, y:1},
        ground: [
            {type: shapes.triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: shapes.triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: shapes.quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.01], landingPad: true},
            {type: shapes.circle, coords:[-0.1, 0.1, 0.01], fuel: 25, message: "Fuel"},
            {type: shapes.circle, coords:[-0.2, 0.1, 0.01], health: 50, message: "Undamage"}
        ],
        isComplete: function(){
            // Has the ship landed?
            for (let landingPad of this.objects.filter((e)=>{return e.landingPad})){
                return landingPad.collected
            }
            return false
        }
    },
    {
        name: "Level y",
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
    let startCoords = {x:0, y:0}
    if (level.startCoords){
        startCoords = level.startCoords
    }

    return {name: level.name,
            scales: level.scales,
            startCoords,
            ground: cloneGroundOrObjects(level.ground).concat(groundBlocksToRectangles(level.groundBlocks || {})),
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

function groundBlocksToRectangles(blockInfo){
    let size = blockInfo.size || {x:1, y:1}
    let blocks = blockInfo.blocks || []
    if (!blocks || blocks.length == 0){
        return []
    }
    let rectangles = []
    let numRows = blocks.length
    let numCols = blocks[0].length
    for (let row=0; row < blocks.length; row++){
        for (let col=0; col < blocks[row].length; col++){
            let thisChar = blocks[row][col]
            if (thisChar != " "){
                rectangles.push({
                    type: shapes.rectangle,
                    coords: [size.x * col/numCols - size.x/2, size.y * row/numRows - size.y/2, size.x/numCols, size.y/numRows]
                })
            }
        }
    }
    return rectangles
}