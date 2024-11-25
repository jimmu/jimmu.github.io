"use strict";
import {initP5, p5instance as p5} from './lib.js'
import {newShip} from './ship.js'
import {newScene} from './scene.js'
import {newGui} from './gui.js'
import {level1} from './levels.js'

let ship
let scene
let gui
let minMargin   // How close can the ship go to the edge of the screen?

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
    ship = newShip()
    ship.setup()
    scene = newScene(level1)
    scene.setup()
    gui = newGui()
    gui.setup()
    gui.addElement("Fuel: ", ()=>{
        return "["+"#".repeat(ship.fuelPercent())+"_".repeat(100-ship.fuelPercent())+"]"
    })
    gui.addElement("Damage: ", ()=>{
        return "["+"#".repeat(100-ship.healthPercent())+"_".repeat(ship.healthPercent())+"]"
    })
}

function draw(){
    p5.push()
    ship.update()
    ship.hit(scene.collisionCheck(ship.collisionShape.position, ship.collisionShape.size))
    ship.nearAnObject(scene.collectionCheck(ship.grabberZoneShape.position, ship.grabberZoneShape.size, true))
    let collectedObject = scene.collectionCheck(ship.grabberShape.position, ship.grabberShape.size)
    ship.grab(collectedObject)
    if (collectedObject && collectedObject.fuel){
        ship.fuelPercent(collectedObject.fuel)
    }
    if (collectedObject && collectedObject.health){
        ship.healthPercent(collectedObject.health)
    }
    if (collectedObject.landingPad){
        console.log("Landed") //TODO. softly?
    }
    drawScene()
    drawShip()
    drawGui()
    p5.pop()
}

function drawScene(){
    p5.push()
    p5.background(30)
    // Put the origin in the centre.
    p5.translate(p5.windowWidth/2, p5.windowHeight/2)
    p5.translate(groundXOffset(), groundYOffset())
    scene.draw()
    p5.pop()
}

function drawShip(){
    p5.push()
    // Put the origin in the centre.
    p5.translate(p5.windowWidth/2, p5.windowHeight/2)
    p5.translate(shipXOffset(), shipYOffset())
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
}