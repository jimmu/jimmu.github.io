"use strict";
define(["libs/d3.v7.min", "midi"],
function(d3, midi){

    let midiValueContainer

    let red = 0
    let green = 0
    let blue = 0

    return function(parentObject){
        midiValueContainer = document.createElement("div")
        parentObject.appendChild(midiValueContainer)
//        midi.subscribe(0, (eventData)=>{
//            red = eventData.controlValue
//            display()
//        })
//        midi.subscribe(1, (eventData)=>{
//            green = eventData.controlValue
//            display()
//        })
//        midi.subscribe(2, (eventData)=>{
//            blue = eventData.controlValue
//            display()
//        })
        midi.subscribe(-1, (eventData)=>{
            console.log(eventData)
        })
        midi.start()
    }

    function display(){
        let hexColour = toHexColour(red, green, blue)
        midiValueContainer.textContent = hexColour
        document.body.style.backgroundColor = hexColour
    }

    function toHexColour(r, g, b){
        return "#"+toHex(2*red)+toHex(2*green)+toHex(2*blue)
    }

    // Padded to two characters.
    function toHex(dec){
        if (!dec){
            dec = 0
        }
        return ("0"+dec.toString(16)).substring(-2).slice(-2)
    }

})
