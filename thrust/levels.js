"use strict";
import {point, triangle, rectangle, quadrilateral, circle} from './shapes.js'

const levels = [
    {
        name: "Land Carefully",
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
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true},
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Collect",
        groundBlocks: {
            size: {x:3, y:3},
            blocks: [
            "###",
            "# #",
            "###"
            ]
        },
        ground: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true, disabled: true},
            {type: circle, coords:[-0.25, 0.25, 0.05], message: "Nom"},
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
        startCoords: {x:-2.25, y:-0.25},
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
            {type: rectangle, coords:[-2.25, 0.5, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: rectangle, coords:[-2.25, 0.5, 0.1, 0.01], landingPad: true, disabled: true},
            {type: circle, coords:[2.35, 0, 0.08], fuel: 100, message: "Fuel"},
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
        ground: [
            {type: rectangle, coords:[-1, -1, 2, 0.5]},
            {type: rectangle, coords:[-1, 0.5, 2, 0.5]},
            {type: rectangle, coords:[-1, -0.5, 0.5, 1]},
            {type: rectangle, coords:[0.5, -0.5, 0.5, 1]}
        ],
        objects: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true, disabled: true},
            {type: circle, coords:[-0.25, 0.25, 0.02], message: "Carry me", payload: 1},
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
        startCoords: {x: -0.25, y: 0},
        ground: [
            {type: rectangle, coords:[-1, -1, 2, 0.5]},
            {type: rectangle, coords:[-1, 0.5, 2, 0.5]},
            {type: rectangle, coords:[-1, -0.5, 0.5, 1]},
            {type: rectangle, coords:[0.5, -0.5, 0.5, 1]},
            {type: rectangle, coords: [-0.02, -0.5, 0.04, 0.4]},
            {type: rectangle, coords: [-0.02, 0.1, 0.04, 0.4]},
        ],
        objects: [
            {type: rectangle, coords:[0.25, 0.25, 0.1, 0.01], landingPad: true, disabled: false},
            {type: triangle, coords:[-0.25, 0.25, -0.24, 0.27, -0.26, 0.27], message: "Key A", key: "A"},
            {type: rectangle, coords: [-0.01, -0.15, 0.02, 0.3], needsKey: "A", message: "Unlocked"}
        ],
        isComplete: function(){
            // If you can reach the landing pad then that's all there is to it.
            return true
        }
    },
    {
        name: "Slight Squeeze",
        groundBlocks: {
            size: {x:2, y:1.5},
            blocks: [
            "##################################",
            "##################################",
            "##################################",
            "#######                 ##########",
            "####### ############### ##########",
            "####### ############### ##########",
            "####### ############### ##########",
            "####### ###########     ##########",
            "####### ########### ##############",
            "####### ##### f     ##############",
            "####### ######## ## ######  K  ###",
            "####### ########g## ######  F  ###",  // This f is the name of an object which will be fully defined in the objects array.
            "###LD . ###########            ###",  // This . is the start point. L will be the landing pad. D the door. K the key
            "##################################",
            "##################################",
            "##################################",
            ]
        },
        ground: [],
        objects: [
            {label: "L", type: rectangle, coords:[-0.5, 0.4, 1, 0.1], landingPad: true},    // When a shape has a label then its coordinates are relative to the centre of its character block. And sizes are in units of the character size.
            {label: "K", type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25], key: "A"},
            {label: "F", type: circle, coords:[0, 0, 0.5], fuel:100},
            {label: "f", type: circle, coords:[0, 0, 0.3], fuel:50},
            {label: "g", type: circle, coords:[0, 0, 0.3], fuel:50},
            {label: "L", type: circle, coords:[0.5, 0, 0.5], fuel:100},
            {label: "D", type: rectangle, coords:[0, -1, 0.5, 2], needsKey: "A"}
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Tight Squeeze",
        startCoords: {x:-0.2, y:0},
        ground: [
            {type: rectangle, coords:[-1, -0.85, 1, 0.8]},
            {type: rectangle, coords:[-1, 0.05, 3, 1]},
            {type: rectangle, coords:[0.05, -0.75, 0.5, 0.8]},
            {type: rectangle, coords:[-1, -1.05, 2.5, 0.2]},
            {type: rectangle, coords:[0.6, -1, 0.1, 0.95]},
            {type: rectangle, coords:[1.2, -1, 1, 1.25]}
        ],
        objects: [
            {type: rectangle, coords:[-0.75, 0.045, 0.1, 0.01], landingPad: true},
            {type: triangle, coords:[0.95, -0.45, 0.945, -0.425, 0.955, -0.425], key: "A"},
            {type: circle, coords:[0.95, -0.3, 0.025], fuel:100},
            {type: circle, coords:[-0.4, 0, 0.025], fuel:100},
            {type: rectangle, coords:[-0.375, -0.1, 0.05, 0.2], needsKey: "A"}
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Level x",
        ground: [
            {type: triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.01], landingPad: true},
            {type: circle, coords:[-0.1, 0.1, 0.01], fuel: 25, message: "Fuel"},
            {type: circle, coords:[-0.2, 0.1, 0.01], health: 50, message: "Undamage"}
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
        ground: [
            {type: triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
            {type: circle, coords:[-0.1, 0.1, 0.01], fuel: 25},
            {type: circle, coords:[-0.2, 0.1, 0.01], health: 50}
        ],
        isComplete: function(){
            return false
        }
    }
]

export function getLevel(levelNum){
    let level = levels[levelNum % levels.length]
    // Return a copy of it, because some state in it gets mutated during play.
    // Can't use structuredClone because of the fields which contain functions.
    let objects = structuredClone(level.objects)
    groundBlocksToObjectPositions(level.groundBlocks, objects)

    return {name: level.name,
            startCoords: level.startCoords || groundBlocksToStartPosition(level.groundBlocks) || {x:0, y:0},
            ground: structuredClone(level.ground).concat(groundBlocksToRectangles(level.groundBlocks || {})),
            objects,
            isComplete: level.isComplete
            }
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
            if (thisChar == "#"){
                rectangles.push({
                    type: rectangle,
                    coords: [size.x * col/numCols - size.x/2, size.y * row/numRows - size.y/2, size.x/numCols, size.y/numRows]
                })
            }
        }
    }
    return rectangles
}

