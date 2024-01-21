"use strict";
require([],
function(){
    console.log("Hello.");
    // Generate a grid. Put a button in each cell.
    const gridWidth = 13;
	const gridHeight = 16;
    const numberOfMines = Math.floor((gridWidth*gridHeight)/5);
    var unexposedNonMineTiles = (gridWidth*gridHeight)-numberOfMines;
    var flaggedTiles = 0;
    const IS_A_MINE = 9;

    // TODO. In the mineGrid, instead of just integers, we could have objects
    // which hold the buttons and flag statuses, so we don't have multiple 2d arrays.
    var firstClick = true;
    var mineGrid = [];
    var buttons = [];
    var flags = [];
	var numImages = ["images/zero.png", "images/one.png", "images/two.png", "images/three.png", "images/four.png", "images/five.png", "images/six.png", "images/seven.png", "images/eight.png"];
    var gameOn = true;
    var digging = true;

    var newSmallGameButton = document.createElement("button");
    newSmallGameButton.textContent = "New Game. Small";
    newSmallGameButton.onclick=function(){
        console.log("Start a small game");
    }
    document.body.appendChild(newSmallGameButton);

    var newMediumGameButton = document.createElement("button");
    newMediumGameButton.textContent = "New Game. Medium";
    newMediumGameButton.onclick=function(){
        console.log("Start a medium game");
    }
    document.body.appendChild(newMediumGameButton);

    var newLargeGameButton = document.createElement("button");
    newLargeGameButton.textContent = "New Game. Large";
    newLargeGameButton.onclick=function(){
        console.log("Start a large game");
    }
    document.body.appendChild(newLargeGameButton);

    // TODO. Don't let a game be started in flagging mode.

    // TODO. Show something when the game is won.

    // TODO. Make the New Game buttons do something.
    for (col=0; col<gridWidth; col++){
        buttons.push([]);
        flags.push([]);
    }
    var table = document.createElement("table");
    document.body.appendChild(table);
    for (var row=0; row<gridHeight; row++){
        var thisRow = document.createElement("tr");
        table.appendChild(thisRow);
        for(var col=0; col<gridWidth; col++){
            var cell = document.createElement("td");
            thisRow.appendChild(cell);
            var thisButton = document.createElement("img");
			thisButton.src="images/unclicked.png"
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
            if (digging){
                if (flags[clickedCol][clickedRow]){
                    //Nothing should happen if we click on a flag in digging mode
                    exit;
                }
                button.disabled = true;
            }
            if (gameOn) {
                if (firstClick){
                    firstClick = false;
                    layMines(clickedCol, clickedRow);
                    // Now fill in the counts;
                    for (var col=0; col<gridWidth; col++){
                        for (var row=0; row<gridHeight; row++){
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
                }
                if (digging){
                    var cellContent = mineGrid[clickedCol][clickedRow];
                    if (cellContent == IS_A_MINE){
                        button.src="images/mine.png"
                        gameOn = false;
                    }
                    else {
                        button.src=numImages[cellContent];
                        unexposedNonMineTiles--;
                        console.log("Unexposed non-mines: "+unexposedNonMineTiles);
                        if (unexposedNonMineTiles == 0 && flaggedTiles == numberOfMines){
                            console.log("WIN! We should indicate that on the page.");
                            gameOn = false;
                        }
                        if (cellContent == 0){
                            // Nothing. But do the collapsing-zeroes magic.
                            for (col=Math.max(clickedCol-1, 0); col<Math.min(clickedCol+2, gridWidth); col++){
                                for (row=Math.max(clickedRow-1, 0); row<Math.min(clickedRow+2, gridHeight); row++){
                                    clickedCell(col, row);
                                }
                            }
                        }
                    }
                }
                else {
                    if (flags[clickedCol][clickedRow]){
                        button.src="images/unclicked.png";
                        flags[clickedCol][clickedRow]=false;
                        flaggedTiles--;
                    }
                    else {
                        button.src="images/flag.png";
                        flags[clickedCol][clickedRow]=true;
                        flaggedTiles++;
                    }
                }
            }
        }
    }

    function layMines(firstClickCol, firstClickRow){
        for (var col=0; col<gridWidth; col++){
            var thisCol = Array(gridWidth).fill(0);
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
        var col=Math.floor(Math.random() * gridWidth);
        var row=Math.floor(Math.random() * gridHeight);
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
        if (col<0 || col>=gridWidth || row<0 || row>=gridHeight){
            return 0;
        }
        var value = mineGrid[col][row];
        if (value){
            return value;
        }
        return 0;
    }
});
