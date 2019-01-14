define(
function() {
  return function(){
	"use strict";  
	// Create a circle as a fixture for the physical model and as a graphic.
	var	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape;

	var	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape;


	return {
		getFixtureDefinition: function(radius){	
			var circleFixtureDefn = new b2FixtureDef();
			circleFixtureDefn.shape = new b2CircleShape();
			circleFixtureDefn.density = 1;
			circleFixtureDefn.restitution = 0.6;	// make it bouncy
			circleFixtureDefn.friction = 0.75;
			circleFixtureDefn.shape.SetRadius(radius);
			return circleFixtureDefn;
		},
		getSprite(radius){
			var image = new Sprite();
			// Offset x,y so that the centre of this image is at the top left of another sprite that this will be added to. Do this in the shape factory?
			image.x = -radius;
			image.y = -radius;
			image.graphics.lineStyle(3, 0xff8800);
			image.graphics.beginFill(0xff8800);
			image.graphics.drawCircle(radius, radius, radius);
			return image;
		}
	};
  }
})
