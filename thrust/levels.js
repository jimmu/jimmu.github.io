"use strict";
import {shapes} from './shapes.js'

export const level1 = {
    scales: {x:2, y:1},
    ground: [
        {type: shapes.triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
        {type: shapes.triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
        {type: shapes.quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
    ],
    objects: [
        {type: shapes.rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        {type: shapes.circle, coords:[-0.1, 0.1, 0.01], fuel: 25},
        {type: shapes.circle, coords:[-0.2, 0.1, 0.01], health: 50}
    ]
}
