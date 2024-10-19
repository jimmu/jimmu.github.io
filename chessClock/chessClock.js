"use strict";
import Clock from './clock.js'
import {p5instance as p5} from './lib.js'
import {newStateMachine} from './stateMachine.js'

export default class ChessClock
{
    constructor(initialTimeMinutes){
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
            this.resizeHtmlElements()
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
            this.resizeHtmlElements()
        })
        .addTransition("running", "pause", "paused", ()=>{
            this.clockWhichGotPaused = this.clockA.running? this.clockA : this.clockB
            this.clockA.stop()
            this.clockB.stop()
            this.resetButton.show()
            this.pauseButton.hide()
            this.resumeButton.show()
            this.resizeHtmlElements()
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

    setup(){
        p5.createCanvas(p5.windowWidth, p5.windowHeight)
        this.clockRadius = (Math.min(p5.windowWidth/2, p5.windowHeight)/2)*0.9
        p5.windowResized = function(){
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
            this.clockRadius = (Math.min(p5.windowWidth/2, p5.windowHeight)/2)*0.9
            this.resizeHtmlElements()
        }.bind(this)
        this.pauseButton = this.makeButton("Pause")
        this.resumeButton = this.makeButton("Resume")
        this.resetButton = this.makeButton("Reset")
        this.timeSlider = p5.createSlider(1, 60, this.initialTimeMinutes).input((e)=>{
            this.stateMachine.trigger("timeChange")
        })
        this.sliderLabel = this.makeDiv("Set time. Tap a clock to start")
        this.makeClocks()
        this.stateMachine.start("new")
        p5.draw = this.draw.bind(this)
        p5.mouseClicked = this.clicked.bind(this)
    }

    draw(){
        // Draw the two clocks side by side.
        p5.push()
        let quarterWidth = p5.windowWidth/4
        p5.background(30)
        p5.translate(quarterWidth, p5.windowHeight/2)
        this.clockA.draw(this.clockRadius)
        p5.pop()
        p5.push()
        p5.translate(3 * quarterWidth, p5.windowHeight/2)
        this.clockB.draw(this.clockRadius)
        p5.pop()
    }

    // Redraw the buttons and so on if the screen has changed size.
    resizeHtmlElements(){
        this.setFontSize(this.pauseButton)
        this.setFontSize(this.resetButton)
        this.setFontSize(this.resumeButton)
        this.pauseButton.size(p5.windowWidth/12, p5.windowWidth/32)
        this.pauseButton.position(p5.windowWidth/2 - this.pauseButton.size().width/2,  p5.windowHeight/2 - this.clockRadius * 0.75)
        this.resumeButton.position(p5.windowWidth/2 - this.resumeButton.size().width/2,  p5.windowHeight/2 - this.clockRadius * 0.75)
        this.resumeButton.size(p5.windowWidth/12, p5.windowWidth/32)
        this.resetButton.size(p5.windowWidth/16, p5.windowWidth/32)
        this.resetButton.position(p5.windowWidth/2 - this.resetButton.size().width/2,  p5.windowHeight/2 + this.clockRadius * 0.75)
        // Same for the time slider
        let timeSliderY = p5.windowHeight/2 - this.clockRadius
        this.timeSlider.position(p5.windowWidth * 0.4, timeSliderY)
        this.timeSlider.size(p5.windowWidth * 0.2)
        this.sliderLabel.position(this.timeSlider.position().x, timeSliderY + this.timeSlider.size().height + 4)
        this.sliderLabel.size(this.timeSlider.size().width, this.timeSlider.size().height)
        this.setFontSize(this.sliderLabel)
        // Did one of the clocks run down?
        if (this.clockA.remainingSeconds() == 0 || this.clockB.remainingSeconds() == 0){
            this.stateMachine.trigger("timeout")
        }
    }

    makeButton(label){
        let button = p5.createButton(label)
        this.addTextStyle(button)
        button.style("background-color", p5.color(50, 50, 50))
        // Trigger a state transition with the same name as the button label
        button.mouseClicked(function (){this.stateMachine.trigger(label.toLowerCase())}.bind(this))
        return button
    }

    makeDiv(text){
        let div = p5.createDiv(text)
        this.addTextStyle(div)
        return div
    }

    addTextStyle(element){
        this.setFontSize(element)
        element.style("color", p5.color(130, 130, 130))
    }

    setFontSize(element){
        let fontSize = Math.floor(p5.windowWidth/64)
        element.style('font-size', fontSize+"px")
    }
}