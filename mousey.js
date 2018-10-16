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
	svg.node().addEventListener('touchmove', touchmove, false);

	var previousX;
	var previousY;
	var renderer = addCircle;
	if (Math.random() > 0.33){
		renderer = drawTo;
		if (Math.random() > 0.5){
			renderer = boxTo;
		}
	}
	
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
		if (! previousX){
			previousX = x;
			previousY = y;
		}
		var speed = ((x-previousX)*(x-previousX))+((y-previousY)*(y-previousY)); // The square of the distance between successive points.
		speed = Math.sqrt(speed);
		//console.log(speed);
		// The faster we're moving, the smaller the circle we'll draw.
		// But make this a bit more sophisticated.
		radius = Math.max(4, 20-speed);
		
		//console.log(x+","+y);
		// Add a circle at the current mouse coords.
		var thisCircle = {"x": x
		  , "y": y
		  , "r": radius
		  , "colour": "#ff8822"
		  , "hoverColour": "#2288ff"
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
			
		previousX = x;
		previousY = y;		
	}

	function drawTo(x, y){
		if (! previousX){
			previousX = x;
			previousY = y;
		}
		var speed = ((x-previousX)*(x-previousX))+((y-previousY)*(y-previousY)); // The square of the distance between successive points.
		speed = Math.sqrt(speed);
		//console.log(speed);
		// The faster we're moving, the smaller the circle we'll draw.
		// But make this a bit more sophisticated.
		lineWidth = Math.max(4, 20-speed);
		
		//console.log(x+","+y);
		// Add a line segment to the current mouse coords.
		var thisLine = {"x1": previousX
						,"x2": x 
						,"y1": previousY 
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
			.transition().attr("stroke-width", function(d){return d.thickness}).duration(1500)//.ease("easeElasticOut")
			.transition().delay(1000).duration(0000)
			.attr("y1", height/2)
			.attr("x1", width/2)
			.attr("x2", width/2)
			.attr("y2", height/2)
			.style("opacity", "0")							
							.duration(10000)
							.each("end", function(d, i){
								data.splice(0, 1);	//Assumption that the oldest lines end their transitions first.
							}).remove();
			
		previousX = x;
		previousY = y;		
	}

	function boxTo(x, y){
		if (! previousX){
			previousX = x;
			previousY = y;
		}
		var speed = ((x-previousX)*(x-previousX))+((y-previousY)*(y-previousY)); // The square of the distance between successive points.
		speed = Math.sqrt(speed);
		//console.log(speed);
		// The faster we're moving, the smaller the circle we'll draw.
		// But make this a bit more sophisticated.
		lineWidth = Math.max(1, (20-speed)/2);
		//console.log(x+","+y);
		// Add a rectangle to the current mouse coords.
		var thisRect = {"x": Math.min(x, previousX)
						,"y": Math.min(y, previousY) 
						,"width": Math.abs(x-previousX)
						,"height": Math.abs(y-previousY) 
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
			.transition().attr("stroke-width", function(d){return d.thickness}).duration(1500)//.ease("easeElasticOut")
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
			
		previousX = x;
		previousY = y;		
	}
		
});
