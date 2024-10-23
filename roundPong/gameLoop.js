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
            canvas.width  = constants.width
            canvas.height = constants.height
            // Move the origin to the middle instead of top left
            ctx.translate(constants.width/2, constants.height/2)

            gameElements.forEach((x)=>{
                ctx.save()
                x.init?.(ctx)
                ctx.restore()
            })

            document.addEventListener("keydown", keyDown)
            document.addEventListener("keyup", keyUp)
//            canvas.addEventListener("touchstart", touchStart)
//            canvas.addEventListener("touchend", touchEnd)
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
            ctx.clearRect(-constants.width/2, -constants.height/2, constants.width, constants.height)
            // Call update on every game element.
            let currentTime = Date.now()
            let timeDelta = (currentTime - prevTime)/1000   // seconds since previous invocation of update()
            prevTime = currentTime
            gameElements.forEach((x)=>{
                ctx.save()
                x.update?.(ctx, timeDelta)
                ctx.restore()}
            )
        }
    }

    function keyDown(e){
        if (running){
            gameElements.forEach((x)=>{x.keyDown?.(e.key)})
        }
    }
    function keyUp(e){
        if (running){
            gameElements.forEach((x)=>{x.keyUp?.(e.key)})
        }
    }
    function touchStart(e){
        if (running){
            gameElements.forEach((x)=>{x.touchStart?.(e)})
        }
    }
    function touchEnd(e){
        if (running){
            gameElements.forEach((x)=>{x.touchEnd?.(e)})
        }
    }
})