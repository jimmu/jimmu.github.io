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
	document.addEventListener("keydown", checkKeypress, false);
	document.addEventListener("touchstart", touchStarted, false);
	document.addEventListener("touchend", touchEnded, false);
	document.addEventListener("touchmove", touchMoved, false);
	//document.addEventListener("click", mouseClick, false);	
	
	startStopButton = document.createElement("button");
	startStopButton.textContent = "Start";
	startStopButton.addEventListener("click", startOrStop);
	gameDiv.appendChild(startStopButton);

	var stepButton = document.createElement("button");
	stepButton.textContent = "Step";
	stepButton.addEventListener("click", step);
	gameDiv.appendChild(stepButton);
		
	var clearButton = document.createElement("button");
	clearButton.textContent = "Clear";
	clearButton.addEventListener("click", clear);
	gameDiv.appendChild(clearButton);	

	var randomButton = document.createElement("button");
	randomButton.textContent = "Random";
	randomButton.addEventListener("click", randomGrid);
	gameDiv.appendChild(randomButton);	

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
			thisRow[x]=square;
			svg.appendChild(square);
		}
        gridCells[y]=thisRow;
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
    }	
}

function calculateNextGeneration(){
	var anyChanges = false;
	var nextGeneration = new Array(gridHeight);
    for(let y = 0; y < gridHeight; y++) {
		var thisRow = new Array(gridWidth);
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
			anyChanges = anyChanges || (currentGeneration[y][x] != newVal);
			thisRow[x] = newVal;
		}
        nextGeneration[y] = thisRow;
    }	
	currentGeneration = nextGeneration.slice();
	if (!anyChanges && running){
		startOrStop();
	}
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

function startNewGame(){
	clearGrid();
	hideStartMessage();
	snakeBodyCoords = [];
	
	var headCoord = {};
	headCoord.x = gridWidth / 2;
	headCoord.y = gridHeight / 2;

	var body1Coord = {};
	body1Coord.x = headCoord.x - 1;
	body1Coord.y = headCoord.y;

	var body2Coord = {};
	body2Coord.x = body1Coord.x - 1;
	body2Coord.y = headCoord.y;

	var body3Coord = {};
	body3Coord.x = body2Coord.x - 1;
	body3Coord.y = headCoord.y;

	snakeBodyCoords.push(body3Coord);	
	snakeBodyCoords.push(body2Coord);
	snakeBodyCoords.push(body1Coord);
	snakeBodyCoords.push(headCoord);	
	
	snakeDirection = "right";
	nextDirections = [];
	snakeLength = snakeBodyCoords.length;

	drawCell(headCoord);
	drawCell(body1Coord);
	drawCell(body2Coord);
	drawCell(body3Coord);

	apples = [];
	addAnApple();
	score = 0;
	gameInProgress = true;
}

function clearGrid(){
    for(let y = 0; y < gridHeight; y++) {
		for (let x = 0; x < gridWidth; x++){
			deleteCell({"x": x, "y": y});
		}
	}
}

function checkKeypress(e){
	//console.log('Keypress '+e.keyCode);
	if (e.keyCode == 37){
		pressedDirection("left");
	}		
	else if (e.keyCode == 39){
		pressedDirection("right");
	}
	
	else if (e.keyCode == 38){
		pressedDirection("up");
	}		
	else if (e.keyCode == 40){
		pressedDirection("down");
	}

	if (!gameInProgress){
		if (e.keyCode == 32){
			startNewGame();
		}
	}
}

function mouseClick(e){
}

