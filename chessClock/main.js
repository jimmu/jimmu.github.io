"use strict";
import ChessClock from './chessClock.js'
import {initP5} from './lib.js'

initP5(function(p5){
    let clock
    let timeSlider
    let previousSliderValue

    p5.setup = function(){
      p5.createCanvas(p5.windowWidth, p5.windowHeight)
      // Two clocks, which count down to zero. Analogue with minutes and seconds only. And digital.
      // Touching one clock stops it and starts the other.
      clock = new ChessClock(10)    //  default time in minutes
      clock.setup()
    }

    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }
})
