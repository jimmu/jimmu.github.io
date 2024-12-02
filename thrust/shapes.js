"use strict";
import {p5instance as p5} from './lib.js'

export const point = 0
export const triangle = 1
export const rectangle = 2
export const quadrilateral = 3
export const circle = 4

const includeFullyInside = true

export function render(shapeType, coords){
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
        default:
            console.log("Unknown shape type "+shapeType)
    }
}

export function collision(shapeOneType, shapeOneCoords, shapeTwoType, shapeTwoCoords){
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
        default:
            console.log("Unsupported shape type for collision check: "+shapeOneType)
    }
}

export function scale(coords){
    let scalingDimension = p5.windowWidth //Math.min(p5.windowWidth, p5.windowHeight) // Or the diagonal
    return Array.isArray(coords)? coords.map((e)=>{return e * scalingDimension}) : coords * scalingDimension
}

export function unscale(coords){
    let scalingDimension = p5.windowWidth //Math.min(p5.windowWidth, p5.windowHeight) // Or the diagonal
    return Array.isArray(coords)? coords.map((e)=>{return e / scalingDimension}) : coords / scalingDimension
}

function coordsToVertices(coords){
    let vertices = []
    for (let i=0; i<coords.length-1; i+=2){
        vertices.push({x: coords[i], y: coords[i+1]})
    }
    return vertices
}
