"use strict";
import {rotate, translate} from './shapes.js'

export function oneCollisionCheck(thing, collider, angle){
   let collisionPos = thing.position
   let collisionShape = thing.shape
   let rotatedCoords = rotate(angle? angle : 0, collisionShape.coords)
   let translatedCoords = translate(collisionPos.x, collisionPos.y, rotatedCoords)
   return collider({type: collisionShape.type, coords: translatedCoords})
}
