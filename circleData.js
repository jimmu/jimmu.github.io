define (["spline"
       , "interpolate"
       , "colourInterpolate"
       ]
,
function createCircleData(spline, interpolate, colourInterpolate){
  return function(){
    var numCircles = 25; // All the below are defaults
    var startRadius = 1; // They're all settable + gettable.
    var endRadius = 8;
    var width = 150;
    var height = 100;
    var start = {"x": startRadius, "y": startRadius}
    var end = {"x": width-endRadius, "y": height-endRadius}
    var control = {"x": end.x*0.75, "y": startRadius}
    var startColour = {"red":16, "green":128, "blue":30};
    var endColour = {"red":255, "green":128, "blue":30};
    var startHoverColour = {"red":30, "green":128, "blue":16};
    var endHoverColour = {"red":30, "green":128, "blue":255};
    
    function generateData(){
      var radiusRange = interpolate(startRadius, endRadius, numCircles);
      var colourRange = colourInterpolate(startColour, endColour, numCircles);
      var hoverColourRange = colourInterpolate(startHoverColour, endHoverColour, numCircles);

      var circleData = [];
      // Place the circles along a simple spline curve
      var splineCalcX = spline(start.x, end.x, control.x, numCircles);
      var splineCalcY = spline(start.y, end.y, control.y, numCircles);

      for (var i=1; i<=numCircles; i++){
	var thisCircle = {"x": splineCalcX()
		      , "y": splineCalcY()
		      , "r": radiusRange.next()
		      , "colour": colourRange.next()
                      , "hoverColour": hoverColourRange.next()
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

    generateData.startHoverColour = function(r,g,b){
      if(!arguments.length) return startHoverColour;
      startHoverColour = {"red": r, "green": g, "blue": b};
      return generateData;
    }

    generateData.endHoverColour = function(r,g,b){
      if(!arguments.length) return endHoverColour;
      endHoverColour = {"red": r, "green": g, "blue": b};
      return generateData;
    }

    return generateData;
  }
});
