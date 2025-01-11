"use strict";
import {initP5, p5instance as p5} from './lib.js'
import {newShip} from './ship.js'
import {newScene} from './scene.js'
import {newGui} from './gui.js'
import {getLevel} from './levelBuilder.js'
import {newStateMachine} from './stateMachine.js'
import {newBackdrop} from './backdrop.js'
import {newExplosion} from './explosion.js'
import {translateScreen} from './shapes.js'
import {newCamera} from './camera.js'
import {draw as drawControls, enableTouch as enableTouchControls} from './controls.js'
import {devMode, startLevel, messages} from './config.js'
import {oneCollisionCheck} from './collisions.js'

// TODO ? Use local storage or a cookie to save progress.
// Allow some amount of level skipping after levels have been unlocked/completed.
// TODO. Now we have the multiple payload thing, it could be good also to have buckets to drop payloads into
//       rather than just land while carrying all the payloads.

let ship
let backdrop
let scene
let gui
let camera
let explosion
let levelNumber = startLevel
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
    stateMachine = createStateMachine()
    prepareLevel()
    gui = createGui()
    document.addEventListener("visibilitychange", ()=>{
        if (document.hidden){
            stateMachine.trigger("pause")
        }
        //else Automatically unpause? Or just wait for key press?
    })
    stateMachine.start("new")
}

