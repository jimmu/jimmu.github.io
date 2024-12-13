"use strict";
import {point, triangle, rectangle, quadrilateral, circle} from './shapes.js'

const groundChars = "#/"

const standardObjectTypes = new Map([
    // Landing pad
    ["L", {type: rectangle, coords:[-0.5, 0.4, 1, 0.1], landingPad: true}],
    // Full fuel
    ["F", {type: circle, coords:[0, 0, 0.5], fuel:100, message: "100 Fuel"}],
    // Half fuel
    ["f", {type: circle, coords:[0, 0, 0.3], fuel:50, message: "50 Fuel"}],
    // Full health
    ["H", {type: circle, coords:[0, 0, 0.3], health:100, message: "100 UnDamage"}],
    // Half health
    ["h", {type: circle, coords:[0, 0, 0.3], health:50, message: "50 UnDamage"}],
    // Payload
    ["p", {type: circle, coords:[0, 0, 0.3], payload: 1, message: "Carry me"}],
]);

const standardGroundTypes = new Map([
    // Triangle top left, to be used as ground. Note this label is more than one character, so can't be referenced directly from the block map.
    ["ttl", {type: triangle, coords:[-0.5, -0.5, 0.5, -0.5, -0.5, 0.5]}],
    ["tbr", {type: triangle, coords:[0.5, -0.5, 0.5, 0.5, -0.5, 0.5]}],  // bottom right
    ["tbl", {type: triangle, coords:[-0.5, -0.5, 0.5, 0.5, -0.5, 0.5]}], // bottom left
    ["ttr", {type: triangle, coords:[-0.5, -0.5, 0.5, -0.5, 0.5, 0.5]}], // top right
])

// TODO. Think about using character based coordinates for all of the ground stuff.
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
            "##########F#",
            "#          #",
            "############"
            ]
        },
        ground: [
            {type: rectangle, coords:[-2.25, 0.5, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: rectangle, coords:[-2.25, 0.5, 0.1, 0.01], landingPad: true, disabled: true}
        ],
        objectTypes: new Map([
            // Override the standard big fuel
            ["F", {type: circle, coords:[0, 0, 0.2], fuel:100, message: "100 Fuel"}],
        ]),
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
        groundBlocks: {
            size: {x:1, y:1},
            blocks: [
            "############",
            "#/        /#",
            "#     . L  #",
            "#/        /#",
            "### ########",
            "#/        /#",
            "#F     p   #",
            "#/        /#",
            "############"
            ]
        },
        isComplete: function(){
            for (let collectable of this.objects){
                if (!collectable.landingPad && !collectable.collected){
                    return false
                }
            }
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
        name: "Repair",
        groundBlocks: {
            size: {x:1, y:1},
            blocks: [
            "##################################",
            "##################################",
            "######/ /##############/    /#####",
            "######                   //  #####",
            "######  /##/    /#####/ /##  #####",
            "######  /####/  ######/ ### /#####",
            "###### h #####  #####/ H ##h######",
            "######/  #####  ###/   /### /#####",
            "#######  #####  /#/ /######  #####",
            "######/ /####  h    #######  /####",
            "#####/  ######  /#/ /#####/   /###",
            "###/    ######ff###  /###/     ###",
            "## .   /######/ ###/       LL /###",
            "############### ##################",
            "##################################",
            "##################################",
            ]
        },
        ground: [],
        objectTypes: new Map([
            ["K", {type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25], key: "A"}],
            ["D", {type: rectangle, coords:[0, -1, 0.5, 2], needsKey: "A"}]
        ]),
        isComplete: function(){
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
            "####### ########f## ######  F  ###",  // This f is the name of an object which will be fully defined in the object types array.
            "##LfD . ###########            ###",  // This . is the start point. L will be the landing pad. D the door. K the key
            "##################################",
            "##################################",
            "##################################",
            ]
        },
        ground: [],
        objectTypes: new Map([
            ["K", {type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25], key: "A"}],
            ["D", {type: rectangle, coords:[0, -1, 0.5, 2], needsKey: "A"}]
        ]),
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
    // Return a copy of it, because some state in it gets mutated during play
    // and we want the level to be replayable.
    // Can't use structuredClone because of the fields which contain functions.
    let levelCopy = {
        name: level.name,
        startCoords: level.startCoords || {x:0, y:0},
        groundBlocks: level.groundBlocks,
        ground: structuredClone(level.ground || []),
        objects: structuredClone(level.objects || []),
        objectTypes: structuredClone(level.objectTypes|| new Map()),
        isComplete: level.isComplete
    }
    processGroundBlocks(levelCopy)
    return levelCopy
}

