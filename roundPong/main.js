"use strict";
require(["gameLoop", "bat", "ball", "batBallCollisionCheck", "outOfBoundsCheck", "scores"],
function(gameLoop, bat, ball, batBallCollisionCheck, outOfBoundsCheck, scores){
    // Pressing a button to serve?
    console.log("Hello")
    let bat1 = bat("red", 0, "ArrowLeft", "ArrowRight")
    let bat2 = bat("blue", Math.PI * 0.66, "A", "D")
    let bat3 = bat("green", Math.PI * 1.33, "J", "L")
    let scorer = scores([bat1, bat2, bat3])
    let bat1CollisionCheck = batBallCollisionCheck(bat1)
    let bat2CollisionCheck = batBallCollisionCheck(bat2)
    let bat3CollisionCheck = batBallCollisionCheck(bat3)
    let ctx = gameLoop.init([bat1, bat2, bat3, ball, bat1CollisionCheck, bat2CollisionCheck, bat3CollisionCheck, outOfBoundsCheck, scorer])
    gameLoop.start()
})
