// A reusable d3 version of the visual whimsy
define(["libs/d3v3min"
       ,"bezier"
       ]
,function(d3, bezier) {
  return function(){
    var width=window.innerWidth;
    var height=window.innerHeight;
    var numCircles=25;

    function drawTheWhimsy(selection){
      selection.each(function(data,i){

function createCircleData(){
		var minRadius = 1;
		var maxRadius = 70;
		var minX = minRadius;
		var minY = minRadius;
		//var minX = 0;
		//var minY = 0;
		var maxX = width-maxRadius;
		var maxY = height-maxRadius;
		//var maxX = 150;
		//var maxY = 100;
		// Don't use values below 16. That is, stay in double digit hex numbers.
		var startColour = {"red":16, "green":128, "blue":30};
		var endColour = {"red":255, "green":128, "blue":30};

		var radiusRange = maxRadius-minRadius;
		var circleData = [];
		// Place the circles along a simple Bezier curve
		// Use a point half way along the top as the control point.
		var controlX = maxX*0.75;
		var controlY = minRadius;
		//var controlX = maxX/2;
		//var controlY = minY
		var bezierCalcX = bezier(minX, maxX, controlX, numCircles);
		var bezierCalcY = bezier(minY, maxY, controlY, numCircles);


		for (var i=1; i<=numCircles; i++){
		  var red=Math.floor((startColour.red+i*(endColour.red-startColour.red)/numCircles)).toString(16);
		  var green=Math.floor((startColour.green+i*(endColour.green-startColour.green)/numCircles)).toString(16);
		  var blue=Math.floor((startColour.blue+i*(endColour.blue-startColour.blue)/numCircles)).toString(16);
		  var colour="#"+red+green+blue;
		  var thisCircle = {"cx": bezierCalcX()
				, "cy": bezierCalcY()
				, "r": minRadius + i*radiusRange/numCircles
				, "colour": colour
				};
		  circleData.push(thisCircle);
		}
		return circleData;
	}

        var svg=d3.select(this).append("svg")
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

      });
    }
    return drawTheWhimsy;
  }
})

