define (["spline"
       , "interpolate"]
,
function createCircleData(spline, interpolate){
  return function(){
    var numCircles = 25; // All the below are defaults
    var startRadius = 1; // They're all settable + gettable.
    var endRadius = 8;
    var width = 150;
    var height = 100;
    var start = {"x": startRadius, "y": startRadius}
    var end = {"x": width-endRadius, "y": height-endRadius}
    var control = {"x": end.x*0.75, "y": startRadius}
    // Don't use values below 16. That is, stay in double digit hex numbers.
    var startColour = {"red":16, "green":128, "blue":30};
    var endColour = {"red":255, "green":128, "blue":30};
    
    function generateData(){
      var redRange = interpolate(startColour.red, endColour.red, numCircles);
      var greenRange = interpolate(startColour.green, endColour.green, numCircles);
      var blueRange = interpolate(startColour.blue, endColour.blue, numCircles);
      var radiusRange = interpolate(startRadius, endRadius, numCircles);

      var circleData = [];
      // Place the circles along a simple spline curve
      // Use a point half way along the top as the control point.
      var splineCalcX = spline(start.x, end.x, control.x, numCircles);
      var splineCalcY = spline(start.y, end.y, control.y, numCircles);

      for (var i=1; i<=numCircles; i++){
	var red=Math.floor(redRange.next()).toString(16);
	var green=Math.floor(greenRange.next()).toString(16);
	var blue=Math.floor(blueRange.next()).toString(16);
	var colour="#"+red+green+blue;
	var thisCircle = {"x": splineCalcX()
		      , "y": splineCalcY()
		      , "r": radiusRange.next()
		      , "colour": colour
		      };
	circleData.push(thisCircle);
      }
      return circleData;
    }

    generateData.width = function(value){
      if (!arguments.length) return width;
      width = value;
      return generateData;
    }

    generateData.height = function(value){
      if (!arguments.length) return height;
      height = value;
      return generateData;
    }

    generateData.startRadius = function(value){
      if (!arguments.length) return startRadius;
      startRadius = value;
      return generateData;
    }

    generateData.endRadius = function(value){
      if (!arguments.length) return endRadius;
      endRadius = value;
      return generateData;
    }

    generateData.numCircles = function(value){
      if (!arguments.length) return numCircles;
      numCircles = value;
      return generateData;
    }
    
    generateData.startPoint = function(x,y){
      if(!arguments.length) return start;
      start = {"x": x, "y": y};
      return generateData;
    }

    generateData.endPoint = function(x,y){
      if(!arguments.length) return end;
      end = {"x": x, "y": y};
      return generateData;
    }

    generateData.controlPoint = function(x,y){
      if(!arguments.length) return control;
      control = {"x": x, "y": y}
      return generateData;
    }

    generateData.startColour = function(r,g,b){
      if(!arguments.length) return startColour;
      startColour = {"red": r, "green": g, "blue": b};
      return generateData;
    }

    generateData.endColour = function(r,g,b){
      if(!arguments.length) return endColour;
      endColour = {"red": r, "green": g, "blue": b};
      return generateData;
    }

    return generateData;
  }
});
