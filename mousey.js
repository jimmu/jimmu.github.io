require(["libs/d3v3min"]
,
function(d3){

    var width=window.innerWidth;
    var height=window.innerHeight;

	var data = [];
	
    var svg=d3.select(".container").append("svg")
		.attr("width", width)
		.attr("height", height);

		
	var circleGroup = svg.append("g");
	svg.on("mousemove", mousemove);
	//svg.on("touchmove", touchmove);
	//svg.on("touchstart", touchmove);
	//window.addEventListener('touchmove', touchmove, false);

	var previousX;
	var previousY;
	var renderer = addCircle;
	var rndm = Math.random();
	if (rndm > 0.25){renderer = drawTo};
	if (rndm > 0.50){renderer = boxTo};
	if (rndm > 0.75){renderer = throwCircle};
	
	function touchmove(e){
		var coords = getTouchPos(e);
		addCircle(coords.x, coords.y);
		addCircle(x, y);
		event.preventDefault();
	}
	
	function mousemove(){
		var coordinates = [0, 0];
		coordinates = d3.mouse(svg.node());
		var x = coordinates[0];
		var y = coordinates[1];
		renderer(x, y);
		//drawTo(x, y);
		//boxTo(x,y);		
	}	
	
	function getTouchPos(e) {
        if (!e){
			var e = event;
		}
		
        if (e.touches) {
            if (e.touches.length == 1) { // Only deal with one finger
                var touch = e.touches[0]; // Get the information for finger #1
                return {"x": touch.pageX-touch.target.offsetLeft,
                        "y": touchY=touch.pageY-touch.target.offsetTop
				}
            }
        }
	}
		
	function addCircle(x, y){
		var speed = getSpeed(x, y);
		radius = Math.max(4, 20-speed.speed);
		
		// Add a circle at the current mouse coords.
		var thisCircle = {"x": x
		  , "y": y
		  , "r": radius
		  , "colour": "#ff8822"
		};
		data.push(thisCircle);
		
		var circles = circleGroup.selectAll("circle")
				.data(data)
				.enter()
				.append("circle");
		circles.attr("cx", function(d){return d.x})
			.attr("cy", function(d){return d.y})
			.attr("r", 0.5)
			.attr("fill", function(d){return d.colour})
			.transition().attr("r", function(d){return d.r + (Math.random()*4)}).duration(1500)//.ease("easeElasticOut")
			.transition().delay(5000).
							style("opacity", "0")							
							.duration(10000)
							.each("end", function(d, i){
								data.splice(0, 1);	//Assumption that the oldest circles end their transitions first.
							}).remove();
	}

	function drawTo(x, y){
		var speed = getSpeed(x, y);
		lineWidth = Math.max(4, 30-speed.speed);
		
		// Add a line segment to the current mouse coords.
		var thisLine = {"x1": x-speed.xDiff
						,"x2": x 
						,"y1": y-speed.yDiff 
						,"y2": y 
						,"thickness": lineWidth
						, "colour": "#ff8822"
						};
		data.push(thisLine);
		
		var lines = circleGroup.selectAll("line")
				.data(data)
				.enter()
				.append("line");
		lines.attr("x1", function(d){return d.x1})
			.attr("x2", function(d){return d.x2})
			.attr("y1", function(d){return d.y1})
			.attr("y2", function(d){return d.y2})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d){return d.colour})
			.attr("stroke-linecap", "round")
			.transition().attr("stroke-width", function(d){return d.thickness}).duration(1500)
			.transition().delay(1000).duration(0000).ease("quad-in")
			.attr("y1", height/2)
			.attr("x1", width/2)
			.attr("x2", width/2)
			.attr("y2", height/2)
			.attr("stroke-width", 0)
			.style("opacity", "0")							
							.duration(10000)
							.each("end", function(d, i){
								data.splice(0, 1);	//Assumption that the oldest lines end their transitions first.
							}).remove();
	}

	function boxTo(x, y){
		var speed = getSpeed(x, y);
		// The faster we're moving, the smaller the circle we'll draw.
		// But make this a bit more sophisticated.
		lineWidth = Math.max(1, (20-speed.speed)/2);
		//console.log(x+","+y);
		// Add a rectangle to the current mouse coords.
		var thisRect = {"x": Math.min(x, x-speed.xDiff)
						,"y": Math.min(y, y-speed.yDiff) 
						,"width": Math.abs(speed.xDiff)
						,"height": Math.abs(speed.yDiff) 
						,"thickness": lineWidth
						, "colour": "#ff8822"
						};
		data.push(thisRect);
		
		var boxes = circleGroup.selectAll("rect")
				.data(data)
				.enter()
				.append("rect");
		boxes.attr("x", function(d){return d.x})
			.attr("y", function(d){return d.y})
			.attr("width", function(d){return d.width})
			.attr("height", function(d){return d.height})
			.attr("stroke-width", 0.5)
			.attr("stroke", function(d){return d.colour})
			.attr("fill", "none")
			.transition().attr("stroke-width", function(d){return d.thickness}).duration(1500)//.ease("elastic-out")
			.transition().delay(1000).duration(10000)
			.attr("y", height)
			.attr("x", x/2+width/4)
			.attr("width", 0)
			.attr("height", 0)
			.style("opacity", "0")							
							.duration(10000)
							.each("end", function(d, i){
								data.splice(0, 1);	//Assumption that the oldest boxes end their transitions first.
							}).remove();			
	}

	function throwCircle(x, y){
		var speed = getSpeed(x, y);
		// The faster we're moving, the smaller the circle we'll draw.
		// But make this a bit more sophisticated.
		radius = Math.max(4, 20-speed.speed);
		
		//console.log(x+","+y);
		// Add a circle at the current mouse coords.
		var thisCircle = {"x": x
		  , "y": y
		  , "r": radius
		  , "colour": "#ff8822"
		  , "xSpeed" : speed.xDiff
		  , "ySpeed" : speed.yDiff
		};
		data.push(thisCircle);
		
		var circles = circleGroup.selectAll("circle")
				.data(data)
				.enter()
				.append("circle");
		circles.attr("cx", function(d){return d.x})
			.attr("cy", function(d){return d.y})
			.attr("r", function(d){return d.r})
			.attr("fill", function(d){return d.colour})
			.transition().duration(15000)
			.ease("quad-out")
			.attr("cx", function(d){return d.x + (25*d.xSpeed)})
			.attr("cy", function(d){return d.y + (25*d.ySpeed)})
			.style("opacity", "0")							
					.each("end", function(d, i){
						data.splice(0, 1);	//Assumption that the oldest circles end their transitions first.
					}).remove();
	}

	function getSpeed(x, y){
		if (! previousX){
			previousX = x;
			previousY = y;
		}
		var xDiff = x-previousX;
		var yDiff = y-previousY;
		var speed = ((xDiff*xDiff)+(yDiff*yDiff)); // The square of the distance between successive points.
		previousX = x;
		previousY = y;		
		return {"speed": Math.sqrt(speed), "xDiff" : xDiff, "yDiff" : yDiff};
	}
});
