"use strict";
import {shapes as shapeHandlers} from './shapes.js'
// TODO. Fuel. A layer displaying score, fuel, damage, guidance.
export const level1 = {
    scales: {x:2, y:1},
    ground: [
        {type: shapeHandlers.triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
        {type: shapeHandlers.triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
        {type: shapeHandlers.quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
    ],
    objects: [
        {type: shapeHandlers.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        {type: shapeHandlers.circle, coords:[-0.1, 0.1, 0.01]}
    ]
}
