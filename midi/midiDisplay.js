"use strict";
define(["libs/d3.v7.min", "midi"],
function(d3, midi){

    let midiValueContainer

    let red = 0
    let green = 0
    let blue = 0

    return function(parentObject){
        midiValueContainer = parentObject
        midi.subscribe(0, (eventData)=>{
            red = eventData.controlValue
            display()
        })
        midi.subscribe(1, (eventData)=>{
            green = eventData.controlValue
            display()
        })
        midi.subscribe(2, (eventData)=>{
            blue = eventData.controlValue
            display()
        })
        midi.subscribe(-1, (eventData)=>{
            console.log(eventData)
        })
        midi.start()

        let foo = document.createElement("button")
        foo.textContent = "Start noise"
        foo.onclick = music
        parentObject.appendChild(foo)
    }

    // TODO. Now I know this makes sound, move it to its own module.
    function music(){
        let ctx = new AudioContext || webkitAudioContext();
        let out = ctx.destination
        // Instantiating
        let modOsc = ctx.createOscillator() // Modulator
        let carOsc = ctx.createOscillator() // Carrier
        modOsc.frequency.value = 440
        carOsc.frequency.value = 440
        // Modulation depth
        let modOsc_gain = ctx.createGain()
        modOsc_gain.gain.value = 3000
        // Wiring everything up
        modOsc.connect(modOsc_gain)
        modOsc_gain.connect(carOsc.frequency)
        carOsc.connect(out)
        modOsc.start()
        carOsc.start()

        // TODO. Make these logarithmic
        midi.subscribe(3, (eventData)=>{
            carOsc.frequency.value = 440 + eventData.controlValue
        })
        midi.subscribe(4, (eventData)=>{
            modOsc.frequency.value = 440 + eventData.controlValue
        })


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
