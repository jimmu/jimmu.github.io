"use strict";
import ChessClock from './chessClock.js'

new p5(function(p5){
    let clock
    let timeSlider
    let previousSliderValue

    p5.setup = function(){
      p5.createCanvas(p5.windowWidth, p5.windowHeight)
      // Two clocks, which count down to zero. Analogue with minutes and seconds only. And digital.
      // Touching one clock stops it and starts the other.
      let defaultMinutes = 10
      timeSlider = p5.createSlider(1, 60, defaultMinutes)   // Minutes
      timeSlider.position(p5.windowWidth * 0.4, p5.windowHeight * 0.1)
      timeSlider.size(p5.windowWidth * 0.2)
      previousSliderValue = timeSlider.value()
      clock = new ChessClock(defaultMinutes * 60)
    }

    p5.draw = function(){
        p5.push()
        // TODO. Move this into the chess clock.
        if (!clock.started){
//            p5.fill(250)
//            p5.stroke(250)
//            p5.textAlign(p5.CENTER, p5.BOTTOM)
//            p5.text("Set time using slider", p5.windowWidth/2, p5.windowHeight * 0.1)
            if (timeSlider.value() != previousSliderValue){
                previousSliderValue = timeSlider.value()
                clock = new ChessClock(timeSlider.value() * 60)
            }
        }
        else {
            timeSlider.remove()
        }
        p5.pop()
        clock.draw(p5)
    }

    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }

    p5.mouseClicked = function(e) {
        clock.clicked(p5)
    }
})
