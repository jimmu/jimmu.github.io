"use strict"
define(["constants"],
function(constants){

    let canvas
    let ctx
    let gameElements = []
    let running = false
    let timer

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
                timer = setInterval(update, 1000/50)
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
            for (let gameElement of gameElements){
                gameElement.update(ctx)
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