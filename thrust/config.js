"use strict";

export const devMode = false
export const startLevel = 10
export const shipSize = 0.03    // Fraction of the larger window dimension
export const shipRotationSpeed = Math.PI   // Radians per second
export const shipThrust = 0.2/1000
export const gravityStrength = shipThrust/5
export const payloadGravityStrength = gravityStrength * 1.5   // A bit non-physical, but somehow more intuitive
export const friction = 0.005
export const maxSpeed = 0.6   // Coordinate units per second.
export const maxLandingSpeed = 0.05
export const maxLandingAngle = Math.PI/6
export const bounciness = 0.9   // Coefficient of restitution
export const defaultFuelBurnRate = 8.5 // Percentage points per second
export const starDensity = 30
export const maxStars = 500
export const colours = {
    background: 30,
    defaultGround: "gray",
    fuel: "#2060a0",
    health: "#f04040",
    coin: "#ffc010",
    extraLife: "#800080",
    switches: "#b0e0b0",
    shipOutline: 200,
    shipOutlineWhenColliding: 250,
    payloadRope: 100,
    payload: 150,
    collectibleOutline: 200,
    collectibleFill: 150,
    explosion: 250,
    touchControls: 80,
    guiText: 200,
    payload: "#802020",
}
export const messages = {
    lifeLost: "Ungood",
    gameOver: "Insert Coin",
    levelCompleted: "Goal In",
    startOfGame: "Hello",
    startOfLevel: "Go",
    gamePaused: "Paused",
    everythingCollected: "Thank You",
    payloadDropped: "Nice",
}