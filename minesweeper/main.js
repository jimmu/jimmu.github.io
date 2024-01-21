"use strict";
require([],
function(){
    console.log("Hello.");
    // Generate a grid. Put a button in each cell.
    const gridSize = 10;
    const numberOfMines = (gridSize*gridSize)/5;
    const IS_A_MINE = 9;

    var firstClick = true;
    var mineGrid = [];
    var buttons = [];
    var gameOn = true;
    var digging = true;

    for (col=0; col<gridSize; col++){
        buttons.push([]);
    }
    var table = document.createElement("table");
    document.body.appendChild(table);
    for (var row=0; row<gridSize; row++){
        var thisRow = document.createElement("tr");
        table.appendChild(thisRow);
        for(var col=0; col<gridSize; col++){
            var cell = document.createElement("td");
            thisRow.appendChild(cell);
            var thisButton = document.createElement("button");
            buttons[col][row]=thisButton;
            cell.appendChild(thisButton);
            thisButton.onclick = (function(c, r, button){
                return function(){
                    clickedCell(c, r, button);
                }
            })(col, row);
        }
    }
    var flaggingOrDiggingButton = document.createElement("button");
    flaggingOrDiggingButton.textContent = "Digging";
    flaggingOrDiggingButton.onclick=function(){
        if (digging){
            flaggingOrDiggingButton.textContent = "Flagging";
            digging = false;
        }
        else {
            flaggingOrDiggingButton.textContent = "Digging";
            digging = true;
        }
    }
    document.body.appendChild(flaggingOrDiggingButton);

    function clickedCell(clickedCol, clickedRow){
        var button = buttons[clickedCol][clickedRow];
        if (!button.disabled){
            button.disabled = true;
            if (gameOn) {
                console.log("Clicked "+clickedCol+","+clickedRow);
                if (firstClick){
                    console.log("First click. Need to generate the mines");
                    firstClick = false;
                    layMines(clickedCol, clickedRow);
                    // Now fill in the counts;
                    for (var col=0; col<gridSize; col++){
                        for (var row=0; row<gridSize; row++){
                            if (mineGrid[col][row] != IS_A_MINE){
                                // Count the neighbouring mines.
                                var adjacentMines = mineAtCoord(col-1, row-1) +
                                                    mineAtCoord(col, row-1) +
                                                    mineAtCoord(col+1, row-1) +
                                                    mineAtCoord(col-1, row) +
                                                    mineAtCoord(col+1, row) +
                                                    mineAtCoord(col-1, row+1) +
                                                    mineAtCoord(col, row+1) +
                                                    mineAtCoord(col+1, row+1);
                                mineGrid[col][row] = adjacentMines;
                            }
                        }
                    }
                    console.log(JSON.stringify(mineGrid))
                }
                if (digging){
                    var cellContent = mineGrid[clickedCol][clickedRow];
                    if (cellContent == IS_A_MINE){
                        button.textContent = "BOOM!"
                        gameOn = false;
                    }
                    else if (cellContent == 0){
                        button.textContent = ""
                        // Nothing. But do the collapsing-zeroes magic.
                        for (col=Math.max(clickedCol-1, 0); col<Math.min(clickedCol+2, gridSize); col++){
                            for (row=Math.max(clickedRow-1, 0); row<Math.min(clickedRow+2, gridSize); row++){
                                clickedCell(col, row);
                            }
                        }
                    }
                    else {
                        button.textContent=cellContent;
                    }
                }
                else {
                    button.textContent="X";
                }
            }
        }
    }

    function layMines(firstClickCol, firstClickRow){
        for (var col=0; col<gridSize; col++){
            var thisCol = Array(gridSize).fill(0);
            mineGrid.push(thisCol);
        }
        // We have a 2d array which we can access with [x][y]
        for (var mineNumber=0; mineNumber<numberOfMines; mineNumber++){
            var coords;
            var foundValidSpace = false;
            var spaceIsEmpty = false;
            while (!foundValidSpace) {
                coords = randomCell();
                spaceIsEmpty = !mineGrid[coords.col][coords.row];
                // We want the first click to be on a zero.
                // So don't allow mines in the 9 squares nearest the first click.
                foundValidSpace = spaceIsEmpty && (
                    (coords.col > firstClickCol+1 || coords.col < firstClickCol-1) ||
                    (coords.row > firstClickRow+1 || coords.row < firstClickRow-1)
                );
            }
            mineGrid[coords.col][coords.row] = IS_A_MINE;
        }
    }

    function randomCell(){
        var col=Math.floor(Math.random() * gridSize);
        var row=Math.floor(Math.random() * gridSize);
        return {col, row};
    }

    function mineAtCoord(col, row){
        var valAtCoord = valueAtCoord(col, row);
        if (valAtCoord == IS_A_MINE){
            return 1;
        }
        return 0;
    }

    function valueAtCoord(col, row){
        if (col<0 || col>=gridSize || row<0 || row>=gridSize){
            return 0;
        }
        var value = mineGrid[col][row];
        if (value){
            return value;
        }
        return 0;
    }
});
