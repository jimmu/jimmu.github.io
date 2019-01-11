define(
function() {
  return function(){
	"use strict";  
    // Take in a position, size, angle - in box2d units.
	// Create something which can be manipluated as a box2d object and can render itself as graphics.
	// Create a circle               
	var pixelsPerMeter = 100;

	var	b2Vec2		= Box2D.Common.Math.b2Vec2,
	b2BodyDef	= Box2D.Dynamics.b2BodyDef,
	b2Body		= Box2D.Dynamics.b2Body,
	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2World		= Box2D.Dynamics.b2World,
	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape;
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
			image.x = -(pixelsPerMeter * radius);
			image.y = -(pixelsPerMeter * radius);
			image.graphics.lineStyle(3, 0xff8800);
			image.graphics.beginFill(0xff8800);
			image.graphics.drawCircle(pixelsPerMeter * radius, pixelsPerMeter * radius, pixelsPerMeter * radius);
			return image;
		}
	};
  }
})
