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
      p5.textFont("Courier New")
      clock = new ChessClock(10)    //  default time in minutes
      clock.setup(p5)
    }

    p5.draw = function(){
        clock.draw(p5)
    }

    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }

    p5.mouseClicked = function(e) {
        clock.clicked(p5)
    }
})