function processGroundBlocks(level){
    if (!level.groundBlocks || !level.groundBlocks.blocks){
        return []
    }
    let blockInfo = level.groundBlocks
    let blocks = level.groundBlocks.blocks
    const size = blockInfo.size || {x:1, y:1}
    const numRows = blocks.length
    const numCols = blocks[0].length
    const oneCharSize = {x: size.x/numCols, y: size.y/numRows}
    let blockRectangles = []
    for (let row=0; row < blocks.length; row++){
        let rectangleInProgress = null
        for (let col=0; col < blocks[row].length; col++){
            let thisChar = blocks[row][col]
            let boxTopLeft = {x: col * oneCharSize.x - size.x/2,
                              y: row * oneCharSize.y - size.y/2}
            let boxCentre = {x: boxTopLeft.x + oneCharSize.x/2,
                             y: boxTopLeft.y + oneCharSize.y/2}
            if (thisChar == "#"){
                if (rectangleInProgress != null){
                    rectangleInProgress.width++
                }
                else {
                    rectangleInProgress = {row, col, width: 1, height: 1}
                }
            }
            if (thisChar != "#" || col == blocks[row].length-1) {
                // If we had a rectangle in progress, we now know its size. add it to the list now.
                if (rectangleInProgress){
                    //Keep the coordinates as the integer row,col for now
                    //So that consolidating vertically doesn't break down due to rounding errors.
                    blockRectangles.push(structuredClone(rectangleInProgress))
                    rectangleInProgress = null  // Start a new one.
                }
            }
            if (thisChar == "."){
                // Return the coordinates of the middle of this box.
                level.startCoords = {x: boxCentre.x, y: boxCentre.y}
            }
            else {
                // Is this a standard ground type block?
                if (thisChar == "/" || thisChar == "?"){
                    // We'll make a block to add to the ground rather than the objects
                    let groundToTheLeft = (col > 0 && groundChars.includes(blocks[row][col-1]))
                    let groundAbove = (row > 0 && groundChars.includes(blocks[row-1][col]))
                    let triangleType = groundAbove? (groundToTheLeft ? "ttl" : "ttr") :
                                       groundToTheLeft? "tbl" : "tbr"
                    let newGround = standardGroundTypes.get(triangleType)
                    newGround = structuredClone(newGround)
                    newGround.coords[0] = newGround.coords[0]*oneCharSize.x + boxCentre.x
                    newGround.coords[1] = newGround.coords[1]*oneCharSize.y + boxCentre.y
                    newGround.coords[2] = newGround.coords[2]*oneCharSize.x + boxCentre.x
                    newGround.coords[3] = newGround.coords[3]*oneCharSize.y + boxCentre.y
                    newGround.coords[4] = newGround.coords[4]*oneCharSize.x + boxCentre.x
                    newGround.coords[5] = newGround.coords[5]*oneCharSize.y + boxCentre.y
                    level.ground.push(newGround)
                }
                else {
                    // If there's an object type with this label, make a copy of it into the level's objects.
                    let newObject = level.objectTypes.get(thisChar) || standardObjectTypes.get(thisChar)
                    if (newObject){
                        newObject = structuredClone(newObject)
                        level.objects.push(newObject)
                    }
                    // Set its position to the middle of this box.
                    if (newObject){
                        // What we do with the coords depends on the type of object.
                        if (newObject.type == circle) {
                            newObject.coords[0] = newObject.coords[0]*oneCharSize.x + boxCentre.x
                            newObject.coords[1] = newObject.coords[1]*oneCharSize.y + boxCentre.y
                            newObject.coords[2] *= oneCharSize.x
                        }
                        else if (newObject.type == rectangle){
                            // The given coordinates are in units of 1 box size.
                            // And that the coordinates are relative.
                            newObject.coords[0] = newObject.coords[0]*oneCharSize.x + boxCentre.x
                            newObject.coords[1] = newObject.coords[1]*oneCharSize.y + boxCentre.y
                            newObject.coords[2] *= oneCharSize.x
                            newObject.coords[3] *= oneCharSize.y
                        }
                        else if (newObject.type == triangle){
                            // The given coordinates are in units of 1 box size.
                            // And that the coordinates are relative.
                            newObject.coords[0] = newObject.coords[0]*oneCharSize.x + boxCentre.x
                            newObject.coords[1] = newObject.coords[1]*oneCharSize.y + boxCentre.y
                            newObject.coords[2] = newObject.coords[2]*oneCharSize.x + boxCentre.x
                            newObject.coords[3] = newObject.coords[3]*oneCharSize.y + boxCentre.y
                            newObject.coords[4] = newObject.coords[4]*oneCharSize.x + boxCentre.x
                            newObject.coords[5] = newObject.coords[5]*oneCharSize.y + boxCentre.y
                        }
                    }
                }
            }
        }
    }
    level.ground = level.ground.concat(consolidateBlocks(size, oneCharSize, blockRectangles))
}

