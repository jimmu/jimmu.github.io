var gridWidth = 20;
var gridHeight = 20;
var cellWidthInPixels = 25;
var framesPerSecond = 5;
var chanceOfGoldenApple = 1/10;

var snakeBodyColour = "green";
var normalAppleColour = "red";
var goldenAppleColour = "gold";
var normalAppleValue = 1;
var goldenAppleValue = 5;
var gridLineColour = "gray";

var gameDiv = document.getElementById("gameDiv");
var startMessageDiv = document.getElementById("replay");
var scoreSpan = document.getElementById("scores");
var gridCells;
var snakeBodyCoords;
var appleCoords;
var snakeDirection;
var nextDirections;
var snakeLength;
var svg;
var gameInProgress;
var ateTheApple;
var score;
var highScore;
var appleValue;
var appleFramesUntilExpiry;

init();

function gameLoop(){
	// this will check the snake repeatedly
	if (gameInProgress){
		updateSnakePosition();		
		checkCollisions();		
		redrawScore();
	}
}

function init(){
	console.log('Hello from init');
	createGridCells();
	nextDirections = [];
	document.addEventListener("keydown", checkKeypress);
	
	score = 0;
	highScore = 0;
	redrawScore();
	gameInProgress = false;
	setInterval(gameLoop, 1000/framesPerSecond);
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

function createGridCells(){
	console.log("Creating cereal sized pixels");
	svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute ("width", gridWidth * cellWidthInPixels );
	svg.setAttribute ("height", gridHeight * cellWidthInPixels );
	gameDiv.appendChild(svg);

	gridCells = new Array(gridHeight);
    for(let y = 0; y < gridHeight; y++) {
		var thisRow = new Array(gridWidth);
		for (let x = 0; x < gridWidth; x++){
			var square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			square.setAttribute("x", x * cellWidthInPixels);
			square.setAttribute("y", y * cellWidthInPixels);
			square.setAttribute("width", cellWidthInPixels);
			square.setAttribute("height", cellWidthInPixels);
			square.setAttribute("fill", "none");
			square.setAttribute("stroke", gridLineColour);
			square.setAttribute("stroke-width", 1);
			thisRow[x]=square;
			svg.appendChild(square);
		}
        gridCells[y]=thisRow;
    }
}

function checkKeypress(e){
	console.log('Keypress '+e.keyCode);
	var latestDirection;
	if (nextDirections.length == 0){
		latestDirection = snakeDirection;
	}
	else {
		latestDirection = nextDirections[nextDirections.length-1];
	}
	
	if (latestDirection == "up" || latestDirection == "down"){
		if (e.keyCode == 37){
			nextDirections.push("left");
		}		
		else if (e.keyCode == 39){
			nextDirections.push("right");
		}
	}
	else if (latestDirection == "left" || latestDirection == "right"){
		if (e.keyCode == 38){
			nextDirections.push("up");
		}		
		else if (e.keyCode == 40){
			nextDirections.push("down");
		}
	}
	
	if (!gameInProgress){
		if (e.keyCode == 32){
			startNewGame();
		}
	}
	console.log('Next directions are '+nextDirections);
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
	if (appleFramesUntilExpiry > 0){
		if (headCoords.x == appleCoords.x && headCoords.y == appleCoords.y){
			ateTheApple = true;
			score = score + appleValue;
			if (score > highScore){
				highScore = score;
			}
			console.log('Ate the apple! Score: ' + score);
		}
		appleFramesUntilExpiry--;
		if (appleFramesUntilExpiry == 0 && appleValue > normalAppleValue){
			appleValue = normalAppleValue;
			drawCell({x: appleCoords.x, y: appleCoords.y, colour: normalAppleColour});
			appleFramesUntilExpiry = gridWidth * gridHeight;
		}
	}
}

function redrawScore(){
	while(scoreSpan.firstChild) {
		scoreSpan.removeChild( scoreSpan.firstChild );
	}
	scoreSpan.appendChild(document.createTextNode('Score: ' + score + ' High Score: ' + highScore));
}

function stop(){
	gameInProgress = false;
	showStartMessage();
}

function drawCell(coords){
	var colourToUse = snakeBodyColour;
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
		addAnApple();
	}
	drawCell(newHeadCoords);	
}

function addAnApple(){
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
	}

	
	if (Math.random() > 1-chanceOfGoldenApple){
		// Golden!
		appleCoords = {x: appleX, y: appleY, colour: goldenAppleColour};
		appleValue = goldenAppleValue;
		appleFramesUntilExpiry = gridWidth;
		//setTimeout(function(){
		//	// Do this stuff when the time runs out
		//	console.log("Delete the golden apple");
		//	appleValue = 1;
		//	drawCell({x: appleCoords.x, y: appleCoords.y, colour: normalAppleColour});
		//}, 1000 * gridWidth/framesPerSecond);		
	}
	else {
		appleCoords = {x: appleX, y: appleY, colour: normalAppleColour};
		appleValue = normalAppleValue;
		appleFramesUntilExpiry = gridWidth*gridHeight;
	}
	drawCell(appleCoords);
	ateTheApple = false;
	console.log('Apple added at '+appleX+', '+appleY);
}

function showStartMessage(){
	startMessageDiv.style.visibility='visible';
}

function hideStartMessage(){
	startMessageDiv.style.visibility='hidden';
}