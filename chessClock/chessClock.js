"use strict";
import Clock from './clock.js'

export default class ChessClock
{
    constructor(initialTimeSeconds){
        this.initialTimeSeconds = initialTimeSeconds
        this.reset()
    }

    reset(e){
        this.clockA = new Clock(this.initialTimeSeconds, this.aTick.bind(this))
        this.clockB = new Clock(this.initialTimeSeconds, this.bTick.bind(this))
        this.started = false
        if (e){
            e.stopPropagation()
        }
    }

    startA(){
        if (this.clockB.remainingSeconds() > 0){
            this.clockB.stop()
            this.clockA.start()
            this.started = true
        }
    }

    startB(){
        if (this.clockA.remainingSeconds() > 0){
            this.clockA.stop()
            this.clockB.start()
            this.started = true
        }
    }

    stopBoth(e){
        this.clockA.stop()
        this.clockB.stop()
        this.started = false
        e.stopPropagation()
    }

    aTick(remainingSeconds){
        //console.log("A: "+remainingSeconds)
    }

    bTick(remainingSeconds){
        //console.log("B: "+remainingSeconds)
    }

    clicked(p5){
        if (p5.mouseX < p5.windowWidth/2){
            this.startB()
        }
        else {
            this.startA()
        }
    }

    draw(p5){
        // Draw the two clocks side by side.
        p5.push()
        // TODO. Refactor the button creation
        if (!this.pauseButton && this.started){
            this.pauseButton = p5.createButton("Pause")
            this.pauseButton.size(p5.windowWidth/16, p5.windowWidth/32)
            this.pauseButton.position(p5.windowWidth * 15 / 32,  p5.windowHeight/4)
            this.pauseButton.style("font", "Courier New")
            let fontSize = Math.floor(p5.windowWidth/64)
            this.pauseButton.style('font-size', fontSize+"px")
            this.pauseButton.style("color", p5.color(130, 130, 130))
            this.pauseButton.style("background-color", p5.color(50, 50, 50))
            this.pauseButton.style("border", "0px")
            this.pauseButton.mouseClicked(this.stopBoth.bind(this))
        }
        if (this.pauseButton && !this.started){
            this.pauseButton.remove()
            this.pauseButton = null
        }
        if (!this.resetButton){
            this.resetButton = p5.createButton("Reset")
            this.resetButton.size(p5.windowWidth/16, p5.windowWidth/32)
            this.resetButton.position(p5.windowWidth * 15 / 32,  p5.windowHeight * 3 / 4)
            this.resetButton.style("font", "Courier New")
            let fontSize = Math.floor(p5.windowWidth/64)
            this.resetButton.style('font-size', fontSize+"px")
            this.resetButton.style("color", p5.color(130, 130, 130))
            this.resetButton.style("background-color", p5.color(50, 50, 50))
            this.resetButton.style("border", "0px")
            this.resetButton.mouseClicked(this.reset.bind(this))
        }
        let quarterWidth = p5.windowWidth/4
        p5.background(30)
        p5.translate(quarterWidth, p5.windowHeight/2)
        this.clockA.draw(p5)
        p5.pop()
        p5.push()
        p5.translate(3 * quarterWidth, p5.windowHeight/2)
        this.clockB.draw(p5)
        p5.pop()
    }
}