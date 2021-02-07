"use strict";

const gridWidth = 8 * 6;		// Make the dimension a multiple of 6 for simplest base 64 bit twiddling when we load and save.
const gridHeight = gridWidth;	// Square works best.
const framesPerSecond = 15;
const gridLineColour = "gray";
const lifeColour = "green";
const maxHistoryDepth = 100;
const base64Chars= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const gameDiv = document.getElementById("life");
var controlsDiv;

var initialChanceOfBeingDead = 0.8;
var gridCells;
var svg;
var currentGeneration;
var historyBuffer;
var nextFreeHistorySlot;
var currentHistoryDepth;
var lineChanges;
var running = false;
var startStopButton;
var topologyButton;
var doughnut = true;

var touchStartX;
var touchStartY;

init();
setInterval(gameLoop, 1000/framesPerSecond);

function init(){
	console.log('Hello from init');
	if (typeof(Storage) !== "undefined") {
	  console.log("Local storage is available");
	} else {
	  console.log("No local storage");
	}
	running = false;
	historyBuffer = new Array(maxHistoryDepth);
	nextFreeHistorySlot = 0;
	currentHistoryDepth = 0;
	createGridCells();
	createFirstGeneration(initialChanceOfBeingDead);
	drawCurrentGeneration();
	
	controlsDiv = document.createElement("div");
	gameDiv.appendChild(controlsDiv);
	startStopButton = makeButton("Start", startOrStop);
	makeButton("Step", step);
	makeButton("Back", stepBack);
	makeButton("Clear", clear);
	makeButton("Random", randomGrid);
	topologyButton = makeButton("Doughnut", topology);
	makeButton("Save", save);
	makeButton("load", load);
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
	if (event.type == "touchstart"){
		event.srcElement.onclick = null;
	}
	running = !running;
	startStopButton.textContent = (running ? "Stop" : "Start");
	drawCurrentGeneration();
}

function step(event){
	console.log("Single step");
	stop(event);
	// If we have history available,use it instead of calculating. That way we won't lose handmade edits. 
	// Or should hand editing just clear the history?
	// Or should next-from-history and calculate-next be different buttons?
	calculateNextGeneration();
	drawCurrentGeneration();
}

function stepBack(event){
	console.log("Step back");
	lineChanges.fill(true);	// The lineChanges optimisation will be messed up by stepping back.
	stop(event);
	if (currentHistoryDepth > 0){
		var previousHistorySlot = (maxHistoryDepth + nextFreeHistorySlot -1)%maxHistoryDepth;	// Circular buffer
		currentGeneration = historyBuffer[previousHistorySlot].slice();
		nextFreeHistorySlot = previousHistorySlot;
		currentHistoryDepth--;
		drawCurrentGeneration();
	}
}

function clear(event){
	stop(event);
	currentHistoryDepth = 0;
	createFirstGeneration(1);
	drawCurrentGeneration();
}

function randomGrid(event){
	if (running){
		startOrStop(event);
	}
	currentHistoryDepth = 0;
	createFirstGeneration(initialChanceOfBeingDead);
	drawCurrentGeneration();
}

function stop(event){
	if (running){
		running = false;
		startStopButton.textContent = "Start";
	}
}

function topology(event){
	stop(event);
	doughnut = !doughnut;
	topologyButton.textContent = doughnut? "Doughnut" : "Flat";
}

function save(event){
	stop(event);
	var base64Encoded = "";
	// As well as stringifying the state, can we make a thumbnail graphic?
	for (let y = 0; y < gridWidth; y++){
		for (let chunk = 0; chunk < gridWidth/6; chunk++){
			// Create a number from the next 6 booleans.
			var bitField = 0;
			for (let x = 0; x < 6; x++){
				bitField = (2*bitField) + (currentGeneration[y][(6*chunk)+x]? 1 : 0);
			}
			base64Encoded += base64Chars[bitField];
		}
	}
	localStorage.setItem("lifeIsLifeSavedState0", base64Encoded);
}

function load(event){
	stop(event);
	var base64Encoded = localStorage.lifeIsLifeSavedState0;
	console.log(base64Encoded);
	// As well as stringifying the state, can we make a thumbnail graphic?
	for (let y = 0; y < gridWidth; y++){
		lineChanges[y] = true;
		for (let chunk = 0; chunk < gridWidth/6; chunk++){
			var bitField = base64Chars.indexOf(base64Encoded.charAt(((gridWidth/6)*y)+chunk));
			for (var x = 5; x >= 0; x--){
				currentGeneration[y][(6*chunk)+x] = ((bitField%2) == 1)
				bitField = Math.floor(bitField/2);
			}
		}
	}
	drawCurrentGeneration();
	//localStorage.setItem("lifeIsLifeSavedState0", base64Encoded);
}

function squareClicked(x, y){
	currentHistoryDepth = 0;	// If we've edited the state then we're starting a new history. Sort of. See longer comment int the step function.
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
		// If this line or the one above or below changed the last time round we'd better do the math this time.
		// If none of those lines changes then nothing on this line will change this time, so skip it.
		var recalcThisLine;
		if (doughnut){
			recalcThisLine = lineChanges[y] 
							|| lineChanges[(gridHeight + y -1)%gridHeight] 
							|| lineChanges[(y + 1)%gridHeight];			
		}
		else {
			recalcThisLine = lineChanges[y] 
							|| lineChanges[Math.max(y-1, 0)] 
							|| lineChanges[Math.min(y+1, gridHeight-1)];
		}
		if (recalcThisLine){
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
	historyBuffer[nextFreeHistorySlot] = currentGeneration.slice();
	nextFreeHistorySlot = (nextFreeHistorySlot + maxHistoryDepth + 1)%maxHistoryDepth;	// Circular buffer
	currentHistoryDepth = Math.min(currentHistoryDepth + 1, maxHistoryDepth);
	currentGeneration = nextGeneration.slice();
	if (linesRecalculated == 0 && running){	
		stop();
	}
	lineChanges = changedInNextGen.slice();
	//console.log("Recalculated "+linesRecalculated+" lines out of "+gridHeight);
}

function checkNeighbour(ourX, ourY, xOffset, yOffset){
	if (doughnut){
		var neighbourY = (gridHeight + ourY + yOffset)%gridHeight;
		var neighbourX = (gridWidth + ourX + xOffset)%gridWidth;
		return currentGeneration[neighbourY][neighbourX] ? 1 : 0;
	}
	else {
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
	//theButton.addEventListener("touchstart", doThis);
	controlsDiv.appendChild(theButton);	
	return theButton;
}

function clickBehaviourWrapper(){
	
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
