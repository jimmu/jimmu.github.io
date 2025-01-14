"use strict";
import {levels} from './levelData.js'
import {processGroundBlocks, updateDynamicObjects, findOuterLimits, defaultCompleteness} from './levelMethods.js'
import {colours} from './config.js'

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
        isComplete: level.isComplete || defaultCompleteness,
        backgroundColour: level.backgroundColour || colours.defaultGround,
        usePatternFill: level.usePatternFill || false,
        generatePattern: level.generatePattern,
        updateDynamicObjects,
    }
    processGroundBlocks(levelCopy)
    findOuterLimits(levelCopy)
    levelCopy.howManyMandatory = (levelCopy.objects||[]).filter((o)=>{return o.mandatory}).length
    levelCopy.howManyMandatoryCollected = ()=>{return (levelCopy.objects||[]).filter((o)=>{return o.mandatory && o.collected}).length}
    return levelCopy
}
