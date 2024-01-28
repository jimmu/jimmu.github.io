"use strict";
require([],
function(){
    // TODO. A flags-still-to-place counter.
    console.log("Hello.");
    // Generate a grid. Put a button in each cell.
    var gameDiv;
    var gridWidth;
	var gridHeight;
    var numberOfMines;
    var unexposedNonMineTiles;
    var flaggedTiles;
    var flagCount;
    const IS_A_MINE = 9;

    var firstClick;
    var mineGrid;
	const numImages = ["images/zero.png", "images/one.png", "images/two.png", "images/three.png", "images/four.png", "images/five.png", "images/six.png", "images/seven.png", "images/eight.png"];
    var gameOn;
    var digging;

    gameDiv = document.createElement("div");
    document.body.appendChild(gameDiv);
    makeButton(gameDiv, function(){startGame(8, 8)}, "New Game. Small");
    makeButton(gameDiv, function(){startGame(10, 10)}, "New Game. Medium");
    makeButton(gameDiv, function(){startGame(16, 12)}, "New Game. Large");
    var table = document.createElement("table");
    gameDiv.appendChild(table);
    var flagCountLabel = document.createElement("span");
    flagCountLabel.textContent = "Remaining flags";
    flagCount = document.createElement("span");
    gameDiv.appendChild(flagCountLabel);
    gameDiv.appendChild(flagCount);

    var flaggingOrDiggingButton = makeButton(gameDiv,
        function(){
            digging = !digging;
            setDiggingLabel();
        });

    function startGame(width, height){
        gridWidth = width;
        gridHeight = height;
        numberOfMines = Math.floor((width*height)/5)
        unexposedNonMineTiles = (width*height)-numberOfMines;
        flaggedTiles = 0;
        gameOn = true;
        firstClick = true;
//        mineGrid = Array(width).fill([]);
//        console.log(mineGrid);
        mineGrid = [];
        for (var col=0; col<width; col++){
            mineGrid.push([]);
        }
        fillGridWithButtons();
        digging = true;
        setDiggingLabel();
        flagCount.textContent = numberOfMines;
    }

    // TODO. Show something when the game is won.

    function clickedCell(clickedCol, clickedRow){
        var button = mineGrid[clickedCol][clickedRow].button;
        if (gameOn && !button.disabled){
            if (digging){
                // Disable the button before anything else, so that this space won't be clicked again
                // by the automatic zero thing, getting us into an infinite recursion.
                button.disabled = true;
                if (firstClick){
                    firstClick = false;
                    layMines(clickedCol, clickedRow);
                    countNeighbouringMines();
                }
                if (!mineGrid[clickedCol][clickedRow].isFlagged){
                    //Nothing should happen if we click on a flag in digging mode
                    digAtCoord(clickedCol, clickedRow);
                }
            }
            else if (!firstClick){
                flagAtCoord(clickedCol, clickedRow);
            }
        }
    }

    function digAtCoord(col, row){
        var cellContent = mineGrid[col][row].mineNumber;
        if (cellContent == IS_A_MINE){
            mineGrid[col][row].button.src="images/mine.png"
            gameOn = false;
            console.log("Oh that's bad news.");
        }
        else {
            mineGrid[col][row].button.src=numImages[cellContent];
            unexposedNonMineTiles--;
            if (cellContent == 0){
                // Nothing. But do the collapsing-zeroes magic.
                for (var c=Math.max(col-1, 0); c<Math.min(col+2, gridWidth); c++){
                    for (var r=Math.max(row-1, 0); r<Math.min(row+2, gridHeight); r++){
                        clickedCell(c, r);
                    }
                }
            }
            checkForWin();
        }
        mineGrid[col][row].button.disabled = true;
    }

    function flagAtCoord(col, row){
        if (mineGrid[col][row].isFlagged){
            mineGrid[col][row].button.src="images/unclicked.png";
            mineGrid[col][row].isFlagged=false;
            flaggedTiles--;
        }
        else {
            mineGrid[col][row].button.src="images/flag.png";
            mineGrid[col][row].isFlagged=true;
            flaggedTiles++;
        }
        flagCount.textContent = (numberOfMines - flaggedTiles)
        checkForWin();
    }

    function checkForWin(){
        if (unexposedNonMineTiles == 0 && flaggedTiles == numberOfMines){
            console.log("WIN! We should indicate that on the page.");
            gameOn = false;
        }
    }

    function fillGridWithButtons(){
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
                var thisButton = makeClickable("img", cell, (function(c, r, button){
                                                                return function(){
                                                                    clickedCell(c, r, button);
                                                                }
                                                            })(col, row));
                thisButton.src="images/unclicked.png"
                thisButton.style.width="32px";  // TODO. Work this out as a fraction of the available screen width or height.
                thisButton.style.height="32px"; // TODO. And vary it based on the grid size.
                mineGrid[col][row].button=thisButton;
            }
        }
    }

    function setDiggingLabel(){
        if (digging){
            flaggingOrDiggingButton.textContent = "Digging";
        }
        else {
            flaggingOrDiggingButton.textContent = "Flagging";
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

    function countNeighbouringMines(){
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

    function makeClickable(elementType, container, onclick, label){
        var button = document.createElement(elementType);
        if (label){
            button.textContent = label;
        }
        button.onclick=onclick
        container.appendChild(button);
        return button;
    }

    function makeButton(container, onclick, label){
        return makeClickable("button", container, onclick, label);
    }
});
