"use strict";
import {initP5, p5instance as p5} from './lib.js'
import {newShip, devMode} from './ship.js'
import {newScene} from './scene.js'
import {newGui} from './gui.js'
import {getLevel} from './levels.js'
import {newStateMachine} from './stateMachine.js'
import {newBackdrop} from './backdrop.js'
import {newExplosion} from './explosion.js'
import {centreScreen, translateScreen, rotate, translate} from './shapes.js'

let ship
let backdrop
let scene
let gui
let explosion
let levelNumber = 0
let minMargin   // How close can the ship go to the edge of the screen?
let stateMachine
let maxLives = 3
let livesRemaining

initP5((p5)=>{
    p5.setup = setup
    p5.draw = draw
    p5.keyPressed = keyPressed
    p5.touchStarted = touchStarted
})

function setup(){
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }
    minMargin = Math.min(p5.windowWidth, p5.windowHeight)/4
    livesRemaining = maxLives
    stateMachine = newStateMachine()
        .addTransition("new", "tapOrKeyPress", "preLevel")
        .addTransition("preLevel", "tapOrKeyPress", "inLevel", ()=>{gui.splash("Go", 1)})
        .addTransition("inLevel", "lose", "lostLevel", ()=>{
            gui.splash("Ungood", 1)
            explosion = newExplosion(p5.windowWidth, 0.75)//seconds to reach most of the final size
        })
        .addTransition("inLevel", "win", "wonLevel", ()=>{gui.splash("Good")})
        .addTransition("wonLevel", "tapOrKeyPress", "preLevel", ()=>{
            levelNumber++
            prepareLevel()
        })
        .addTransition("lostLevel", "tapOrKeyPress", "preLevel", ()=>{
            if (livesRemaining == 0){
                levelNumber = 0
                livesRemaining = maxLives
            }
            prepareLevel()
        })
        .onEnteringState("preLevel", ()=>{
            gui.splash(levelNumber+":"+scene.greeting, 2)
        })
        .onEnteringState("new", ()=>{gui.splash("Hello", 4)})
        .onEventNamed("lose", ()=>{livesRemaining--})
    backdrop = newBackdrop()
    backdrop.setup()
    gui = newGui()
    gui.setup()
    gui.addElement("Lives : ", ()=>{return livesRemaining})
    gui.addElement("Fuel  : ", ()=>{
        return "["+"#".repeat(ship.fuelPercent())+"_".repeat(100-ship.fuelPercent())+"]"
    })
    gui.addElement("Damage: ", ()=>{
        return "["+"#".repeat(100-ship.healthPercent())+"_".repeat(ship.healthPercent())+"]"
    })
    gui.addElement("Keys  : ", ()=>{return ship.inventory.getPocket("keys")})
    if (devMode){
        gui.addElement("Co-ordinates: ", ()=>{return "("+ship.position.x.toFixed(3)+", "+ship.position.y.toFixed(3)+
                       ") Speed: "+Math.floor(ship.velocity.mag())})
        gui.addElement("Payload     : ", ()=>{return "("+ship.payloadCollisionShape.position.x.toFixed(3)+", "+ship.payloadCollisionShape.position.y.toFixed(3)+") shape: "+ship.payloadCollisionShape.shape.coords})
    }
    prepareLevel()
    stateMachine.start("new")
}

function draw(){
    let startTime = Date.now()
    p5.push()
    if (stateMachine.state() == "inLevel"){
        ship.update()
        collisionChecks()
    }
    drawBackdrop()
    drawScene()
    if (stateMachine.state() == "lostLevel"){
        drawExplosion()
    }
    drawShip()
    drawGui()
    p5.pop()
}