function pressedDirection(dirPressed){
	var latestDirection;
	if (nextDirections.length == 0){
		latestDirection = snakeDirection;
	}
	else {
		latestDirection = nextDirections[nextDirections.length-1];
	}
	
	if (latestDirection == "up" || latestDirection == "down"){
		if (dirPressed == "left"){
			nextDirections.push("left");
		}		
		else if (dirPressed == "right"){
			nextDirections.push("right");
		}
	}
	else if (latestDirection == "left" || latestDirection == "right"){
		if (dirPressed == "up"){
			nextDirections.push("up");
		}		
		else if (dirPressed == "down"){
			nextDirections.push("down");
		}
	}
	//console.log('Next directions are '+nextDirections);	
}

function touchStarted(e){
	var touchObj = e.changedTouches[0]; // First finger
	touchStartX = parseInt(touchObj.clientX);
	touchStartY = parseInt(touchObj.clientY);
	//console.log("Touch started at "+touchStartX + ", " + touchStartY);
	if (!gameInProgress){
		startNewGame();
	}
	e.preventDefault();
}

function touchMoved(e){
	var touchObj = e.changedTouches[0]; // First finger
	var distX = parseInt(touchObj.clientX) - touchStartX;
	var distY = parseInt(touchObj.clientY) - touchStartY;
	var totalDistSquared = (distX * distX) + (distY * distY);
	if (totalDistSquared > 100){
		//console.log("Touch moved "+distX + ", " + distY);
		var swipeDirection;
		if (Math.abs(distX) >= Math.abs(distY)){
			// It's left or right.
			swipeDirection = distX > 0 ? "right" : "left";
		}
		else {
			// It's up or down.
			swipeDirection = distY < 0 ? "up" : "down";
		}
		pressedDirection(swipeDirection);
		// Reset where we measure movements from.
		touchStartX = parseInt(touchObj.clientX);
		touchStartY = parseInt(touchObj.clientY);
	}
	e.preventDefault();
}

function touchEnded(e){
	var touchObj = e.changedTouches[0]; // First finger
	//console.log("Touch ended");
	e.preventDefault();
}

function checkCollisions(){
	var headCoords = snakeBodyCoords[snakeLength - 1];
	if (headCoords.x < 0 || headCoords.x >= gridWidth || headCoords.y < 0 || headCoords.y >= gridHeight){
		console.log('Hit an edge!');
		stop();
	}
	else {
		for(let i = 0; i < snakeLength-1; i++) {
			var bodySegmentCoords = snakeBodyCoords[i];
			if (headCoords.x == bodySegmentCoords.x &&  headCoords.y == bodySegmentCoords.y){
				console.log('Hit the snake!');
				stop();
			}
		}
	}
	// Now check for collision with any apple.
	var appleCollidedWith;
	var ateAPurple = false;
	for(let i = 0; i < apples.length && !appleCollidedWith; i++) {
		var thisApple = apples[i];
		if (thisApple.framesUntilExpiry > 0){
			if (headCoords.x == thisApple.x && headCoords.y == thisApple.y){
				appleCollidedWith = i;
				ateTheApple = true;
				ateAPurple = (thisApple.colour == purpleAppleColour);
				score += thisApple.value;
				if (score > highScore){
					highScore = score;
				}
			}
			thisApple.framesUntilExpiry--;
			if (thisApple.framesUntilExpiry == 0){
				if (thisApple.colour == purpleAppleColour){
					thisApple.value = goldenAppleValue;
					thisApple.colour = ateTheApple? snakeBodyColour : goldenAppleColour;
					thisApple.framesUntilExpiry = goldenAppleTimeToLive;					
				}
				else if (thisApple.colour == goldenAppleColour){
					thisApple.value = normalAppleValue;
					thisApple.colour = ateTheApple? snakeBodyColour : normalAppleColour;
					thisApple.framesUntilExpiry = normalAppleTimeToLive;					
				}
				else if (thisApple.colour == normalAppleColour){
					thisApple.value = rottenAppleValue;
					thisApple.colour = rottenAppleColour;
					thisApple.framesUntilExpiry = rottenAppleTimeToLive;
				}
				drawCell(thisApple);
			}
		}
	}
	if (ateTheApple){
		console.log("Ate apple " + appleCollidedWith);
		apples.splice(appleCollidedWith, 1);
		if (ateAPurple){
			var numberOfNewApples = minNewApplesAfterEatingPurple + Math.floor(Math.random() * (maxNewApplesAfterEatingPurple - minNewApplesAfterEatingPurple));
			for(let i = 0; i < numberOfNewApples; i++) {
				addAnApple();
			}
		}
	}
	
}

