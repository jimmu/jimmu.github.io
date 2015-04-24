var width=600;
var height=500;
var numCircles=20;


function createCircleData(){
	var maxRadius = 50;
        var maxX = width-maxRadius;
	var maxY = height-maxRadius;

	var circleData = [];
	for (var i=1; i<=numCircles; i++){
	  var thisCircle = {"cx": i*maxX/numCircles
			, "cy": i*maxY/numCircles
			, "r": i*maxRadius/numCircles
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
