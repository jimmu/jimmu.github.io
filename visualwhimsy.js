var width=window.innerWidth;
var height=window.innerHeight;
var numCircles=25;


function createCircleData(){
	var minRadius = 1;
	var maxRadius = 70;
	var minX = minRadius;
	var minY = minRadius;
        var maxX = width-maxRadius;
	var maxY = height-maxRadius;

	var radiusRange = maxRadius-minRadius;
	var circleData = [];
	// Place the circles along a simple Bezier curve
	// Use a point half way along the top as the control point.
	var controlX = maxX/2;
	var controlY = minRadius;
	for (var i=1; i<=numCircles; i++){
	  var x1=minX+i*(controlX-minX)/numCircles;
	  var y1=controlY;
	  var x2=maxX;
	  var y2=controlY+i*(maxY-controlY)/numCircles;
	  // So we're interpolating along x1,y1 -> x2,y2 rather than the main diagonal.
	
	  var thisCircle = {"cx": x1 + i*(x2-x1)/numCircles
			, "cy": y1 + i*(y2-y1)/numCircles
			, "r": minRadius + i*radiusRange/numCircles
			, "colour": "black"
			};
	  circleData.push(thisCircle);
	}
	return circleData;
}

var svg=d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var circleGroup = svg.append("g");

var circles = circleGroup.selectAll("circle")
		.data(createCircleData())
		.enter()
		.append("circle");

circles.attr("cx", function(d){return d.cx})
	.attr("cy", function(d){return d.cy})
	.attr("r", function(d){return d.r})
	.attr("fill", function(d){return d.colour});
