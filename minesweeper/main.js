"use strict";
require([],
function(){
    console.log("Hello.");
    // Generate a grid. Put a button in each cell.
    var gridWidth;
	var gridHeight;
    var numberOfMines;
    var unexposedNonMineTiles;
    var flaggedTiles;
    const IS_A_MINE = 9;

    var firstClick;
    var mineGrid;
	const numImages = ["images/zero.png", "images/one.png", "images/two.png", "images/three.png", "images/four.png", "images/five.png", "images/six.png", "images/seven.png", "images/eight.png"];
    var gameOn;
    var digging;

    var table = document.createElement("table");
    document.body.appendChild(table);

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

    function startGame(width, height){
        gridWidth = width;
        gridHeight = height;
        numberOfMines = Math.floor((width*height)/5)
        unexposedNonMineTiles = (width*height)-numberOfMines;
        flaggedTiles = 0;
        gameOn = true;
        firstClick = true;
        mineGrid = [];
        for (col=0; col<width; col++){
            mineGrid.push([]);
        }

        // Clear any previous table content
        table.innerHTML = '';
        // And fill the table with new buttons
        for (var row=0; row<gridHeight; row++){
            var thisRow = document.createElement("tr");
            table.appendChild(thisRow);
            for(var col=0; col<gridWidth; col++){
                mineGrid[col][row] = {mineNumber:0, button: null, isFlagged: false};
                var cell = document.createElement("td");
                thisRow.appendChild(cell);
                var thisButton = document.createElement("img");
                thisButton.src="images/unclicked.png"
                mineGrid[col][row].button=thisButton;
                cell.appendChild(thisButton);
                thisButton.onclick = (function(c, r, button){
                    return function(){
                        clickedCell(c, r, button);
                    }
                })(col, row);
            }
        }

        flaggingOrDiggingButton.textContent = "Digging";
        digging = true;
    }

    var newSmallGameButton = document.createElement("button");
    newSmallGameButton.textContent = "New Game. Small";
    newSmallGameButton.onclick=function(){
        startGame(8, 8);
    }
    document.body.appendChild(newSmallGameButton);

    var newMediumGameButton = document.createElement("button");
    newMediumGameButton.textContent = "New Game. Medium";
    newMediumGameButton.onclick=function(){
        startGame(10, 10)
    }
    document.body.appendChild(newMediumGameButton);

    var newLargeGameButton = document.createElement("button");
    newLargeGameButton.textContent = "New Game. Large";
    newLargeGameButton.onclick=function(){
        startGame(16, 12);
    }
    document.body.appendChild(newLargeGameButton);

    // TODO. Don't let a game be started in flagging mode.

    // TODO. Show something when the game is won.

    // TODO. Make the New Game buttons do something.

    function clickedCell(clickedCol, clickedRow){
        var button = mineGrid[clickedCol][clickedRow].button;
        if (!button.disabled){
            if (digging){
                if (mineGrid[clickedCol][clickedRow].isFlagged){
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
                            if (mineGrid[col][row].mineNumber != IS_A_MINE){
                                // Count the neighbouring mines.
                                var adjacentMines = mineAtCoord(col-1, row-1) +
                                                    mineAtCoord(col, row-1) +
                                                    mineAtCoord(col+1, row-1) +
                                                    mineAtCoord(col-1, row) +
                                                    mineAtCoord(col+1, row) +
                                                    mineAtCoord(col-1, row+1) +
                                                    mineAtCoord(col, row+1) +
                                                    mineAtCoord(col+1, row+1);
                                mineGrid[col][row].mineNumber = adjacentMines;
                            }
                        }
                    }
                }
                if (digging){
                    var cellContent = mineGrid[clickedCol][clickedRow].mineNumber;
                    if (cellContent == IS_A_MINE){
                        button.src="images/mine.png"
                        gameOn = false;
                        console.log("Oh that's bad news.");
                    }
                    else {
                        button.src=numImages[cellContent];
                        unexposedNonMineTiles--;
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
                    if (mineGrid[clickedCol][clickedRow].isFlagged){
                        button.src="images/unclicked.png";
                        mineGrid[clickedCol][clickedRow].isFlagged=false;
                        flaggedTiles--;
                    }
                    else {
                        button.src="images/flag.png";
                        mineGrid[clickedCol][clickedRow].isFlagged=true;
                        flaggedTiles++;
                    }
                }
            }
        }
    }

    function layMines(firstClickCol, firstClickRow){
        for (var mineNumber=0; mineNumber<numberOfMines; mineNumber++){
            var coords;
            var foundValidSpace = false;
            var spaceIsEmpty = false;
            while (!foundValidSpace) {
                coords = randomCell();
                spaceIsEmpty = (mineGrid[coords.col][coords.row].mineNumber != IS_A_MINE);
                // We want the first click to be on a zero.
                // So don't allow mines in the 9 squares nearest the first click.
                foundValidSpace = spaceIsEmpty && (
                    (coords.col > firstClickCol+1 || coords.col < firstClickCol-1) ||
                    (coords.row > firstClickRow+1 || coords.row < firstClickRow-1)
                );
            }
            mineGrid[coords.col][coords.row].mineNumber = IS_A_MINE;
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
        return mineGrid[col][row].mineNumber;
    }
});
