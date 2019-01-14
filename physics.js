require(["simpleWorld", "simpleShapeFactory"]
,
function(simpleWorld, simpleShapeFactory){
	"use strict";
		
	var world = simpleWorld("canvas");	
	var shapeFactory = simpleShapeFactory(world);
	
	for (var i=0; i<50; i++){
		shapeFactory.createCircle(0.1+Math.random()/2.5, 1+9*Math.random(), 2*Math.random(), 0);
		shapeFactory.createBox(0.1+1.5*Math.random(), 0.1+Math.random(), 1+9*Math.random(), 2*Math.random(), Math.PI*Math.random());
	}
});
