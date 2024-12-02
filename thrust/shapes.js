"use strict";
import {p5instance as p5} from './lib.js'

export const shapes = {
    triangle: {
        render: (coords)=>{
            p5.triangle(...coords)
        },
        collision: (position, coords, diameter)=>{
            if (diameter){
                // Use circle-poly for triangles
                return p5.collideCirclePoly(position.x, position.y, diameter, coordsToVertices(coords), true) // True for including collisions inside the shape
            }
            return p5.collidePointTriangle(position.x, position.y, ...coords)
        }
    },
    rectangle: {
        render: (coords)=>{
            p5.rect(...coords)
        },
        collision: (position, coords, diameter)=>{
            if (diameter){
                return p5.collideRectCircle(...coords, position.x, position.y, diameter)
            }
            return p5.collidePointRect(position.x, position.y, ...coords)
        }
    },
    quadrilateral: {
        render: (coords)=>{
            p5.quad(...coords)
        },
        collision: (position, coords, diameter)=>{
            if (diameter){
                return p5.collideCirclePoly(position.x, position.y, diameter, coordsToVertices(coords), true)
            }
            return p5.collidePointPoly(position.x, position.y, coordsToVertices(coords))
        }
    },
    circle: {
        render: (coords)=>{
            p5.circle(...coords)
        },
        collision: (position, coords, diameter)=>{
            if (diameter){
                return p5.collideCircleCircle(position.x, position.y, diameter, ...coords)
            }
            return p5.collidePointEllipse(position.x, position.y, ...coords)
        }
    }
}

export function scale(coords){
    let scalingDimension = p5.windowWidth //Math.min(p5.windowWidth, p5.windowHeight) // Or the diagonal
    return Array.isArray(coords)? coords.map((e)=>{return e * scalingDimension}) : coords * scalingDimension
}

function coordsToVertices(coords){
    let vertices = []
    for (let i=0; i<coords.length-1; i+=2){
        vertices.push({x: coords[i], y: coords[i+1]})
    }
    return vertices
}
