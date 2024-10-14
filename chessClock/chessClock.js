"use strict";
import Clock from './clock.js'

export default class ChessClock
{
    constructor(initialTimeSeconds){
        this.clockA = new Clock(initialTimeSeconds, this.aTick.bind(this))
        this.clockB = new Clock(initialTimeSeconds, this.bTick.bind(this))
        this.started = false
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