"use strict";


export function newInventory(){
    let inventory = new Map()
    return {add, getPocket, has}

    function add(pocket, thing){
        getPocket(pocket).push(thing)
    }

    function getPocket(pocket){
        if (!inventory.has(pocket)){
            inventory.set(pocket, [])
        }
        return inventory.get(pocket)
    }

    function has(pocket, thing){
        return inventory.has(pocket) && inventory.get(pocket).includes(thing)
    }
}
