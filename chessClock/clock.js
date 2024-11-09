"use strict";
import {p5instance as p5} from './lib.js'

export default class Clock
{
    constructor(initialTimeSeconds){
        this.remainingTimeMillis = initialTimeSeconds * 1000
        this.running = false
    }

    start(){
        if (!this.running){
            this.timeStarted = Date.now()
            this.running = true
        }
    }

    stop(){
        if (this.running){
            this.remainingTimeMillis = this.remainingMillis()
            this.running = false
        }
    }

    remainingSeconds(){
        return Math.ceil(this.remainingMillis()/1000)
    }

    remainingMillis(){
        if (this.running){
            let now = Date.now()
            return Math.max(this.remainingTimeMillis + this.timeStarted - now, 0)
        }
        else {
            return this.remainingTimeMillis
        }
    }

    draw(fullRadius){
        // TODO. Instead of being passed a calculated radius, could we use a constant one
        // and have the caller use scale() to alter the size?
        p5.push()
        let fillColour = this.running? 40 : 35
        let lineColour = this.running? 250 : 125
        p5.angleMode(p5.DEGREES)
        let bigTickRadius = fullRadius * 0.95
        let secondsRadius = fullRadius * 0.9
        let minutesRadius = secondsRadius * 0.9
        let smallTickRadius = (bigTickRadius + fullRadius)/2
        // Draw the clock face
        let faceDiameter = 2 * fullRadius
        p5.noStroke()
        p5.fill(this.remainingSeconds() > 0 ? fillColour : 0)
        p5.ellipse(0, 0, faceDiameter, faceDiameter)
        // Draw some ticks.
        p5.stroke(lineColour)
        for (let i=0; i<60; i++){
            if (i % 5 == 0){
                p5.strokeWeight(0.75)
                p5.line(fullRadius, 0,  bigTickRadius, 0)
            }
            else {
                p5.strokeWeight(0.25)
                p5.line(fullRadius, 0,  smallTickRadius, 0)
        }
            p5.rotate(6)
        }
        // Draw the seconds hand.
        p5.strokeWeight(1)
        let secondsAngle = this.remainingSeconds() * 6
        p5.rotate(secondsAngle)
        p5.line(0, 0, 0, -secondsRadius)
        // Draw the minute hand
        p5.strokeWeight(4)
        let minutesAngle = this.remainingSeconds() / 10
        p5.rotate(minutesAngle - secondsAngle)
        p5.line(0, 0, 0, -minutesRadius)
        p5.pop()
        // Draw digital readout
        p5.push()
        p5.fill(lineColour)
        let seconds = this.remainingSeconds() % 60
        let minutes = (this.remainingSeconds() - seconds)/60
        p5.textAlign(p5.CENTER, p5.BOTTOM)
        p5.textSize(fullRadius/8)
        p5.textFont("Courier New")
        let paddedSeconds = ("00"+seconds).substr(-2)
        p5.text(minutes+":"+paddedSeconds, 0, fullRadius/2)
        p5.pop()
    }
}