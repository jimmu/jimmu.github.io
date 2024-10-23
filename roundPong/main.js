"use strict";
require(["gameLoop", "bat", "ball", "batBallCollisionCheck", "outOfBoundsCheck", "scores"],
function(gameLoop, bat, ball, batBallCollisionCheck, outOfBoundsCheck, scores){
    console.log("Hello")
    let bats = [bat("red", 0, "ArrowLeft", "ArrowRight"),
                bat("blue", Math.PI * 0.66, "A", "D"),
                bat("green", Math.PI * 1.33, "J", "L")]
    let scorer = scores(bats)
    let batCollisionCheck = batBallCollisionCheck(bats)
    gameLoop.init(bats.concat([ball, batCollisionCheck, outOfBoundsCheck, scorer]))
    gameLoop.start()
})
