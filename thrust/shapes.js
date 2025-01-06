"use strict";
import {p5instance as p5} from './lib.js'

export const point = 0
export const triangle = 1
export const rectangle = 2
export const quadrilateral = 3
export const circle = 4
export const line = 5

const includeFullyInside = true

export function render(shapeType, unscaledCoords){
    let coords = scale(unscaledCoords)
    switch (shapeType) {
        case point:
            p5.point(...coords)
            break
        case triangle:
            p5.triangle(...coords)
            break
        case rectangle:
            p5.rect(...coords)
            break
        case quadrilateral:
            p5.quad(...coords)
            break
        case circle:
            p5.circle(...coords)
            break
        case line:
            p5.line(...coords)
            break
        default:
            console.log("Unknown shape type "+shapeType)
    }
}

export function collision(shapeOneType, unscaledShapeOneCoords, shapeTwoType, unscaledShapeTwoCoords){
    let shapeOneCoords = scale(unscaledShapeOneCoords)
    let shapeTwoCoords = scale(unscaledShapeTwoCoords)
    switch (shapeOneType){
        case point:
            switch (shapeTwoType){
                case point:
                    return p5.collidePointPoint(...shapeOneCoords, ...shapeTwoCoords)
                case triangle:
                    return p5.collidePointTriangle(...shapeOneCoords, ...shapeTwoCoords)
                case rectangle:
                    return p5.collidePointRect(...shapeOneCoords, ...shapeTwoCoords)
                case quadrilateral:
                    return p5.collidePointPoly(...shapeOneCoords, coordsToVertices(shapeTwoCoords))
                case circle:
                    return p5.collidePointEllipse(...shapeOneCoords, ...shapeTwoCoords)
            }
            break
        case circle:
            switch (shapeTwoType){
                case point:
                    return p5.collidePointEllipse(...shapeTwoCoords, ...shapeOneCoords)
                case triangle:
                    return p5.collideCirclePoly(...shapeOneCoords, coordsToVertices(shapeTwoCoords), includeFullyInside)
                case rectangle:
                    return p5.collideRectCircle(...shapeTwoCoords, ...shapeOneCoords)
                case quadrilateral:
                    return p5.collideCirclePoly(...shapeOneCoords, coordsToVertices(shapeTwoCoords), includeFullyInside)
                case circle:
                    return p5.collideCircleCircle(...shapeOneCoords, ...shapeTwoCoords)
            }
            break
        case quadrilateral:
            switch(shapeTwoType){
                case point:
                    return p5.collidePointPoly(...shapeTwoCoords, coordsToVertices(shapeOneCoords))
                case triangle:
                    return p5.collidePolyPoly(coordsToVertices(shapeOneCoords), coordsToVertices(shapeTwoCoords), includeFullyInside)
                case rectangle:
                    // When used for the ship being the quad, and the rectangle being the ground, the fully-inside check doesn't work.
                    // Because of the order of the two shapes - we end up checking the for the rectangle being in the poly.
                    // We convert the rectangle to a poly to get it working.
                    let topLeft = {x: shapeTwoCoords[0], y: shapeTwoCoords[1]}
                    let topRight = {x: topLeft.x + shapeTwoCoords[2], y: topLeft.y}
                    let bottomRight = {x: topRight.x, y: topRight.y + shapeTwoCoords[3]}
                    let bottomLeft = {x: topLeft.x, y: bottomRight.y}
                    return p5.collidePolyPoly(coordsToVertices(shapeOneCoords), [topLeft, topRight, bottomRight, bottomLeft], true)
                case quadrilateral:
                    return p5.collidePolyPoly(coordsToVertices(shapeOneCoords), coordsToVertices(shapeTwoCoords), includeFullyInside)
                case circle:
                    return p5.collideCirclePoly(...shapeTwoCoords, coordsToVertices(shapeOneCoords), includeFullyInside)
            }
        default:
            console.log("Unsupported shape type for collision check: "+shapeOneType)
    }
}

// Instead of scaling coordinates, could we just call p5.scale() and then draw with the unscaled coords?
// Not if we want to keep the line thicknesses as they are. They get scaled too, of course.
function scale(coords){
    let scalingDimension = Math.max(p5.width, p5.height)
    return Array.isArray(coords)? coords.map((e)=>{return e * scalingDimension}) : coords * scalingDimension
}

function unscale(coords){
    let scalingDimension = Math.max(p5.width, p5.height)
    return Array.isArray(coords)? coords.map((e)=>{return e / scalingDimension}) : coords / scalingDimension
}

function coordsToVertices(coords){
    let vertices = []
    for (let i=0; i<coords.length-1; i+=2){
        vertices.push({x: coords[i], y: coords[i+1]})
    }
    return vertices
}

export function rotate(angle, coords){
    // Given an array [x1, y1, x2, y2 ...]
    // Rotate each coordinate pair about the origin.
    let sinAngle = Math.sin(angle)
    let cosAngle = Math.cos(angle)
    let rotatedCoords = []
    for (let i=0; i<coords.length - 1; i+=2){
        let x = coords[i]
        let y = coords[i+1]
        let xPrime = (x * cosAngle) - (y * sinAngle)
        let yPrime = (y * cosAngle) + (x * sinAngle)
        rotatedCoords.push(xPrime)
        rotatedCoords.push(yPrime)
    }
    // For something like a circle, we may be left with a last number unprocessed.
    // Just stick it on the end of the array.
    if (rotatedCoords.length < coords.length){
        rotatedCoords.push(coords[coords.length -1])
    }
    return rotatedCoords
}

export function translate(xAmount, yAmount, coords){
    let translatedCoords = []
    for (let i=0; i<coords.length - 1; i+=2){
        translatedCoords.push(coords[i] + xAmount)
        translatedCoords.push(coords[i+1] + yAmount)
    }
    // For something like a circle, we may be left with a last number unprocessed.
    // Just stick it on the end of the array.
    if (translatedCoords.length < coords.length){
        translatedCoords.push(coords[coords.length -1])
    }
    return translatedCoords
}

// TODO. I don't think this method really belongs in this file
export function translateScreen(xAmount, yAmount){
    // Scale the given coords _and_ move (0, 0) to the centre of the canvas
    p5.translate(scale(xAmount) + p5.width/2, scale(yAmount) + p5.height/2)
}
