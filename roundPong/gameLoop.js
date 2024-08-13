"use strict"
define(["constants"],
function(constants){

    let canvas
    let ctx
    let gameElements = []
    let running = false
    let timer
    let prevTime

    return {
        init: (elements)=>{
            gameElements = elements
            canvas = document.createElement('canvas')
            canvas.style.position = "absolute"
            canvas.style.border   = "1px solid"
            canvas.style.top = 0
            canvas.style.left = constants.windowCentre - (constants.width)/2
            document.body.appendChild(canvas)
            ctx = canvas.getContext("2d")
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            canvas.width  = constants.width
            canvas.height = constants.height

            for (let gameElement of elements){
                gameElement.init(ctx)
            }

            document.addEventListener("keydown", keyDown)
            document.addEventListener("keyup", keyUp)
        },
        start: ()=>{
            if (!running){
                running = true
                prevTime = Date.now()
                timer = setInterval(update, 1000/constants.framesPerSecond)
            }
        },
        stop: ()=>{
            if (running){
                running = false
                clearInterval(timer)
            }
        }
    }

    function update(){
        if (running){
            // Clear the canvas
            ctx.clearRect(0, 0, constants.width, constants.height)
            // Call update on every game element.
            let currentTime = Date.now()
            let timeDelta = (currentTime - prevTime)/1000   // seconds since previous invocation of update()
            prevTime = currentTime
            for (let gameElement of gameElements){
                gameElement.update(ctx, timeDelta)
            }
        }
    }

    function keyDown(e){
        if (running){
            for (let gameElement of gameElements){
                if (gameElement.keyDown){
                    gameElement.keyDown(e.key)
                }
            }
        }
    }
    function keyUp(e){
        if (running){
            for (let gameElement of gameElements){
                if (gameElement.keyUp){
                    gameElement.keyUp(e.key)
                }
            }
        }
    }
})