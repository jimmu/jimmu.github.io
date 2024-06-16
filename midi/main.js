"use strict";
require(["midiDisplay"],
function(midiDisplay){
    /* Needs to run in Chrome. Safari doesn't support MIDI access */

    midiDisplay(document.body)
})
