"use strict"
define([],
function(){
    const CONTROLLER_CHANGE = 11
    let midi = null
    let controllerValues = new Map()
    let controllerListeners = new Map()

    return {
        start: function(){
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
        },
        subscribe: function(controlNumber, callback){
            let allListeners = controllerListeners.get(controlNumber)
            if (!allListeners){
                allListeners = new Set()
                controllerListeners.set(controlNumber, allListeners)
            }
            allListeners.add(callback)
        },
        getControlValue: function(controlNumber){
            let value = controllerValues.get(controlNumber)
            if (value) {
                return value
            }
            return 0
        }
    }

    function onMIDISuccess(midiAccess) {
      console.log("MIDI ready!");
      midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
      listInputsAndOutputs(midiAccess)
      listenForMIDIInput(midiAccess)
    }

    function onMIDIFailure(msg) {
      console.error(`Failed to get MIDI access - ${msg}`);
    }

    function listenForMIDIInput() {
      midi.inputs.forEach((entry) => {
        entry.onmidimessage = onMIDIMessage;
      });
    }

    function onMIDIMessage(event) {
      //let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
      let str = `MIDI message received: [${event.data.length} bytes]: `;
      for (const character of event.data) {
        str += `0x${character.toString(16)} `;
      }

      if (event.data.length == 3){
        let statusByte = event.data[0]
        let highNibble = statusByte >> 4
        let lowNibble = statusByte & 15
        if (highNibble == CONTROLLER_CHANGE){
            let channelNumber = lowNibble   // We'll listen on all channels, so probably ignore this
            let controlNumber = event.data[1]
            let controlValue = event.data[2]
            controllerValues.set(controlNumber, controlValue)
            // Is anyone interested in this controller?
            let listeners = controllerListeners.get(controlNumber)
            if (listeners){
                for (let listener of listeners){
                    listener({controlNumber, controlValue})
                }
            }
            listeners = controllerListeners.get(-1)
            if (listeners){
                for (let listener of listeners){
                    listener({controlNumber, controlValue})
                }
            }
        }

//        if (controlNumber == 0 || controlNumber == 1 || controlNumber == 2){
//            let red = controllerValues.get(0)
//            let green = controllerValues.get(1)
//            let blue = controllerValues.get(2)
//            document.body.style.backgroundColor = toHexColour(red, green, blue)
//        }
      }
    }

    function listInputsAndOutputs(midiAccess) {
      for (const entry of midiAccess.inputs) {
        const input = entry[1];
        console.log(
          `Input port [type:'${input.type}']` +
            ` id:'${input.id}'` +
            ` manufacturer:'${input.manufacturer}'` +
            ` name:'${input.name}'` +
            ` version:'${input.version}'`,
        );
      }

      for (const entry of midiAccess.outputs) {
        const output = entry[1];
        console.log(
          `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
        );
      }
    }

})
