"use strict";
import {initP5, p5instance as p5} from './lib.js'
import {newShip} from './ship.js'
import {newScene} from './scene.js'
import {newGui} from './gui.js'
import {getLevel} from './levels.js'
import {newStateMachine} from './stateMachine.js'
import {newBackdrop} from './backdrop.js'

let ship
let backdrop
let scene
let gui
let levelNumber = 0
let minMargin   // How close can the ship go to the edge of the screen?
let stateMachine
let maxLives = 3
let livesRemaining

initP5((p5)=>{
    p5.setup = setup
    p5.draw = draw
    p5.keyPressed=keyPressed
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
        .addTransition("inLevel", "lose", "lostLevel", ()=>{gui.splash("Ungood", 1)})
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
    backdrop = newBackdrop()
    backdrop.setup()
    gui = newGui()
    gui.setup()
    gui.addElement("Lives: ", ()=>{return livesRemaining})
    gui.addElement("Fuel: ", ()=>{
        return "["+"#".repeat(ship.fuelPercent())+"_".repeat(100-ship.fuelPercent())+"]"
    })
    gui.addElement("Damage: ", ()=>{
        return "["+"#".repeat(100-ship.healthPercent())+"_".repeat(ship.healthPercent())+"]"
    })
    prepareLevel()
    stateMachine.start("new")
}

function draw(){
    p5.push()
    if (stateMachine.state() == "inLevel"){
        ship.update()
        ship.hit(scene.collisionCheck(ship.collisionShape.position, ship.collisionShape.size))
        ship.nearAnObject(scene.collectionCheck(ship.grabberZoneShape.position, ship.grabberZoneShape.size, true))
        let collectedObject = scene.collectionCheck(ship.grabberShape.position, ship.grabberShape.size)
        ship.grab(collectedObject)
        if (collectedObject && collectedObject.message){
            gui.splash(collectedObject.message)
        }
        if (collectedObject && collectedObject.fuel){
            ship.fuelPercent(collectedObject.fuel)
        }
        if (collectedObject && collectedObject.health){
            ship.healthPercent(collectedObject.health)
        }
        if (collectedObject.landingPad){
            if (scene.isComplete()){
                gui.splash("Touchdown")
                stateMachine.trigger("win")
            }
            else {
                collectedObject.collected = false   // We landed before the goals were complete.
            }
        }
        if (ship.healthPercent() == 0){
            livesRemaining--
            stateMachine.trigger("lose")
        }
    }
    drawBackdrop()
    drawScene()
    drawShip()
    drawGui()
    p5.pop()
}

function prepareLevel(){
    scene = newScene(getLevel(levelNumber))
    scene.setup()
    ship = newShip()
    ship.setup()
    ship.setPos(scene.startCoords.x, scene.startCoords.y)
    ship.carrying(1) // Times the mass of the ship. TODO - remove

}

function drawBackdrop(){
    p5.push()
    // Put the origin in the centre.
    p5.translate(p5.windowWidth/2, p5.windowHeight/2)
    //p5.translate()
    backdrop.draw(groundXOffset(), groundYOffset())
    p5.pop()
}

function drawScene(){
    p5.push()
    // Put the origin in the centre.
    p5.translate(p5.windowWidth/2, p5.windowHeight/2)
    p5.translate(groundXOffset(), groundYOffset())  // TODO. Scale these coords? And agree on scaling between ship and scene. Use the length of the window diagonal?
    scene.draw()
    p5.pop()
}

function drawShip(){
    p5.push()
    // Put the origin in the centre.
    p5.translate(p5.windowWidth/2, p5.windowHeight/2)
    p5.translate(shipXOffset(), shipYOffset())  // TODO. Scale these coords?
    ship.draw()
    if (ship.grab()){
        ship.drawGrabber()
    }
    if (ship.nearAnObject()){
        ship.drawGrabberZone()
    }
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