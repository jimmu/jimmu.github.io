"use strict";
import Clock from './clock.js'
import {initP5, p5instance as p5} from './lib.js'
import {newStateMachine} from './stateMachine.js'
import {makeResizable, resize} from './resizable.js'

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
            resize()
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
            resize()
        })
        .addTransition("running", "pause", "paused", ()=>{
            this.clockWhichGotPaused = this.clockA.running? this.clockA : this.clockB
            this.clockA.stop()
            this.clockB.stop()
            this.resetButton.show()
            this.pauseButton.hide()
            this.resumeButton.show()
            resize()
        })
        .addTransition("paused", "resume", "running", ()=>{this.clockWhichGotPaused?.start()})
        .addTransition("paused", "reset", "new")
        .addTransition("running", "timeout", "expired", ()=>{
            this.pauseButton.hide()
            this.resetButton.show()
            resize()
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
            resize()
        }.bind(this)
        this.pauseButton = this.makeButton("Pause", {width: ()=>{return p5.windowWidth/12},
                                                     height: ()=>{return p5.windowWidth/32},
                                                     fontSize: ()=>{return p5.windowWidth/64},
                                                     xPos: ()=>{return p5.windowWidth/2 - this.pauseButton.size().width/2},
                                                     yPos: ()=>{return p5.windowHeight/2 - this.clockRadius * 0.75}})
        this.resumeButton = this.makeButton("Resume", {width: ()=>{return p5.windowWidth/12},
                                                       height: ()=>{return p5.windowWidth/32},
                                                       fontSize: ()=>{return p5.windowWidth/64},
                                                       xPos: ()=>{return p5.windowWidth/2 - this.resumeButton.size().width/2},
                                                       yPos: ()=>{return p5.windowHeight/2 - this.clockRadius * 0.75}})
        this.resetButton = this.makeButton("Reset", {width: ()=>{return p5.windowWidth/16},
                                                     height: ()=>{return p5.windowWidth/32},
                                                     fontSize: ()=>{return p5.windowWidth/64},
                                                     xPos: ()=>{return p5.windowWidth/2 - this.resetButton.size().width/2},
                                                     yPos: ()=>{return p5.windowHeight/2 + this.clockRadius * 0.75}})
        this.timeSlider = p5.createSlider(1, 60, this.initialTimeMinutes).input((e)=>{
            this.stateMachine.trigger("timeChange")
        })
        makeResizable(this.timeSlider, {width: ()=>{return p5.windowWidth * 0.2},
                                        xPos: ()=>{return p5.windowWidth * 0.4},
                                        yPos: ()=>{return p5.windowHeight/2 - this.clockRadius}})
        this.sliderLabel = this.makeDiv("Set time. Tap a clock to start")
        makeResizable(this.sliderLabel, {width: ()=>{return this.timeSlider.size().width},
                                         height: ()=>{return this.timeSlider.size().height},
                                         fontSize: ()=>{return p5.windowWidth/64},
                                         xPos: ()=>{return this.timeSlider.position().x},
                                         yPos: ()=>{return (p5.windowHeight/2 - this.clockRadius) + this.timeSlider.size().height + 4}})
        this.makeClocks()
        this.stateMachine.start("new")
        resize()
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
        // Did either of the clocks run down?
        if (this.clockA.remainingSeconds() == 0 || this.clockB.remainingSeconds() == 0){
            this.stateMachine.trigger("timeout")
        }
    }

    makeButton(label, sizeFunctions){
        let button = p5.createButton(label)
        makeResizable(button, sizeFunctions)
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
        element.style("color", p5.color(130, 130, 130))
    }
}