var circleData = [];

for (var i=0; i<10; i++){
  var thisCircle = {"cx": i*10, "cy": i*20, "r": i*4, "colour": "black"};
  circleData.push(thisCircle);
}

var svg=d3.select("body").append("svg")
	.attr("width", 500)
	.attr("height", 500);

var circleGroup = svg.append("g");

var circles = circleGroup.selectAll("circle")
		.data(circleData)
		.enter()
		.append("circle");

circles.attr("cx", function(d){return d.cx})
	.attr("cy", function(d){return d.cy})
	.attr("r", function(d){return d.r})
	.attr("fill", function(d){return d.colour});
