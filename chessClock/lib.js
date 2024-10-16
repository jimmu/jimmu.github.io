"use strict";

// Expose the p5 instance so that other files can access p5 if they choose to import it.
// This means it doesn't have to be in the global namespace
// and doesn't have to get passed around between all the methods.
export let p5instance

export function initP5(sketch){
    p5instance = new p5(sketch)
    return p5instance
}
