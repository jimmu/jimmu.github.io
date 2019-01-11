require(["simpleWorld", "simpleShapeFactory"]
,
function(simpleWorld, simpleShapeFactory){
	"use strict";
	
	var stage = new Stage("canvas");
	var world = simpleWorld(stage);	
	var shapeFactory = simpleShapeFactory(world, stage);

	
	for (var i=0; i<50; i++){
		shapeFactory.createCircle(0.1+Math.random()/2, 1+9*Math.random(), 2*Math.random(), 0);
		shapeFactory.createBox(0.1+2*Math.random(), 0.1+Math.random(), 1+9*Math.random(), 2*Math.random(), Math.PI*Math.random());
	}
});
