"use strict";
import Clock from './clock.js'
import {p5instance as p5} from './lib.js'
import {newStateMachine} from './stateMachine.js'

export default class ChessClock
{
    constructor(initialTimeMinutes){
        this.initialTimeMinutes = initialTimeMinutes
        this.makeClocks()
        this.stateMachine = newStateMachine()
        // Four args to addTransition: From state, Trigger event, To state, Action
        .addTransition("None", "start", "new")
        .onEnteringState("new", ()=>{
            this.makeClocks()
            this.pauseButton.hide()
            this.resumeButton.hide()
            this.resetButton.hide()
            this.timeSlider.show()
        })
        .addTransition("new", "timeChange", "new", ()=>{
            this.initialTimeMinutes = this.timeSlider.value()
        })
        .addTransition("new", "tapA", "running")
        .addTransition("new", "tapB", "running")
        .onEventNamed("tapA", ()=>{
            this.startB()
        })
        .onEventNamed("tapB", ()=>{
            this.startA()
        })
        .onEnteringState("running", ()=>{
            this.pauseButton.show()
            this.resetButton.hide()
            this.timeSlider.hide()
            this.resumeButton.hide()
        })
        .addTransition("running", "pause", "paused", ()=>{
            this.clockWhichGotPaused = this.clockA.running? this.clockA : this.clockB
            this.clockA.stop()
            this.clockB.stop()
            this.resetButton.show()
            this.pauseButton.hide()
            this.resumeButton.show()
        })
        .addTransition("paused", "resume", "running", ()=>{
            this.clockWhichGotPaused?.start()
        })
        .addTransition("paused", "reset", "new")
        .addTransition("running", "timeout", "expired", ()=>{
            this.pauseButton.hide()
            this.resetButton.show()
        })
        .addTransition("expired", "reset", "new")
    }

    makeClocks(){
        this.clockA = new Clock(this.initialTimeMinutes * 60, this.aTick.bind(this))
        this.clockB = new Clock(this.initialTimeMinutes * 60, this.bTick.bind(this))
    }

    startA(){
        if (this.clockB.remainingSeconds() > 0){
            this.clockB.stop()
            this.clockA.start()
        }
    }

    startB(){
        if (this.clockA.remainingSeconds() > 0){
            this.clockA.stop()
            this.clockB.start()
        }
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
                this.stateMachine.trigger("tapA")
            }
            else if (p5.mouseX > p5.windowWidth * 0.6){
                this.stateMachine.trigger("tapB")
            }
        }
    }

    setup(){
        this.clockA.setup()
        this.clockB.setup()
        this.pauseButton = this.makeButton("Pause")
        this.resumeButton = this.makeButton("Resume")
        this.resetButton = this.makeButton("Reset")

        this.timeSlider = p5.createSlider(1, 60, this.initialTimeMinutes)
        this.timeSlider.input((e)=>{
            this.stateMachine.trigger("timeChange")
        })
        this.stateMachine.start()
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
        this.resumeButton.style('font-size', buttonFontSize+"px")
        this.pauseButton.size(p5.windowWidth/12, p5.windowWidth/32)
        this.pauseButton.position(p5.windowWidth/2 - this.pauseButton.size().width/2,  p5.windowHeight/2 - clockRadius * 0.75)
        this.resumeButton.position(p5.windowWidth/2 - this.resumeButton.size().width/2,  p5.windowHeight/2 - clockRadius * 0.75)
        this.resumeButton.size(p5.windowWidth/12, p5.windowWidth/32)
        this.resetButton.size(p5.windowWidth/16, p5.windowWidth/32)
        this.resetButton.position(p5.windowWidth/2 - this.resetButton.size().width/2,  p5.windowHeight/2 + clockRadius * 0.75)
        // Same for the time slider
        if (this.stateMachine.state() == "new"){
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
            this.stateMachine.trigger("timeout")
        }
        p5.pop()
    }

    makeButton(label){
        let button = p5.createButton(label)
        let fontSize = Math.floor(p5.windowWidth/64)
        button.style('font-size', fontSize+"px")
        button.style("color", p5.color(130, 130, 130))
        button.style("background-color", p5.color(50, 50, 50))
        // Trigger a state transition with the same name as the button label
        button.mouseClicked(function (){this.stateMachine.trigger(label.toLowerCase())}.bind(this))
        return button
    }
}