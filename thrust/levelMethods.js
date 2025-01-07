"use strict";
import {point, triangle, rectangle, quadrilateral, circle, rotate, translate, offsetShape, offsetSizeShape} from './shapes.js'
import {colours} from "./config.js"
const groundChars = "#/"

//TODO. Objects which boost speed, change ship size, teleport?
const standardObjectTypes = new Map([
    // Landing pad
    ["L", {type: rectangle, coords:[-0.5, 0.4, 1, 0.1], landingPad: true, permanent: true}],
    // Full fuel
    ["F", {type: circle, coords:[0, 0, 0.5], fuel:100, message: "100 Fuel", colour: colours.fuel}],
    // Half fuel
    ["f", {type: circle, coords:[0, 0, 0.3], fuel:50, message: "50 Fuel", colour:  colours.fuel}],
    // Full health
    ["H", {type: circle, coords:[0, 0, 0.3], health:100, message: "100 UnDamage", colour: colours.health}],
    // Half health
    ["h", {type: circle, coords:[0, 0, 0.3], health:50, message: "50 UnDamage", colour: colours.health}],
    // Payload
    ["p", {type: circle, coords:[0, 0, 0.3], payload: 1, message: "Carry me", mandatory: true}],
    // Collectable / Coin
    ["c", {type: circle, coords:[0, 0, 0.4], mandatory: true, colour: colours.coin}],
    // Extra life
    ["E", {type: quadrilateral, coords:[0, -0.25, 0.25, 0, 0, 0.25, -0.25, 0], extraLife: true, message: "Extra Life!", colour: colours.extraLife}],
    // Key. Can override the needsKey value if need be
    ["K", {type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25], key: "A"}],
    // Door. Vertical. Can override the needsKey value if need be
    // Could do automagic detection of whether to use vertical or horizontal door.
    ["D", {type: rectangle, coords:[0, -1, 0.5, 2], needsKey: "A"}]

]);

const standardGroundTypes = new Map([
    // Triangles to be used as ground.
    // All triangles are referenced as "/" in the map.
    // Which kind gets used depends on whether there is ground above/below/left/right of the triangle.
    // TODO. Extra option of using ^, v, >, < for bottom, top, left, right triangles
    ["ttl", {type: triangle, coords:[-0.5, -0.5, 0.5, -0.5, -0.5, 0.5]}],
    ["tbr", {type: triangle, coords:[0.5, -0.5, 0.5, 0.5, -0.5, 0.5]}],  // bottom right
    ["tbl", {type: triangle, coords:[-0.5, -0.5, 0.5, 0.5, -0.5, 0.5]}], // bottom left
    ["ttr", {type: triangle, coords:[-0.5, -0.5, 0.5, -0.5, 0.5, 0.5]}], // top right
    ["tl",  {type: triangle, coords:[-0.5, -0.5, 0.5, 0, -0.5, 0.5]}], // left
    ["tr",  {type: triangle, coords:[0.5, -0.5, 0.5, 0.5, -0.5, 0]}], // right
    ["tt",  {type: triangle, coords:[-0.5, -0.5, 0.5, -0.5, 0, 0.5]}], // top
    ["tb",  {type: triangle, coords:[-0.5, 0.5, 0, -0.5, 0.5, 0.5]}], // bottom
    ["t",   {type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25]}], // middle
    // A block. Maybe useful as dynamic ground
    ["b",   {type: rectangle, coords:[-0.5, -0.5, 1, 1]}],
])

const movementFunctions = {
    // 0 to 1 treated as proportion of a full circle.
    sin: (object, propertyName, scale)=>{
        return Math.sin(2 * Math.PI * object.phase) * (object[propertyName]||1) * scale
    },
    cos: (object, propertyName, scale)=>{
        return Math.cos(2 * Math.PI * object.phase) * (object[propertyName]||1) * scale
    },
    absSin: (object, propertyName, scale)=>{
        return Math.abs(Math.sin(2 * Math.PI * object.phase) * (object[propertyName]||1)) * scale
    },
    absCos: (object, propertyName, scale)=>{
        return Math.abs(Math.cos(2 * Math.PI * object.phase) * (object[propertyName]||1)) * scale
    },
    // A sin wave between 0 and 1 instead of +/- 1.
    posSin: (object, propertyName, scale)=>{
        return ((1 + Math.sin(2 * Math.PI * object.phase))/2) * (object[propertyName]||1) * scale
    },
    posCos: (object, propertyName, scale)=>{
        return ((1 + Math.cos(2 * Math.PI * object.phase))/2) * (object[propertyName]||1) * scale
    },
    // Linearly from 0 to 1
    rampUp: (object, propertyName, scale)=>{
        return (object[propertyName]||1) * object.phase * scale
    },
    // Linearly from 1 down to 0
    rampDown: (object, propertyName, scale)=>{
        return (object[propertyName]||1) * (1-object.phase) * scale
    },
    // Linearly from 0 to 1 and back down to 0
    rampUpAndBack: (object, propertyName, scale)=>{
        let phase = 2 * object.phase
        if (phase >=1){
            phase = 2 - phase
        }
        return (object[propertyName]||1) * phase * scale
    }
}

