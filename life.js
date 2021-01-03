"use strict";

const gridWidth = 48;
const gridHeight = 48;
const framesPerSecond = 15;
const gridLineColour = "gray";
const lifeColour = "green";

const gameDiv = document.getElementById("life");

var initialChanceOfBeingDead = 0.8;
var gridCells;
var svg;
var currentGeneration;
var lineChanges;
var running = false;
var startStopButton;

var touchStartX;
var touchStartY;

init();
setInterval(gameLoop, 1000/framesPerSecond);

function init(){
	console.log('Hello from init');
	running = false;
	createGridCells();
	createFirstGeneration(initialChanceOfBeingDead);
	drawCurrentGeneration();
	//document.addEventListener("keydown", checkKeypress, false);
	//document.addEventListener("touchstart", touchStarted, false);
	//document.addEventListener("touchend", touchEnded, false);
	//document.addEventListener("touchmove", touchMoved, false);
	//document.addEventListener("click", mouseClick, false);	
	
	startStopButton = makeButton("Start", startOrStop);
	makeButton("Step", step);
	makeButton("Clear", clear);
	makeButton("Random", randomGrid);
}

function gameLoop(){
	if (running){
		calculateNextGeneration();
		drawCurrentGeneration();
	}
}

function createGridCells(){
	console.log("Creating cereal sized pixels");
	var maxWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var maxHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	var shortestDimension = Math.min(maxWidth, maxHeight);
	svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute ("width", shortestDimension*0.8);
	svg.setAttribute ("height", shortestDimension*0.8);
	gameDiv.appendChild(svg);

	gridCells = new Array(gridHeight);
	lineChanges = new Array(gridHeight);
    for(let y = 0; y < gridHeight; y++) {
		var thisRow = new Array(gridWidth);
		for (let x = 0; x < gridWidth; x++){
			var square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			square.setAttribute("x", (100 * x / gridWidth) + "%");
			square.setAttribute("y", (100 * y / gridHeight) + "%");
			square.setAttribute("width", 100 / gridWidth + "%");
			square.setAttribute("height", 100 / gridHeight + "%");
			square.setAttribute("fill", "none");
			square.setAttribute("stroke", gridLineColour);
			square.setAttribute("stroke-width", 1);
			// Add an on-click listener
			square.setAttribute("pointer-events", "bounding-box");
			square.addEventListener("click", function(event){squareClicked(x, y)});
			square.addEventListener("touchstart", function(event){squareClicked(x, y)});
			thisRow[x]=square;
			svg.appendChild(square);
		}
        gridCells[y]=thisRow;
		lineChanges[y]=true;
    }	
}

function startOrStop(event){
	running = !running
	startStopButton.textContent = (running ? "Stop" : "Start");
	drawCurrentGeneration();
}

function step(event){
	console.log("Single step");
	stop(event);
	calculateNextGeneration();
	drawCurrentGeneration();
}

function clear(event){
	stop(event);
	createFirstGeneration(1);
	drawCurrentGeneration();
}

function randomGrid(event){
	if (running){
		startOrStop(event);
	}
	createFirstGeneration(initialChanceOfBeingDead);
	drawCurrentGeneration();
}

function stop(event){
	if (running){
		running = false;
		startStopButton.textContent = "Start";
	}
}

function squareClicked(x, y){
	//console.log("clicked "+x+","+y);
	currentGeneration[x][y] = !currentGeneration[x][y];
	lineChanges[x]=true;
	drawCurrentGeneration();
}

function createFirstGeneration(chanceOfBeingDead){
	currentGeneration = new Array(gridHeight);
    for(let y = 0; y < gridHeight; y++) {
		var thisRow = new Array(gridWidth);
		for (let x = 0; x < gridWidth; x++){
			var cell = (Math.random() > chanceOfBeingDead);
			thisRow[x]=cell;
		}
        currentGeneration[y]=thisRow;
		lineChanges[y]=true;
    }	
}

function calculateNextGeneration(){
	//console.log("Lines changed last time round: "+lineChanges);
	var nextGeneration = new Array(gridHeight);
	var changedInNextGen = new Array(gridHeight);
	var linesRecalculated = 0;
    for(let y = 0; y < gridHeight; y++) {
		// Only recalculate this row if something near it changed last time round.
		var thisRow = new Array(gridWidth);
		if (lineChanges[y] || lineChanges[Math.max(y-1, 0)] || lineChanges[Math.min(y+1, gridHeight-1)]){
			//console.log("Have to recalculate line "+y);
			linesRecalculated++;
			for (let x = 0; x < gridWidth; x++){
				// How many neighbours do we have?
				var count = 0;
				count = count + checkNeighbour(x, y, -1, -1);
				count = count + checkNeighbour(x, y, 0, -1);
				count = count + checkNeighbour(x, y, 1, -1);

				count = count + checkNeighbour(x, y, -1, 0);
				count = count + checkNeighbour(x, y, 1, 0);

				count = count + checkNeighbour(x, y, -1, 1);
				count = count + checkNeighbour(x, y, 0, 1);
				count = count + checkNeighbour(x, y, 1, 1);
				// Be we alive or be we dead?
				var newVal;
				if (currentGeneration[y][x]){
					newVal = (count == 2 || count == 3);
				}
				else {
					newVal = (count == 3);
				}
				var changed = currentGeneration[y][x] != newVal;
				changedInNextGen[y] = changedInNextGen[y] || changed;
				thisRow[x] = newVal;
			}
		}
		else {
			thisRow = currentGeneration[y].slice()
			lineChanges[y] = false;
		}
        nextGeneration[y] = thisRow;
    }	
	currentGeneration = nextGeneration.slice();
	if (linesRecalculated == 0 && running){	
		stop();
	}
	lineChanges = changedInNextGen.slice();
	console.log("Recalculated "+linesRecalculated+" lines out of "+gridHeight);
}

function checkNeighbour(ourX, ourY, xOffset, yOffset){
	var neighbourY = ourY + yOffset;
	if (neighbourY >= 0 && neighbourY < gridHeight){
		var neighbourX = ourX + xOffset;
		if (neighbourX >= 0 && neighbourX < gridWidth){
			if (currentGeneration[neighbourY][neighbourX]){
				return 1;
			}
		}
	}
	return 0;
}

function drawCurrentGeneration(){
    for(let y = 0; y < gridHeight; y++) {
		var thisRow = new Array(gridWidth);
		for (let x = 0; x < gridWidth; x++){
			var cell = currentGeneration[x][y];
			// Turn the pixel on or off now
			if (cell){
				drawCell({"x":x, "y":y});
			}
			else {
				deleteCell({"x":x, "y":y});
			}
		}
    }		
}

function makeButton(label, doThis){
	var theButton = document.createElement("button");
	theButton.textContent = label;
	theButton.addEventListener("click", doThis);
	theButton.addEventListener("touchstart", doThis);
	gameDiv.appendChild(theButton);	
	return theButton;
}

function drawCell(coords){
	var colourToUse = lifeColour;
	if (coords.colour){
		colourToUse = coords.colour;
	}
	if (coords.y >= 0 && coords.y < gridHeight && coords.x >= 0 && coords.x < gridWidth){
		gridCells[coords.y][coords.x].setAttribute("fill", colourToUse);
	}
}

function deleteCell(coords){
	if (coords.y >= 0 && coords.y < gridHeight && coords.x >= 0 && coords.x < gridWidth){
		gridCells[coords.y][coords.x].setAttribute("fill", "none");
	}
}
