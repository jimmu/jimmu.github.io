"use strict";
import {initP5, p5instance as p5} from './lib.js'
import {newShip, devMode} from './ship.js'
import {newScene} from './scene.js'
import {newGui} from './gui.js'
import {getLevel} from './levels.js'
import {newStateMachine} from './stateMachine.js'
import {newBackdrop} from './backdrop.js'
import {newExplosion} from './explosion.js'
import {translateScreen, rotate, translate} from './shapes.js'
import {newCamera} from './camera.js'

let ship
let backdrop
let scene
let gui
let camera
let explosion
let levelNumber = 3
let stateMachine
let maxLives = 3
let livesRemaining

initP5((p5)=>{
    p5.setup = setup
    p5.draw = draw
    p5.keyPressed = keyPressed
    p5.touchStarted = touchStarted
    p5.pixelDensity(1)  // This stops the thing running very slowly in portrait mode on Chrome on mobile!
})

function setup(){
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }
    livesRemaining = maxLives
    stateMachine = newStateMachine()
        .addTransition("new", "tapOrKeyPress", "preLevel")
        .addTransition("preLevel", "tapOrKeyPress", "inLevel", ()=>{gui.splash("Go", 1)})
        .addTransition("inLevel", "lose", "lostLevel", ()=>{
            explosion = newExplosion(p5.width, 0.75)//seconds to reach most of the final size
            if (livesRemaining == 0){
                gui.splash("Insert Coin", 3)
            }
            else{
                gui.splash("Ungood", 2)
            }
        })
        .addTransition("inLevel", "win", "wonLevel", ()=>{gui.splash("Goal In", 2)})
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
    p5.push()
    if (stateMachine.state() == "inLevel"){
        ship.update()
        collisionChecks()
    }
    camera.keepTargetInFrame(ship.position)
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
                stateMachine.trigger("win")
            }
            else {
                stateMachine.trigger("lose")
            }
        }
        // Mark landing pads as not collected as we don't want them to vanish.
        collectedObject.collected = false   // We landed before the goals were complete.
    }
    if (ship.healthPercent() == 0){
        stateMachine.trigger("lose")
    }
    // Are we drifting in the Abyss?
    if (scene.isOutOfBounds(ship.position)){
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
    camera = newCamera(ship.position)
}

function drawBackdrop(){
    p5.push()
    backdrop.draw(-camera.centreOfView().x, -camera.centreOfView().y)
    p5.pop()
}

function drawScene(){
    p5.push()
    translateScreen(-camera.centreOfView().x, -camera.centreOfView().y)
    scene.draw()
    p5.pop()
}

function drawShip(){
    p5.push()
    translateScreen(shipXOffset(), shipYOffset())
    ship.draw()
    p5.pop()
}

function drawExplosion(){
    p5.push()
    translateScreen(shipXOffset(), shipYOffset())
    explosion.draw()
    p5.pop()
}

function drawGui(){
    gui.draw()
}

function shipYOffset(){
    return ship.position.y - camera.centreOfView().y
}

function shipXOffset(){
    return ship.position.x - camera.centreOfView().x
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