export function decorate(objectType, decoration){
    let baseObject = standardObjectTypes.get(objectType)
    if (!baseObject) {
        baseObject = standardGroundTypes.get(objectType)
    }
    // Merge the properties of the two objects. Decoration will override matching properties in the base object.
    return {...baseObject, ...decoration}
}

export function makeSwitch(switchName, message){
    return {type: rectangle, coords:[-0.1, -0.1, 0.2, 0.2], isSwitch: switchName, message, colour: colours.switches, permanent: true}
}

export function defaultCompleteness(){
    for (let collectable of this.objects){
        if (collectable.mandatory && !collectable.collected){
            return false
        }
    }
    return true
}

export function updateDynamicObjects(objects){
    let objNum = 0
    for (let object of objects.filter((o)=>{return o.isDynamic})){
        // Anything dynamic we can mess about with on the fly.
        // But what we do with it?
        // Lets offset its x coordinate by some varying amount.
        if (object.originalCoords === undefined){
            object.lastUpdated = Date.now()
            object.originalCoords = structuredClone(object.coords)
            if (object.type == rectangle){
                // We need named properties for the dynamic methods to work with.
                object.originalX = object.originalCoords[0]
                object.originalY = object.originalCoords[1]
                object.originalWidth = object.originalCoords[2]
                object.originalHeight = object.originalCoords[3]
            }
        }
        if (!object.phase){
            object.phase = 0
        }
        let now = Date.now()
        let elapsedSeconds = (now - object.lastUpdated)/1000
        object.lastUpdated = now
        let periodSeconds = object.period || 1
        object.phase += (elapsedSeconds/periodSeconds)
        object.phase = object.phase % 1
        // TODO. This assumes the shape coordinates are of a rectangle. Do we want to allow other shapes?
        // Use translate/scale methods in the shapes class instead of assuming rectangle here.
        let xOffset = 0
        let yOffset = 0
        if (object.xOffsetFn){
            xOffset = movementFunctions[object.xOffsetFn[0]](object, ...object.xOffsetFn.slice(1))
            //object.coords[0] = object.originalX + xOffset
        }
        if (object.yOffsetFn){
            yOffset = movementFunctions[object.yOffsetFn[0]](object, ...object.yOffsetFn.slice(1))
            //object.coords[1] = object.originalY + yOffset
        }
        offsetShape(object, xOffset, yOffset)
        let widthOffset = 0
        let heightOffset = 0
        if (object.widthOffsetFn){
            widthOffset = movementFunctions[object.widthOffsetFn[0]](object, ...object.widthOffsetFn.slice(1))
            //object.coords[2] = object.originalWidth + widthOffset
        }
        if (object.heightOffsetFn){
            heightOffset = movementFunctions[object.heightOffsetFn[0]](object, ...object.heightOffsetFn.slice(1))
            //object.coords[3] = object.originalHeight + heightOffset
        }
        offsetSizeShape(object, widthOffset, heightOffset)
        objNum++
    }
}