function redrawScore(){
	while(scoreSpan.firstChild) {
		scoreSpan.removeChild( scoreSpan.firstChild );
	}
	scoreSpan.appendChild(document.createTextNode('Score: ' + score + ' High Score: ' + highScore));
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

function updateSnakePosition(){
	if (nextDirections.length > 0){
		snakeDirection = nextDirections[0];
		nextDirections.shift();
	}

	var currentHeadCoords = snakeBodyCoords[snakeLength - 1];
	var newHeadCoords = {x: currentHeadCoords.x, y: currentHeadCoords.y};
	
	if (snakeDirection == "right") {
		newHeadCoords.x = newHeadCoords.x + 1;
	}
	else if (snakeDirection == "up"){
		newHeadCoords.y = newHeadCoords.y - 1;
	}
	else if (snakeDirection == "left"){
		newHeadCoords.x = newHeadCoords.x - 1;		
	}
	else if (snakeDirection  == "down"){
		newHeadCoords.y = newHeadCoords.y + 1;		
	}
	snakeBodyCoords.push(newHeadCoords);
	var oldTailCoords = snakeBodyCoords[0];
	
	if (ateTheApple == false){
		snakeBodyCoords.shift();	
		// Remove the old snake tail
		deleteCell(oldTailCoords);
	}
	else {
		snakeLength++;
		ateTheApple = false;
		// Only replace the eaten apple if it was the last one
		if (apples.length == 0){
			addAnApple();
		}
	}
	drawCell(newHeadCoords);	
}

function addAnApple(){
	var theNewApple;
	var goodCoords = false;
	while (!goodCoords){
		var appleX = Math.floor(Math.random() * gridWidth);
		var appleY = Math.floor(Math.random() * gridHeight);
		// Check that the apple is not inside the snake.
		var hitTheSnake = false;
		for(let i = 0; i < snakeLength && !hitTheSnake; i++) {
			var bodySegmentCoords = snakeBodyCoords[i];
			hitTheSnake = hitTheSnake || (appleX == bodySegmentCoords.x &&  appleY == bodySegmentCoords.y);
		}
		goodCoords = !hitTheSnake;
		// Check we're not duplicating an existing apple, either.
		if (goodCoords){
			for (let i=0; i<apples.length && goodCoords; i++){
				goodCoords = goodCoords && !(appleX == apples[i].x && appleY == apples[i].y);
			}
		}
	}

	if (Math.random() < chanceOfPurpleApple){
		// Purple!
		theNewApple = {x: appleX, y: appleY, colour: purpleAppleColour, value: purpleAppleValue, framesUntilExpiry: purpleAppleTimeToLive};
	}
	else if (Math.random() < chanceOfGoldenApple + chanceOfPurpleApple){
		// Golden!
		theNewApple = {x: appleX, y: appleY, colour: goldenAppleColour, value: goldenAppleValue, framesUntilExpiry: goldenAppleTimeToLive};
	}
	else {
		theNewApple = {x: appleX, y: appleY, colour: normalAppleColour, value: normalAppleValue, framesUntilExpiry: normalAppleTimeToLive};
	}
	apples.push(theNewApple);
	drawCell(theNewApple);
	ateTheApple = false;
	console.log('Apple added at '+theNewApple.x+', '+theNewApple.y);
}

function showStartMessage(){
	startMessageDiv.style.visibility='visible';
}

function hideStartMessage(){
	startMessageDiv.style.visibility='hidden';
}