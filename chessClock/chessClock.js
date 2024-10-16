"use strict";
import Clock from './clock.js'
import {p5instance as p5} from './lib.js'

export default class ChessClock
{
    constructor(initialTimeMinutes){
        this.initialTimeMinutes = initialTimeMinutes
        this.makeClocks()
    }

    reset(e){
        this.makeClocks()
        this.pauseButton.html("Pause")
        this.pauseButton.hide()
        this.resetButton.hide()
        if (e){
            e.stopPropagation()
        }
    }

    makeClocks(){
        this.clockA = new Clock(this.initialTimeMinutes * 60, this.aTick.bind(this))
        this.clockB = new Clock(this.initialTimeMinutes * 60, this.bTick.bind(this))
        this.started = false
        this.paused = false
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

    pause(e){
        if (this.paused){
            this.pauseButton.html("Pause")
            this.clockWhichGotPaused?.start()
            this.resetButton.hide()
        }
        else {
            this.pauseButton.html("Resume")
            // Note which clock was running so we know which one to unpause
            this.clockWhichGotPaused = this.clockA.running? this.clockA : this.clockB
            this.clockA.stop()
            this.clockB.stop()
            this.resetButton.show()
        }
        this.paused = !this.paused
        e.stopPropagation()
    }

    aTick(remainingSeconds){
        //console.log("A: "+remainingSeconds)
    }

    bTick(remainingSeconds){
        //console.log("B: "+remainingSeconds)
    }

    clicked(){
        if (!this.paused && p5.mouseY > p5.windowHeight * 0.1){
            if (p5.mouseX < p5.windowWidth * 0.4){
                this.startB()
                this.pauseButton.show()
            }
            else if (p5.mouseX > p5.windowWidth * 0.6){
                this.startA()
                this.pauseButton.show()
            }
        }
    }

    setup(){
        this.clockA.setup()
        this.clockB.setup()
        this.pauseButton = this.makeButton("Pause", this.pause)
        this.resetButton = this.makeButton("Reset", this.reset)
        this.resetButton.hide()
        this.pauseButton.hide()

        this.timeSlider = p5.createSlider(1, 60, this.initialTimeMinutes)
        this.timeSlider.input((e)=>{
            this.initialTimeMinutes = this.timeSlider.value()
            this.reset()
            e.stopPropagation()
        })
    }

    draw(){
        // Draw the two clocks side by side.
        p5.push()
        let clockRadius = (Math.min(p5.windowWidth/2, p5.windowHeight)/2)*0.9
        let quarterWidth = p5.windowWidth/4
        p5.background(30)
        p5.translate(quarterWidth, p5.windowHeight/2)
        this.clockA.draw(clockRadius)
        p5.pop()
        p5.push()
        p5.translate(3 * quarterWidth, p5.windowHeight/2)
        this.clockB.draw(clockRadius)
        p5.pop()
        p5.push()
        // Draw the buttons. They don't need drawing as such, but if the screen has changed size, they need to be moved.
        let buttonFontSize = Math.floor(p5.windowWidth/64)
        this.pauseButton.style('font-size', buttonFontSize+"px")
        this.resetButton.style('font-size', buttonFontSize+"px")
        this.pauseButton.size(p5.windowWidth/12, p5.windowWidth/32)
        this.pauseButton.position(p5.windowWidth/2 - this.pauseButton.size().width/2,  p5.windowHeight/2 - clockRadius * 0.75)
        this.resetButton.size(p5.windowWidth/16, p5.windowWidth/32)
        this.resetButton.position(p5.windowWidth/2 - this.resetButton.size().width/2,  p5.windowHeight/2 + clockRadius * 0.75)
        // Same for the time slider
        if (this.started){
            this.timeSlider.hide()
        }
        else {
            this.timeSlider.show()
            let timeSliderY = p5.windowHeight/2 - clockRadius
            this.timeSlider.position(p5.windowWidth * 0.4, timeSliderY)
            this.timeSlider.size(p5.windowWidth * 0.2)
            p5.textAlign(p5.CENTER, p5.TOP)
            p5.fill(200)
            p5.textSize(clockRadius/16)
            p5.text("Set time using slider", p5.windowWidth/2, timeSliderY + 20)
            p5.text("Tap a clock to start", p5.windowWidth/2, timeSliderY + 36)
        }
        // Did one of the clocks run down?
        if (this.clockA.remainingSeconds() == 0 || this.clockB.remainingSeconds() == 0){
            this.pauseButton.hide()
            this.resetButton.show()
        }
        p5.pop()
    }

    makeButton(label, onClick){
        let button = p5.createButton(label)
        let fontSize = Math.floor(p5.windowWidth/64)
        button.style('font-size', fontSize+"px")
        button.style("color", p5.color(130, 130, 130))
        button.style("background-color", p5.color(50, 50, 50))
        button.mouseClicked(onClick.bind(this))
        return button
    }
}