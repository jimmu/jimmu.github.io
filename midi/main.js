"use strict";
require(["midiDisplay", "noise"],
function(midiDisplay, music){
    /* Needs to run in Chrome. Safari doesn't support MIDI access */

    midiDisplay(document.body)
    music.setup(document.body)
})