function collisionChecks(){
    // Did the ship hit the ground?
    let bumpedInto = oneCollisionCheck(ship.collisionShape, scene.collisionCheck)
    ship.hit(bumpedInto)
    // If we're carrying something, did the payload hit the ground?
    if (ship.carrying() && !ship.hit()){
        let payloadBumpedInto = oneCollisionCheck(ship.payloadCollisionShape, scene.collisionCheck, 0)
        if (payloadBumpedInto){
            ship.hit(payloadBumpedInto)
        }
    }
    // Did the ship hit any game objects?
    let collectedObject = oneCollisionCheck(ship.collisionShape, scene.collectionCheck)
    ship.grab(collectedObject)
    // Are we near a landing pad?
    let nearbyObject = oneCollisionCheck(ship.landerZoneCollisionShape, (s)=>{return scene.collectionCheck(s, true)})    // True for just looking
    ship.nearAnObject(nearbyObject)
    // If the legs are extended then check if they hit anything.
    if (ship.slowEnoughToLand()){
        let legsHitThis = oneCollisionCheck(ship.landingLegsCollisionShape, scene.collectionCheck)
        if (legsHitThis){
            ship.grab(legsHitThis)
            collectedObject = legsHitThis
        }
    }

    // Now check the collectable objects
    if (collectedObject && collectedObject.message){
        gui.splash(collectedObject.message)
    }
    if (collectedObject && collectedObject.fuel){
        ship.fuelPercent(collectedObject.fuel)
    }
    if (collectedObject && collectedObject.health){
        ship.healthPercent(collectedObject.health)
    }
    if (collectedObject && collectedObject.payload){
        ship.carrying(collectedObject)
    }
    if (collectedObject && collectedObject.needsKey){
        // Check the ships inventory for this key.
        // Use it if it has it.
        if (ship.inventory.has("keys", collectedObject.needsKey)){
            scene.useKey(collectedObject.needsKey)
        }
        else {
            // What to do. Bump off the object?
            ship.velocity.mult(-1)
            collectedObject.collected = false
            gui.splash("Lock "+collectedObject.needsKey)
        }
    }
    if (collectedObject && collectedObject.key){
        // Add the key to the ship's inventory
        ship.inventory.add("keys", collectedObject.key)
    }
    if (collectedObject.landingPad){
        if (scene.isComplete()){
            if (ship.slowEnoughToLand()){
                gui.splash("Touchdown")
                stateMachine.trigger("win")
            }
            else {
                gui.splash("Ouch")
                stateMachine.trigger("lose")
            }
        }
        // Mark landing pads as not collected as we don't want them to vanish.
        collectedObject.collected = false   // We landed before the goals were complete.
    }
    if (ship.healthPercent() == 0){
        stateMachine.trigger("lose")
    }
}

// TODO. Consider moving this into the ship rather than exposing all those collider shape details.
function oneCollisionCheck(thing, collider, angle){
    let collisionPos = thing.position
    let collisionShape = thing.shape
    let rotatedCoords = rotate(angle? angle : ship.angle, collisionShape.coords)
    let translatedCoords = translate(collisionPos.x, collisionPos.y, rotatedCoords)
    return collider({type: collisionShape.type, coords: translatedCoords})
}

function prepareLevel(){
    scene = newScene(getLevel(levelNumber))
    scene.setup()
    ship = newShip()
    ship.setup()
    ship.setPos(scene.startCoords.x, scene.startCoords.y)
}

function drawBackdrop(){
    p5.push()
    // Put the origin in the centre.
    centreScreen()
    //p5.translate()
    backdrop.draw(groundXOffset(), groundYOffset())
    p5.pop()
}

function drawScene(){
    p5.push()
    // Put the origin in the centre.
    centreScreen()
    translateScreen(groundXOffset(), groundYOffset())
    scene.draw()
    p5.pop()
}

function drawShip(){
    p5.push()
    // Put the origin in the centre.
    centreScreen()
    translateScreen(shipXOffset(), shipYOffset())
    ship.draw()
    p5.pop()
}

function drawExplosion(){
    p5.push()
    // Put the origin in the centre.
    centreScreen()
    translateScreen(shipXOffset(), shipYOffset())
    explosion.draw()
    p5.pop()
}

function drawGui(){
    gui.draw()
}

function shipYOffset(){
    // For the camera/wiggle room behaviour we need more info than just the position of the ship.
    // It depends where the virtual camera has moved to already and the direction the ship is moving now.
    return 0
}

function shipXOffset(){
    return 0
}

function groundYOffset(){
    return -ship.position.y
}

function groundXOffset(){
    return -ship.position.x
}

function keyPressed(){
    stateMachine.trigger("tapOrKeyPress")
}

function touchStarted(){
    stateMachine.trigger("tapOrKeyPress")
}