export function processGroundBlocks(level){
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
        for (let col=0; col < blocks[row].length; col++){
            let thisChar = blocks[row][col]
            let boxTopLeft = {x: col * oneCharSize.x - size.x/2,
                              y: row * oneCharSize.y - size.y/2}
            let boxCentre = {x: boxTopLeft.x + oneCharSize.x/2,
                             y: boxTopLeft.y + oneCharSize.y/2}
            if (thisChar == "#"){
                blockRectangles.push({row, col, width: 1, height: 1})
            }
            if (thisChar == "."){
                // Return the coordinates of the middle of this box.
                level.startCoords = {x: boxCentre.x, y: boxCentre.y}
            }
            else {
                // Is this a standard ground type block?
                if (thisChar == "/"){   // Automagic triangles.
                    // We'll make a block to add to the ground rather than the objects
                    let groundToTheLeft = (col > 0 && groundChars.includes(blocks[row][col - 1]))
                    let groundToTheRight = (col < blocks[row].length - 1 && groundChars.includes(blocks[row][col + 1]))
                    let groundAbove = (row > 0 && groundChars.includes(blocks[row - 1][col]))
                    let groundBelow = (row < blocks.length - 1 && groundChars.includes(blocks[row + 1][col]))
                    // Make a bit mask representing where there are ground blocks.
                    let lrtb = (groundToTheLeft ? 8 : 0) |
                               (groundToTheRight ? 4 : 0) |
                               (groundAbove ? 2 : 0) |
                               (groundBelow ? 1 : 0)
                    let triangleType = ["t", "tb", "tt", "#",
                                        "tr", "tbr", "ttr", "#",
                                        "tl", "tbl", "ttl", "#",
                                        "#", "#", "#", "#"][lrtb]
                    if (triangleType == "#"){
                        blockRectangles.push({row, col, width:1, height:1})
                    }
                    else {
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
                        else if (newObject.type == quadrilateral){
                            // The given coordinates are in units of 1 box size.
                            // And that the coordinates are relative.
                            newObject.coords[0] = newObject.coords[0]*oneCharSize.x + boxCentre.x
                            newObject.coords[1] = newObject.coords[1]*oneCharSize.y + boxCentre.y
                            newObject.coords[2] = newObject.coords[2]*oneCharSize.x + boxCentre.x
                            newObject.coords[3] = newObject.coords[3]*oneCharSize.y + boxCentre.y
                            newObject.coords[4] = newObject.coords[4]*oneCharSize.x + boxCentre.x
                            newObject.coords[5] = newObject.coords[5]*oneCharSize.y + boxCentre.y
                            newObject.coords[6] = newObject.coords[6]*oneCharSize.x + boxCentre.x
                            newObject.coords[7] = newObject.coords[7]*oneCharSize.y + boxCentre.y
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
    for (let i=0; i < blockRectangles.length; i++){
        let thisBlock = blockRectangles[i]
        // Look ahead for another rectangle with the same start column and width but on the next column.
        for (let j=i+1; j < blockRectangles.length; j++){
            let candidateBlock = blockRectangles[j]
            if (candidateBlock.row == thisBlock.row &&
                candidateBlock.col == thisBlock.col + thisBlock.width) {
                // We have a match. Expand the candidate block.
                candidateBlock.width = thisBlock.width + candidateBlock.width
                candidateBlock.col = thisBlock.col
                // And scrap the current one. Can't remove it from the array as we're iterating over that currently.
                thisBlock.row = -1
                thisBlock.col = -1
                thisBlock.width = 0
            }
        }
    }
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
                // We have a match. Expand the candidate block.
                candidateBlock.height = candidateBlock.height + thisBlock.height
                candidateBlock.row = thisBlock.row
                //thisBlock.height++
                // And scrap the current one. Can't remove it from the array as we're iterating over that currently.
                thisBlock.row = -1
                thisBlock.col = -1
                thisBlock.width = 0
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
    }
    return rectangles
}

export function findOuterLimits(level){
    let limits = {left: 0, right: 0, top: 0, bottom: 0}
    for (let shape of level.ground.filter((s)=>{return s.type == rectangle})){
        // Look at every rectangle and use those to find the leftmost, rightmost bounds etc.
        limits.left = Math.min(limits.left, shape.coords[0])
        limits.top = Math.min(limits.top, shape.coords[1])
        limits.right = Math.max(limits.right, shape.coords[0]+shape.coords[2])
        limits.bottom = Math.max(limits.bottom, shape.coords[1]+shape.coords[3])
    }
    for (let shape of level.ground.filter((s)=>{return s.type == quadrilateral})){
        // Look at every quadrilateral and use those to find the leftmost, rightmost bounds etc.
        limits.left = Math.min(limits.left, shape.coords[0], shape.coords[2], shape.coords[4], shape.coords[6])
        limits.top = Math.min(limits.top, shape.coords[1], shape.coords[3], shape.coords[5], shape.coords[7])
        limits.right = Math.max(limits.right, shape.coords[0], shape.coords[2], shape.coords[4], shape.coords[6])
        limits.bottom = Math.max(limits.bottom, shape.coords[1], shape.coords[3], shape.coords[5], shape.coords[7])
    }
    level.limits = limits
}