function groundBlocksToObjectPositions(blockInfo, objects){
    // Find characters which are not ground and set the position of the related objects.
    if (!blockInfo){
        return
    }
    let blocks = blockInfo.blocks || []
    if (!blocks || blocks.length == 0){
        return
    }
    let size = blockInfo.size || {x:1, y:1}
    let startPos = null
    let numRows = blocks.length
    let numCols = blocks[0].length
    let oneCharSize = {x: size.x/numCols, y: size.y/numRows}
    for (let row=0; row < blocks.length; row++){
        for (let col=0; col < blocks[row].length; col++){
            let thisChar = blocks[row][col]
            if (thisChar != "#" && thisChar != "."){
                // Find any object with a label matching this character.
                // Set its position to the middle of this box.
                let boxPosX = ((col+0.5) * oneCharSize.x) - size.x/2
                let boxPosY = ((row+0.5) * oneCharSize.y) - size.y/2
                for (let object of objects){
                    if (thisChar == object.label){
                        // What we do with the coords depends on the type of object.
                        if (object.type == circle) {
                            object.coords[0] = object.coords[0]*oneCharSize.x + boxPosX
                            object.coords[1] = object.coords[1]*oneCharSize.y + boxPosY
                            object.coords[2] *= oneCharSize.x
                        }
                        if (object.type == rectangle){
                            // The given coordinates are in units of 1 box size.
                            // And that the coordinates are relative.
                            object.coords[0] = object.coords[0]*oneCharSize.x + boxPosX
                            object.coords[1] = object.coords[1]*oneCharSize.y + boxPosY
                            object.coords[2] *= oneCharSize.x
                            object.coords[3] *= oneCharSize.y
                        }
                        if (object.type == triangle){
                            // The given coordinates are in units of 1 box size.
                            // And that the coordinates are relative.
                            object.coords[0] = object.coords[0]*oneCharSize.x + boxPosX
                            object.coords[1] = object.coords[1]*oneCharSize.y + boxPosY
                            object.coords[2] = object.coords[2]*oneCharSize.x + boxPosX
                            object.coords[3] = object.coords[3]*oneCharSize.y + boxPosY
                            object.coords[4] = object.coords[4]*oneCharSize.x + boxPosX
                            object.coords[5] = object.coords[5]*oneCharSize.y + boxPosY
                        }
                    }
                }
            }
        }
    }
}

function groundBlocksToStartPosition(blockInfo){
    if (!blockInfo){
        return
    }
    let size = blockInfo.size || {x:1, y:1}
    let blocks = blockInfo.blocks || []
    if (!blocks || blocks.length == 0){
        return null
    }
    let startPos = null
    let numRows = blocks.length
    let numCols = blocks[0].length
    for (let row=0; row < blocks.length; row++){
        for (let col=0; col < blocks[row].length; col++){
            let thisChar = blocks[row][col]
            if (thisChar == "."){
                // Return the coordinates of the middle of this box.
                return {x: size.x * (col+0.5)/numCols - size.x/2, y: size.y * (row+0.5)/numRows - size.y/2}
            }
        }
    }
    return null
}