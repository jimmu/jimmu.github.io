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

	var previousX;
	var previousY;
	
	function mousemove(){
		var coordinates = [0, 0];
		coordinates = d3.mouse(svg.node());
		var x = coordinates[0];
		var y = coordinates[1];
		
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
	
});
