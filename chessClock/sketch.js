"use strict";
import ChessClock from './chessClock.js'

new p5(function(p5){
    let clock

    p5.setup = function(){
      p5.createCanvas(p5.windowWidth, p5.windowHeight)
      // Two clocks, which count down to zero. Analogue with minutes and seconds only. And digital.
      // Touching one clock stops it and starts the other.
      clock = new ChessClock(17)
      clock.startA()
    }

    p5.draw = function(){
      clock.draw(p5)
    }

    p5.windowResized = function(){
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    }

    p5.mouseClicked = function() {
        clock.clicked(p5)
    }
})
