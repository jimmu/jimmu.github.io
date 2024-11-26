"use strict";

export function newStateMachine(){
    let statesAndTransitions
    let enterStateActions
    let namedEventActions
    let currentState

    // states is an object containing states, transitions and actions.
    // From a given state, an event will trigger an action and result in a new state.
    statesAndTransitions = new Map()
    enterStateActions = new Map()
    namedEventActions = new Map()
    currentState = "None"

    let machine = {
        start, addTransition, trigger, state, onEnteringState, onEventNamed
    }

    function state(){
        return currentState
    }

    function start(firstState){
        enterState(firstState, "start")
        return machine
    }

    function addTransition(from, event, to, action){
        if (!statesAndTransitions.has(from)){
            statesAndTransitions.set(from, new Map())
        }
        let transitions = statesAndTransitions.get(from)
        transitions.set(event, {to, action})
        return machine
    }

    function onEnteringState(state, action){
        enterStateActions.set(state, action)
        return machine
    }

    function onEventNamed(eventName, action){
        namedEventActions.set(eventName, action)
        return machine
    }

    function trigger(eventName){
        // If there is an event with this name - not linked to any particular state, trigger its action.
        namedEventActions.get(eventName)?.(currentState, eventName)
        // Now look at events linked to the current state
        let transitions = statesAndTransitions.get(currentState)
        if (transitions){
            let thisTransition = transitions.get(eventName)
            if (thisTransition){
                // If there's an action on this transition, execute it.
                thisTransition.action?.(currentState, eventName, thisTransition.to)
                //defaultAction(currentState, eventName, thisTransition.to)
                // Now we arrive at the target state
                enterState(thisTransition.to, eventName)
            }
        }
        return machine
    }

    function enterState(state, eventName){
        currentState = state
        // If there's an action linked to entering this state - not particular to any transition then execute it
        enterStateActions.get(currentState)?.(currentState, eventName)
    }

    return machine
}

function defaultAction(from, event, to){
    console.log("Going from "+from+" to "+to+" because of "+event)
}