function draw(){
    p5.push()
    if (stateMachine.state() != "paused") {
        if (stateMachine.state() == "inLevel"){
            scene.updateDynamicObjects()
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
    }
    drawGui()
    drawControls()
    p5.pop()
}

// TODO - Move this method into the scene.
// Pass it the ship or the payload - whatever is to be checked for collisions.
// Have one method for the ground and one for the collectable objects.
// The scene itself may delegate the work to methods in the collisions.js file.
function collisionChecks(checkingForPayload){
    checkGroundCollision()
    let collectedObject = checkObjectCollisions(false)  // Check if the ship hit anything
    handleCollectedObject(collectedObject, false)
    if (!collectedObject){
        collectedObject = checkObjectCollisions(true)   // Check if the payload hit anything
        handleCollectedObject(collectedObject, true)
    }
    // TODO. Why is this in the collision check method?
    if (ship.healthPercent() == 0){
        stateMachine.trigger("lose")
    }
    // Are we drifting in the Abyss?
    if (scene.isOutOfBounds(ship.position)){
        stateMachine.trigger("lose")
    }
}

function checkGroundCollision(){
    // Did the ship hit the ground?
    let bumpedInto = oneCollisionCheck(ship.collisionShape, scene.collisionCheck, ship.getAngle())
    ship.hit(bumpedInto)
    // If we're carrying something, did the payload hit the ground?
    if (ship.hasPayload() && !ship.hit()){
        for (let payload of ship.payloadCollisionShape.positions){
            if (!ship.hit()){
                let payloadCollisionShape = {position: payload.position, shape: ship.payloadCollisionShape.shape}
                let payloadBumpedInto = oneCollisionCheck(payloadCollisionShape, scene.collisionCheck, 0)
                if (payloadBumpedInto){
                    ship.hit(payloadBumpedInto)
                }
            }
        }
    }
}

function checkObjectCollisions(checkPayload){   // TODO. Make this return not just the collected object, but what collected it - which might be the ship or one of the payloads. If it's a payload then we need to know the index of that.
    let collectedObject
    // Did the ship hit any game objects?
    if (!checkPayload){
        collectedObject = oneCollisionCheck(ship.collisionShape, scene.collectionCheck, ship.getAngle())
        ship.grab(collectedObject)
    }
    else if (ship.hasPayload()){
        // Start by pretending we're only checking.
        // Because we don't want the level to end if the payload hits the landing pad.
        for (let payload of ship.payloadCollisionShape.positions){
            if (!collectedObject){
                let payloadCollisionShape = {position: payload.position, shape: ship.payloadCollisionShape.shape}
                collectedObject = oneCollisionCheck(payloadCollisionShape, (s)=>{return scene.collectionCheck(s, true)}, ship.getAngle())
                if (collectedObject){
                    if (collectedObject.landingPad || collectedObject.payload){
                        // Payloads and landing pads can't be collected by payloads
                        collectedObject = false
                    }
                    else {
                        collectedObject.collected = true
                        ship.grab(collectedObject)
                    }
                }
            }
        }
    }
    // If the legs are extended then check if they hit anything.
    // Are we near a landing pad?
    let nearbyObject = oneCollisionCheck(ship.landerZoneCollisionShape, (s)=>{return scene.collectionCheck(s, true)}, ship.getAngle())    // True for just looking
    ship.nearAnObject(nearbyObject)
    if (ship.slowEnoughToLand()){
        let legsHitThis = oneCollisionCheck(ship.landingLegsCollisionShape, scene.collectionCheck, ship.getAngle())
        if (legsHitThis){
            ship.grab(legsHitThis)
            collectedObject = legsHitThis
        }
    }
    return collectedObject  // Return an object with the collectedObject and the collector - that is, the ship or the index of the payload.
}

function handleCollectedObject(collectedObject, collectedByPayload){
    if (!collectedObject){
        return
    }
    // Now check the collectable objects
    if (collectedObject.message){
        gui.splash(collectedObject.message)
    }
    if (collectedObject.fuel){
        ship.fuelPercent(collectedObject.fuel)
    }
    if (collectedObject.health){
        ship.healthPercent(collectedObject.health)
    }
    if (collectedObject.extraLife){
        livesRemaining++
    }
    if (collectedObject.payload && !collectedByPayload && !collectedObject.permanent){
        ship.addPayload(collectedObject)
    }
    if (collectedObject.needsKey){
        // Check the ships inventory for this key.
        // Use it if it has it.
        if (ship.inventory.has("keys", collectedObject.needsKey)){
            scene.useKey(collectedObject.needsKey)
        }
        else {
            // What to do. Bump off the object?
            ship.velocity.mult(-1)
            collectedObject.collected = false
            if (!collectedObject.message){
                gui.splash("Lock "+collectedObject.needsKey)
            }
        }
    }
    if (collectedObject.key){
        // Add the key to the ship's inventory
        ship.inventory.add("keys", collectedObject.key)
    }
    if (collectedObject.isSwitch){
        scene.toggleSwitchableObjects(collectedObject)
    }
    if (collectedObject.landingPad && !collectedByPayload){
        if (scene.isComplete()){
            if (ship.slowEnoughToLand()){
                stateMachine.trigger("win")
            }
            else {
                stateMachine.trigger("lose")
            }
        }
    }
    if (collectedObject.isDamaging){
        ship.hit(collectedObject)
    }
    if (collectedObject.mandatory){
        if (scene.mandatoryCollected() == scene.mandatoryCount){
            gui.splash(messages.everythingCollected)
        }
    }
    if (collectedObject.bucket && collectedByPayload){  //TODO. We need to know which payload. If there are multiple we need to drop the right one.
        collectedObject.collected = false   // We still want to see the bucket
        // If we're carrying something, and the bucket is not already full, put the payload in the bucket.
        if (ship.hasPayload() && !collectedObject.full){
            // Ideally we'd like to know if the ship or the payload collided with the bucket.
            // Remove a payload from the ship.
            // Add it to the bucket.
            collectedObject.full = true // We don't want to be able to use it twice
            let droppedPayload = ship.dropPayload()
            // Now the payload isn't being carried by the ship, but we do want to see it on the bucket.
            // Add a new object to the scene.
            scene.addObject({type: droppedPayload.payload.type,
                             coords: [droppedPayload.position.x, droppedPayload.position.y, droppedPayload.payload.coords[2]],
                             permanent: true,
                             payload: 1,
                             dropped: true,
                             colour: collectedObject.colour
                            })
            gui.splash(messages.payloadDropped)
            if (scene.isComplete()){
                stateMachine.trigger("win")
            }
        }
    }
}

function createStateMachine(){
    return newStateMachine()
            .addTransition("new", "tapOrKeyPress", "preLevel")
            .addTransition("preLevel", "tapOrKeyPress", "inLevel", ()=>{gui.splash(messages.startOfLevel, 1)})
            .addTransition("inLevel", "lose", "lostLevel", ()=>{
                explosion = newExplosion(p5.width, 0.75)//seconds to reach most of the final size
                if (livesRemaining == 0){
                    gui.splash(messages.gameOver, 3)
                }
                else{
                    gui.splash(messages.lifeLost, 2)
                }
            })
            .addTransition("inLevel", "win", "wonLevel", ()=>{gui.splash(messages.levelCompleted, 2)})
            .addTransition("inLevel", "pause", "paused", ()=>{gui.splash(messages.gamePaused, 6000)})
            .addTransition("paused", "tapOrKeyPress", "inLevel", ()=>{gui.splash("")})
            .addTransition("wonLevel", "tapOrKeyPress", "preLevel", ()=>{
                levelNumber++
                prepareLevel()
            })
            .addTransition("lostLevel", "tapOrKeyPress", "preLevel", ()=>{
                if (livesRemaining == 0){
                    levelNumber = startLevel
                    livesRemaining = maxLives
                }
                prepareLevel()
            })
            .onEnteringState("preLevel", ()=>{
                gui.splash(levelNumber+":"+scene.greeting, 2)
            })
            .onEnteringState("new", ()=>{gui.splash(messages.startOfGame, 4)})
            .onEventNamed("lose", ()=>{livesRemaining--})
}

function createGui(){
    let gui = newGui()
    gui.setup()
    gui.addElement("Lives : ", ()=>{return livesRemaining})
    gui.addElement("Fuel  : ", ()=>{
        return "["+"#".repeat(ship.fuelPercent())+"_".repeat(100-ship.fuelPercent())+"]"
    })
    gui.addElement("Damage: ", ()=>{
        return "["+"#".repeat(100-ship.healthPercent())+"_".repeat(ship.healthPercent())+"]"
    })
    gui.addElement("", ()=>{
        if (scene.mandatoryCount == 0){
            return ""
        }
        return  "Collected: "+scene.mandatoryCollected() + " of " + scene.mandatoryCount
    })
    //gui.addElement("Keys  : ", ()=>{return ship.inventory.getPocket("keys")})
    if (devMode){
        gui.addElement("Co-ordinates: ", ()=>{return "("+ship.position.x.toFixed(3)+", "+ship.position.y.toFixed(3)+
                       ") Speed: "+ship.velocity.mag().toFixed(3)})
        gui.addElement("Payload     : ", ()=>{return "("+ship.payloadCollisionShape.positions+") shape: "+ship.payloadCollisionShape.shape.coords})
    }
    return gui
}

function prepareLevel(){
    let level = getLevel(levelNumber)
    scene = newScene(level)
    scene.setup()
    backdrop = newBackdrop()
    backdrop.setup(level.limits)
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
    if (p5.touches.length > 0){
        enableTouchControls()
    }
}