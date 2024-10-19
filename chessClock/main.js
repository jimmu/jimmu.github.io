"use strict";
import ChessClock from './chessClock.js'
import {initP5} from './lib.js'

initP5(function(p5){
    p5.setup = function(){
      // Two clocks, which count down to zero. Analogue with minutes and seconds only. And digital.
      // Touching one clock stops it and starts the other.
      new ChessClock(10).setup()    //  default time in minutes
    }
})