function consolidateBlocks(size, oneCharSize, blockRectangles){
    // First consolidate horizontally.
    // Look for adjacent rectangles where the neighbouring one has the same height and the left/rights match.
    let rectangles = []
    // We have consolidated blocks horizontally into long rectangles already.
    // Now see if any match ones directly below them too.
    for (let i=0; i < blockRectangles.length; i++){
        let thisBlock = blockRectangles[i]
        // Look ahead for another rectangle with the same start column and width but on the next row.
        for (let j=i+1; j < blockRectangles.length; j++){
            let candidateBlock = blockRectangles[j]
            if (candidateBlock.row == thisBlock.row + thisBlock.height &&
                candidateBlock.col == thisBlock.col &&
                candidateBlock.width == thisBlock.width) {
                // We have a match. Expand the current block.
                thisBlock.height++
                // And scrap the candidate one. Can't remove it from the array as we're iterating over that currently.
                candidateBlock.row = -1
                candidateBlock.col = -1
                candidateBlock.width = 0
            }
        }
    }

    // Convert to real coordinates, from character positions
    for (let blockRectangle of blockRectangles.filter((r)=>{return r.width > 0})){
        let topLeft = {x: blockRectangle.col * oneCharSize.x - size.x/2,
                       y: blockRectangle.row * oneCharSize.y - size.y/2}
        // Testing collision thing: Yes, this does at least in the short term fix the ground-blocks collision thing.
        // By using a quadrilateral instead of a rectangle, we get a shape where the is-fully-inside check works.
        rectangles.push({
            type: quadrilateral, coords: [
                topLeft.x, topLeft.y,
                topLeft.x + blockRectangle.width * oneCharSize.x, topLeft.y,
                topLeft.x + blockRectangle.width * oneCharSize.x, topLeft.y + blockRectangle.height * oneCharSize.y,
                topLeft.x, topLeft.y + blockRectangle.height * oneCharSize.y
            ]
        })
        //        rectangles.push({
        //            type: rectangle,
        //            coords: [topLeft.x, topLeft.y, blockRectangle.width * oneCharSize.x, blockRectangle.height * oneCharSize.y]
        //        })
    }
    return rectangles
}