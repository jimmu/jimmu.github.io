"use strict";

export const devMode = false
export const startLevel = 0
export const shipSize = 0.03    // Fraction of the larger window dimension
export const shipRotationSpeed = 3   // Radians per second
export const shipThrust = 0.2/1000
export const gravityStrength = shipThrust/5
export const friction = 0.005
export const maxSpeed = 0.6   // Coordinate units per second.
export const maxLandingSpeed = 0.05
export const maxLandingAngle = Math.PI/6

export const starDensity = 30
export const maxStars = 500
export const colours = {
    background: 30,
    fuel: "#2060a0",
    health: "#f04040",
    coin: "#ffc010",
    extraLife: "#800080",
    switches: "#b0e0b0",
    shipOutline: 200,
    payloadRope: 100,
    payload: 150,
    collectibleOutline: 200,
    collectibleFill: 150,
    explosion: 250,
    touchControls: 80,
    guiText: 200,
}
export const messages = {
    lifeLost: "Ungood",
    gameOver: "Insert Coin",
    levelCompleted: "Goal In",
    startOfGame: "Hello",
    startOfLevel: "Go",
}