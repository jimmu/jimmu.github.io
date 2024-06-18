"use strict"
define(["midi"],
function(midi){

    const firstKnobNumber = 16
    const firstSliderNumber = 0
    const firstMuteButton = 48
    const numberOfSoundNodes = 8
    const keyDown = 127

    let ctx
    let mainVolume
    let out
    let valuesTable
    let cells = new Map()
    let frequencyCells = new Map()
    let soundNodes = new Map()

    return {
        setup: (parentObject)=>{
            let buttonDiv = document.createElement("div")

            let loud = document.createElement("button")
            loud.textContent = "Start noise"
            loud.onclick = music
            buttonDiv.appendChild(loud)

            let quiet = document.createElement("button")
            quiet.textContent = "Shh!"
            quiet.onclick = ()=>{
                if (mainVolume){
                    mainVolume.gain.value = 1 - mainVolume.gain.value
                }
            }
            buttonDiv.appendChild(quiet)

            parentObject.appendChild(buttonDiv)
            valuesTable = document.createElement("table")
            parentObject.appendChild(valuesTable)
            let knobRow = document.createElement("tr")
            valuesTable.appendChild(knobRow)
            let sliderRow = document.createElement("tr")
            valuesTable.appendChild(sliderRow)
            let frequencyRow = document.createElement("tr")
            valuesTable.appendChild(frequencyRow)

            for (let nodeNum = 0; nodeNum<numberOfSoundNodes; nodeNum++){
                let knobCell = document.createElement("td")
                knobRow.appendChild(knobCell)
                let controlNum = firstKnobNumber + nodeNum
                cells.set(controlNum, knobCell)
                midi.subscribe(firstKnobNumber + nodeNum, updateCell)

                let sliderCell = document.createElement("td")
                sliderRow.appendChild(sliderCell)
                controlNum = firstSliderNumber + nodeNum
                cells.set(controlNum, sliderCell)
                midi.subscribe(firstSliderNumber + nodeNum, updateCell)
                midi.subscribe(firstMuteButton + nodeNum, mute)

                let frequencyCell = document.createElement("td")
                frequencyRow.appendChild(frequencyCell)
                frequencyCells.set(nodeNum, frequencyCell)

                let soundNode = {
                    "nodeNumber": nodeNum,
                    "oscillator": null,
                    "gain": null
                }

                soundNodes.set(nodeNum, soundNode)
            }
        }
    }

    function music(){
        if (!mainVolume){
            ctx = new AudioContext || webkitAudioContext();
            out = ctx.destination
            mainVolume = ctx.createGain()
            mainVolume.gain.volume = 1
            mainVolume.connect(out)
            // Instantiating
//            let modulatorOsc = ctx.createOscillator() // Modulator
//            let carrierOsc = ctx.createOscillator() // Carrier
//            modulatorOsc.frequency.value = 10
//            carrierOsc.frequency.value = 440
//            // Modulation depth
//            let modulatorOscGain = ctx.createGain()
//            modulatorOscGain.gain.value = 3000
//            // Wiring everything up
//            modulatorOsc.connect(modulatorOscGain)
//            modulatorOscGain.connect(carrierOsc.frequency)
//            carrierOsc.connect(mainVolume)
//            modulatorOsc.start()
//            carrierOsc.start()

//            // TODO. Make these logarithmic
//            midi.subscribe(3, (eventData)=>{
//                carrierOsc.frequency.value = 440 + eventData.controlValue
//            })
//            midi.subscribe(4, (eventData)=>{
//                modulatorOsc.frequency.value = 440 + eventData.controlValue
//            })

            // TODO also. Create an oscillator and gain node for every slider
            // Use the "M" buttons to allow mute/unmute of the channel.
            // Use the "S" buttons to mute every other channel.
            // Use "R" to have this channel modulated by the one on its right.
            // Use the slider plus the knob above it to control the frequency.
            // Maybe the slider allows +/- an octave?
            // And the knob sweeps through the frequencies from 1Hz to 10,000Hz (say?)

        }
    }

    function updateCell(eventData){
        let cell = cells.get(eventData.controlNumber)
        if (cell) {
            cell.textContent = eventData.controlValue
        }

        if (mainVolume){
            // The sound system has been started
            let soundNodeNum = eventData.controlNumber % 8
            let knobValue
            let sliderValue
            let knobTwiddled = eventData.controlNumber >= firstKnobNumber && eventData.controlNumber < (firstKnobNumber + numberOfSoundNodes)
            let sliderSlid = eventData.controlNumber < numberOfSoundNodes
            if (knobTwiddled || sliderSlid) {
                sliderValue = midi.getControlValue(soundNodeNum)
                knobValue = midi.getControlValue(firstKnobNumber + soundNodeNum)
                let frequency = sliderAndKnobToFrequency(sliderValue, knobValue)
                let soundNode = soundNodes.get(soundNodeNum)
                if (soundNode){
                    if (!soundNode.oscillator){
                        soundNode.oscillator = ctx.createOscillator()
                        soundNode.gain = ctx.createGain()
                        soundNode.gain.gain.value = 1
                        soundNode.oscillator.connect(soundNode.gain)
                        soundNode.gain.connect(mainVolume)
                        soundNode.oscillator.start()
                    }
                    soundNode.oscillator.frequency.value = frequency

                    let frequencyCell = frequencyCells.get(soundNodeNum)
                    if (frequencyCell) {
                        frequencyCell.textContent = Math.floor(frequency)
                    }
                }
            }
        }
    }

    function mute(eventData){
        let soundNodeNum = eventData.controlNumber - firstMuteButton
        let soundNode = soundNodes.get(soundNodeNum)
        if (soundNode && soundNode.gain){
            if (eventData.controlValue == keyDown){
                soundNode.gain.gain.value = 1 - soundNode.gain.gain.value
            }
        }
    }

    function sliderAndKnobToFrequency(sliderValue, knobValue){
        console.log(sliderValue + ", " + knobValue + " => " + sliderValue * knobValue)
        // TODO. Something better
        return (sliderValue/2) * (knobValue/2)
    }
})