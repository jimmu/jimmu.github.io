"use strict";
require([],
function(){
    // Comma separated bottles. Space separated colours within bottles.
    // Top-to-bottom order.
    // Dash means an empty bottle.
    // So this is 12 bottles (and 12 colours) plus 2 empties.
    // The must be n of each colour, where n is the largest number of colours in any bottle.
    const sampleProblem = "w lo br lg, do lb lg y, br do y lo, dg y pu pu, do lb dg lo, db r db lo, pi pu w r, lg pi pu r, dg db db lb, r pi pi w, dg lb do br, br lg y w,-,-"

    const colourTerms = new Map([
      ["bla", "black"],
      ["blk", "black"],
      ["w", "white"],
      ["wh", "white"],
      ["wht", "white"],
      ["lr", "light red"],
      ["r", "red"],
      ["dr", "dark red"],
      ["lm", "light magenta"],
      ["lma", "light magenta"],
      ["ma", "magenta"],
      ["ma", "magenta"],
      ["dma", "dark magenta"],
      ["dma", "dark magenta"],
      ["lo", "light orange"],
      ["o", "orange"],
      ["or", "orange"],
      ["do", "dark orange"],
      ["dor", "dark orange"],
      ["y", "yellow"],
      ["ye", "yellow"],
      ["ly", "light yellow"],
      ["lye", "light yellow"],
      ["dy", "dark yellow"],
      ["dye", "dark yellow"],
      ["lg", "light green"],
      ["lgr", "light green"],
      ["g", "green"],
      ["gr", "green"],
      ["dg", "dark green"],
      ["dgr", "dark green"],
      ["c", "cyan"],
      ["cy", "cyan"],
      ["lb", "light blue"],
      ["lbl", "light blue"],
      ["b", "blue"],
      ["bl", "blue"],
      ["db", "dark blue"],
      ["dbl", "dark blue"],
      ["lp", "light pink"],
      ["lpi", "light pink"],
      ["p", "pink"],
      ["pi", "pink"],
      ["dp", "dark pink"],
      ["dpi", "dark pink"],
      ["li", "light indigo"],
      ["lin", "light indigo"],
      ["i", "indigo"],
      ["in", "indigo"],
      ["di", "dark indigo"],
      ["din", "dark indigo"],
      ["v", "light violet"],
      ["vi", "light violet"],
      ["lv", "violet"],
      ["lvi", "violet"],
      ["dv", "dark violet"],
      ["dvi", "dark violet"],
      ["lpu", "light purple"],
      ["pu", "purple"],
      ["pur", "purple"],
      ["dpu", "dark purple"],
      ["lbr", "light brown"],
      ["br", "brown"],
      ["dbr", "dark brown"]
    ])
    const colourNames = new Set(colourTerms.values())

    const maxSecondsToSpend = 30
    let startTime = performance.now()

    let statesAlreadyTried = new Set()
    let shortestSequence = null
    let problemInputLabel = document.createElement("span")
    problemInputLabel.textContent = "Bottle colours:"
    let problemInputField = document.createElement("input")
    problemInputField.type = "text"
    let startButton = document.createElement("button")
    startButton.textContent = "Solve"
    let messageDiv = document.createElement("div")
    let bottleDisplayDiv = document.createElement("div")
    document.body.appendChild(problemInputLabel)
    document.body.appendChild(problemInputField)
    document.body.appendChild(document.createElement("br"))
    document.body.appendChild(startButton)
    document.body.appendChild(messageDiv)
    document.body.appendChild(bottleDisplayDiv)

    problemInputField.oninput = ()=>{
        startButton.disabled = false
        nextButton.disabled = true
        prevButton.disabled = true
        shortestSequence = null
        message("")
        let bottles = problemTextToObject()
        bottleCapacity = biggestBottle(bottles)
        drawTheBottles(bottles)
    }

    // Colour layers going from top to bottom.
    problemInputField.value = sampleProblem

    let someBottles = problemTextToObject()
    let bottleCapacity =biggestBottle(someBottles)
    drawTheBottles(someBottles)

    startButton.onclick = ()=>{
        startButton.disabled = true
        setTimeout(()=>{
            selfTest()
            someBottles = problemTextToObject()
            bottleCapacity = biggestBottle(someBottles)
            message("Working...")
            drawTheBottles(someBottles)
            reportBestSolution()
            setTimeout(()=>{
                solve(copyBottles(someBottles))
                animateTheSolution()
            }, 10)
        }, 10)
    }

    let nextButton = document.createElement("button")
    nextButton.textContent = "Next Move"
    nextButton.disabled = true
    let prevButton = document.createElement("button")
    prevButton.textContent = "Previous Move"
    prevButton.disabled = true
    document.body.appendChild(prevButton)
    document.body.appendChild(nextButton)

    function solve(bottles){
        checkValidProblem(bottles)
        shortestSequence = null
        statesAlreadyTried = new Set()
        reportBestSolution()
        startTime = performance.now()
        extendThisSequence(bottles, [])
        if (!shortestSequence){
            console.log("There is no solution")
            message("There is no solution")
        }
    }

    function extendThisSequence(bottles, moveSequence){
        if (((performance.now() - startTime)/1000) > maxSecondsToSpend){
            console.log("Spent more than "+maxSecondsToSpend+"s thinking about this. Stop now")
            return
        }
        // We could use an explicit stack so the work can be done in chunks,
        // allowing the browser some cpu cycles to do rendering.
        // Then we can give updates on the best solution found so far.
        // I did try that, but it was noticeably slower.

        // We can prune the search if we're not going to improve on the current solution.
        if (shortestSequence == null || moveSequence.length < shortestSequence.length - 1){
            let possibleMoves = findPossibleMoves(bottles)
            let foundSolutionAtThisLevel = false
            for (let i=0; i<possibleMoves.length && !foundSolutionAtThisLevel; i++){
                let move=possibleMoves[i]
                // Try this move.
                let newBottles = applyMove(bottles, move)
                let currentStateAsString = JSON.stringify(newBottles)
                // Did that lead us to a state we've already tried?
                if (!statesAlreadyTried.has(currentStateAsString)){
                    statesAlreadyTried.add(currentStateAsString)
                    // Did that solve the game?
                    let sequenceIncludingLastMove = moveSequence.concat(move)
                    if (isSolved(newBottles)){
                        foundSolutionAtThisLevel = true
                        if (shortestSequence == null || moveSequence.length < shortestSequence.length){
                            shortestSequence = [].concat(sequenceIncludingLastMove)
                            reportBestSolution()
                        }
                    }
                    else {
                        // Try all the further possible moves from here.
                        extendThisSequence(newBottles, sequenceIncludingLastMove)
                    }
                }
            }
        }
    }

    // Return an array of all possible moves
    function findPossibleMoves(bottles){
        let possibleMoves = []
        // Try every from bottle in turn.
        for (let fromBottle = 0; fromBottle<bottles.length; fromBottle++){
            if (!isEmpty(bottles[fromBottle]) && ! (isBottleComplete(bottles[fromBottle]))){
                possibleMoves.push(...possibleMovesFromBottle(bottles, fromBottle))
            }
        }
        return possibleMoves
    }

    function possibleMovesFromBottle(bottles, fromBottle){
        let possibleMoves = []
        let fromBottleColour = topColour(bottles[fromBottle])
        for (let toBottle = 0; toBottle<bottles.length; toBottle++){
            if (toBottle != fromBottle && !isFull(bottles[toBottle])){
                // See if the colour at the top of this bottle will accept
                // the colour we have available.
                let toBottleColour = topColour(bottles[toBottle])
                let toBottleIsEmpty = toBottleColour == "-"
                if (toBottleColour == fromBottleColour || toBottleIsEmpty){
                    // We have a move. Now check how much will pour.
                    let spaceInTarget = availableSpace(bottles[toBottle])
                    let amountToPour = topLayerThickness(bottles[fromBottle])
                    // Don't bother pouring less than the full layer
                    if (amountToPour <= spaceInTarget){
                        let pouringWholeBottle = amountToPour + availableSpace(bottles[fromBottle]) == bottleCapacity
                        // Don't move an entire stack to an empty bottle. It's a pointless move and leads us to wasted search effort.
                        if (!pouringWholeBottle || !toBottleIsEmpty){
                            possibleMoves.push({from: fromBottle, to: toBottle, layers: amountToPour})
                        }
                    }
                }
            }
        }
        return possibleMoves
    }

    // Do not mutate the bottles.
    // Instead return a new array which has had the move applied.
    function applyMove(originalBottles, move){
        let bottles = copyBottles(originalBottles)
        let topOfFrom = bottles[move.from].length - 1
        let removed = bottles[move.from].splice(topOfFrom - (move.layers - 1), move.layers)
        bottles[move.to].push(...removed)
        if (bottles[move.to].length > bottleCapacity){
            console.log("*** Move overfilled a bottle. "+JSON.stringify(move)+","+JSON.stringify(bottles))
        }
        return bottles
    }

    function reverseMove(bottles, move){
        return applyMove(bottles, {from: move.to, to: move.from, layers: move.layers})
    }

    function topColour(bottle){
        let spaceInBottle = availableSpace(bottle)
        if (spaceInBottle == bottleCapacity) {
            // It's empty. Any colour can go in here
            return "-"
        }
        return bottle[(bottleCapacity - spaceInBottle)-1]
    }

    function topLayerThickness(bottle){
        let thickness = 0
        let colourAtTop = topColour(bottle)
        // Is the next layer down the same colour?
        let sameColour = true
        for (let i=(bottleCapacity - availableSpace(bottle))-1; i>=0 && sameColour; i--){
            sameColour = (bottle[i] == colourAtTop)
            if (sameColour){
                thickness++
            }
        }
        return thickness
    }

    // Return true if every bottle is either empty or complete
    function isSolved(bottles){
        let couldBeSolved = true
        for (let i=0; i<bottles.length && couldBeSolved; i++){
            couldBeSolved = couldBeSolved && (isEmpty(bottles[i]) || isBottleComplete(bottles[i]))
        }
        return couldBeSolved
    }

    // Return true iff the bottle is full and contains only one colour
    function isBottleComplete(bottle){
        let couldBeComplete = isFull(bottle)
        if (couldBeComplete){
            let colour = bottle[0]
            for (let i=1; i<bottleCapacity && couldBeComplete; i++){
                couldBeComplete = couldBeComplete && (colour == bottle[i])
            }
        }
        return couldBeComplete
    }

    function isFull(bottle){
        return availableSpace(bottle) == 0
    }

    function isEmpty(bottle){
        return bottle.length == 0
    }

    function availableSpace(bottle){
        return bottleCapacity - bottle.length
    }

    function copyBottles(originalBottles){
        let copy = []
        for (let bottle of originalBottles) {
            copy.push([...bottle])
        }
        return copy
    }

    function selfTest(){
        assert(topColour([]), "-", "Top colour check 1")
        assert(topColour(["r"]), "r", "Top colour check 2")
        assert(topColour(["r", "g", "b"]), "b", "Top colour check 3")
        assert(topColour(["r", "y"]), "y", "Top colour check 4")
        assert(topLayerThickness(["r","y","g","g"]), 2, "Top layer thickness check 1")
        assert(topLayerThickness(["r","y","g"]), 1, "Top layer thickness check 2")
        assert(topLayerThickness(["r", "y"]), 1, "Top layer thickness check 3")
        assert(topLayerThickness([]), 0, "Top layer thickness check 4")
        assert(topLayerThickness(["br","r","w","br"]), 1, "Top layer thickness check 5")
        assert(isEmpty([]), true, "Emptiness check 1")
        assert(isEmpty([1]), false, "Emptiness check 2")
        assert(isFull([]), false, "Fullness check 1")
        assert(isFull(Array(bottleCapacity).fill(0)), true, "Fullness check 2")
        assert(isBottleComplete([]), false, "Bottle completeness check 1")
        let bottle = Array(bottleCapacity).fill(0)
        assert(isBottleComplete(bottle), true, "Bottle completeness check 2")
        bottle[0] = 1
        assert(isBottleComplete(bottle), false, "Bottle completeness check 3")
        let bottles = [["r", "g", "b"], []]
        let move = {from: 0, to: 1, layers: 1}
        let newBottles = applyMove(bottles, move)
        assert(newBottles[0].length, 2, "Move check 1")
        assert(newBottles[1].length, 1, "Move check 2")
        assert(newBottles[1][0], "b", "Move check 3")
        bottles = [[1,2,3],[4,5,6]]
        let copied = copyBottles(bottles)
        assert(copied[0][0], 1, "Copy check 1")
        assert(copied[0][2], 3, "Copy check 2")
        assert(copied[1][0], 4, "Copy check 3")
        bottles[0][0] = 9
        assert(copied[0][0], 1, "Copy check 4")
        bottles = [["r","o","y"],["r","y"],["y","o"],["o"],["r"]]
        bottleCapacity = biggestBottle(bottles)
        let moves = findPossibleMoves(bottles)
        assert(moves.length, 3, "Possible moves check 1")
        assert(moves[0], {from: 0, to: 1, layers: 1}, "Possible moves check 2")
        assert(moves[1], {from: 2, to: 3, layers: 1}, "Possible moves check 3")
        assert(moves[2], {from: 3, to: 2, layers: 1}, "Possible moves check 4")
        assert(expandColourName("bl"), "blue", "Colour name check 1")
        assert(expandColourName("bla"), "black", "Colour name check 2")
        assert(expandColourName("dgr"), "dark green", "Colour name check 3")

        console.log("Self checks passed")
    }

    function checkValidProblem(bottles){
        // Make sure there are n of each colour, where n is the bottle capacity
        let colourCounts = new Map()
        for (let bottle of bottles){
            for (let colour of bottle){
                if (colourCounts.has(colour)){
                    colourCounts.set(colour, colourCounts.get(colour)+1)
                }
                else {
                    colourCounts.set(colour, 1)
                }
            }
        }
        for (let colour of colourCounts.keys()){
            console.log("There are "+colourCounts.get(colour)+" "+colour+"s")
            let countOfColour = colourCounts.get(colour)
            if (countOfColour != bottleCapacity){
                message("There are "+countOfColour+" of colour "+colour+" when "+ bottleCapacity + " are expected")
            }
            assert(colourCounts.get(colour), bottleCapacity, "Valid problem check")
        }
        console.log("There are "+colourCounts.size+" colours")
    }

    function assert(actual, expected, message){
        let actualAsString = JSON.stringify(actual)
        let expectedAsString = JSON.stringify(expected)
        if (actualAsString != expectedAsString){
            throw new Error(actualAsString + " != " + expectedAsString + " : " + message)
        }
    }

    function animateTheSolution(){
        if (shortestSequence){
            nextButton.disabled = false
            prevButton.disabled = true
            let moveNumber = 0
            nextButton.onclick = ()=>{
                if (moveNumber < shortestSequence.length){
                    let move = shortestSequence[moveNumber]
                    someBottles = applyMove(someBottles, move)
                    drawTheBottles(someBottles, move)
                    moveNumber++
                    if (moveNumber == shortestSequence.length){
                        nextButton.disabled = true
                    }
                    prevButton.disabled = false
                }
            }
            prevButton.onclick = ()=>{
                if (moveNumber > 0){
                    moveNumber--
                    let move = shortestSequence[moveNumber]
                    someBottles = reverseMove(someBottles, move)
                    drawTheBottles(someBottles, move)
                    if (moveNumber == 0){
                        prevButton.disabled = true
                    }
                    nextButton.disabled = false
                }
            }
        }
    }

    function drawTheBottles(bottles, latestMove){
        let table = document.createElement("table")
        let topBottles = []
        let bottomBottles = []
        for (let layer=0; layer<bottleCapacity; layer++){
          let topLevel = document.createElement("tr")
          let bottomLevel = document.createElement("tr")
          topBottles.push(topLevel)
          bottomBottles.push(bottomLevel)
          for (let bottleNum = 0; bottleNum<bottles.length; bottleNum++){
            let thisColour = bottles[bottleNum][(bottleCapacity-layer)-1]
            let thisCell = document.createElement("td")
            //thisCell.textContent = thisColour
            let involvedInMove = ""
            let positionInBottle = "middle"
            if (layer == 0){
                positionInBottle = "top"
            }
            else if (layer == bottleCapacity-1){
                positionInBottle = "bottom"
            }
            if (latestMove && bottleNum == latestMove.from){
                involvedInMove = "movedFrom"
            }
            else if (latestMove && bottleNum == latestMove.to){
                involvedInMove = "movedTo"
            }
            thisCell.className = thisColour + " " + positionInBottle + " " + involvedInMove
            if (bottleNum <= (bottles.length-1)/2){
                topLevel.appendChild(thisCell)
            }
            else {
                bottomLevel.appendChild(thisCell)
            }
          }
        }
        for (let row of topBottles){
          table.appendChild(row)
        }
        let emptyRow = document.createElement("tr")
        table.appendChild(emptyRow)
        for (let row of bottomBottles){
          table.appendChild(row)
        }
        bottleDisplayDiv.replaceChildren(table)
    }

    function reportBestSolution(){
        if (shortestSequence){
            console.log("New shortest solution is "+shortestSequence.length+" moves")
            message("Found a solution with " + shortestSequence.length + " moves")
        }
    }

    function message(text){
        let message = document.createElement("span")
        message.textContent = text
        messageDiv.replaceChildren(message)
    }

    function problemTextToObject(){
        let asText = problemInputField.value
        let bottles = []
        if (asText){
            for (let bottleString of asText.toLowerCase().split(",")){
                if (bottleString.trim() == "-"){
                    bottles.push([])
                }
                else {
                    // Reversed because the code was written to expect bottom-to-top ordering.
                    let thisBottle = bottleString.trim().split(/\s+/).reverse()
                    // Now expand any abbreviations to full colour names
                    bottles.push(thisBottle.map((c)=>{return expandColourName(c)}))
                }
            }
        }
        console.log("Parsed from the input field: "+JSON.stringify(bottles))
        return bottles
    }

    function biggestBottle(bottles){
        return Math.max.apply(0, bottles.map((arr)=>{return arr.length}))
    }

    // Take an abbreviation and turn it into the full word that it represents.
    // e.g "b"->"blue"
    function expandColourName(colour){
        // We might be given the whole word.
        if (colourNames.has(colour)){
            return colour
        }
        if (colourTerms.has(colour)){
            return colourTerms.get(colour)
        }
    }
})
