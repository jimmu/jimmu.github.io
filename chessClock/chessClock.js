"use strict";
import Clock from './clock.js'
import {initP5, p5instance as p5} from './lib.js'
import {newStateMachine} from './stateMachine.js'

export default class ChessClock
{
    constructor(initialTimeMinutes){
        initP5((p5)=>{
            p5.setup = this.setup.bind(this)
            p5.draw = this.draw.bind(this)
            p5.mouseClicked = this.clicked.bind(this)
        })

        this.initialTimeMinutes = initialTimeMinutes
        this.stateMachine = newStateMachine()
        // Four args to addTransition: From state, Trigger event, To state, Action
        .onEnteringState("new", ()=>{
            this.makeClocks()
            this.pauseButton.hide()
            this.resumeButton.hide()
            this.resetButton.hide()
            this.timeSlider.show()
            this.sliderLabel.show()
        })
        .addTransition("new", "timeChange", "new")
        .addTransition("new", "tapA", "running", ()=>{this.startB()})
        .addTransition("new", "tapB", "running", ()=>{this.startA()})
        .addTransition("running", "tapA", "running", ()=>{this.startB()})
        .addTransition("running", "tapB", "running", ()=>{this.startA()})
        .onEnteringState("running", ()=>{
            this.pauseButton.show()
            this.resetButton.hide()
            this.timeSlider.hide()
            this.sliderLabel.hide()
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
        .addTransition("paused", "resume", "running", ()=>{this.clockWhichGotPaused?.start()})
        .addTransition("paused", "reset", "new")
        .addTransition("running", "timeout", "expired", ()=>{
            this.pauseButton.hide()
            this.resetButton.show()
        })
        .addTransition("expired", "reset", "new")
    }

    makeClocks(){
        this.clockA = new Clock(this.timeSlider.value() * 60)
        this.clockB = new Clock(this.timeSlider.value() * 60)
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

    clicked(){
        if (p5.mouseY > p5.windowHeight * 0.1){
            if (p5.mouseX < p5.windowWidth * 0.4){
                this.stateMachine.trigger("tapA")
            }
            else if (p5.mouseX > p5.windowWidth * 0.6){
                this.stateMachine.trigger("tapB")
            }
        }
    }

    calcRadius(){
        let radius = (Math.min(p5.windowWidth/2, p5.windowHeight)/2)*0.9
        document.querySelector(':root').style.setProperty("--clockRadius", radius+"px")
        this.clockRadius = radius
    }

    setup(){
        p5.createCanvas(p5.windowWidth, p5.windowHeight)
        this.calcRadius()
        p5.windowResized = function(){
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
            this.calcRadius()
        }.bind(this)
        p5.touchStarted = function(){
            p5.fullscreen(true)
        }
        this.pauseButton = this.makeButton("Pause")
        this.pauseButton.addClass("pause")
        this.resumeButton = this.makeButton("Resume")
        this.resumeButton.addClass("pause")
        this.resetButton = this.makeButton("Reset")
        this.resetButton.addClass("reset")
        this.timeSlider = p5.createSlider(1, 60, this.initialTimeMinutes).input((e)=>{
            this.stateMachine.trigger("timeChange")
        })
        this.timeSlider.addClass("slider")
        this.sliderLabel = p5.createDiv("Set time. Tap a clock to start")
        this.sliderLabel.addClass("slider label")
        this.makeClocks()
        this.stateMachine.start("new")
    }

    draw(){
        // Draw the two clocks side by side.
        p5.push()
        let quarterWidth = p5.windowWidth/4
        p5.background(30)
        p5.translate(quarterWidth, p5.windowHeight/2)
        this.clockA.draw(this.clockRadius)
        p5.translate(2 * quarterWidth, 0)
        this.clockB.draw(this.clockRadius)
        p5.pop()
        // Did either of the clocks run down?
        if (this.clockA.remainingSeconds() == 0 || this.clockB.remainingSeconds() == 0){
            this.stateMachine.trigger("timeout")
        }
    }

    makeButton(label){
        let button = p5.createButton(label)
        // Trigger a state transition with the same name as the button label
        button.mouseClicked(function (){this.stateMachine.trigger(label.toLowerCase())}.bind(this))
        return button
    }
}