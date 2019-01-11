define(
function() {
  return function(){
	"use strict";  
    // Take in a position, size, angle - in box2d units.
	// Create something which can be manipluated as a box2d object and can render itself as graphics.
	// Create a box               
	var pixelsPerMeter = 100;

	var	b2Vec2		= Box2D.Common.Math.b2Vec2,
	b2BodyDef	= Box2D.Dynamics.b2BodyDef,
	b2Body		= Box2D.Dynamics.b2Body,
	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2World		= Box2D.Dynamics.b2World,
	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape;
	b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape;


	return {
		getFixtureDefinition: function(width, height){
			var boxFixtureDefn = new b2FixtureDef();	// box  fixture definition. Can be used on multiple bodies.
			boxFixtureDefn.shape = new b2PolygonShape();
			boxFixtureDefn.density = 1;
			boxFixtureDefn.restitution = 0.225;	// make it bouncy
			boxFixtureDefn.friction = 0.25;
			boxFixtureDefn.shape.SetAsBox(width/2, height/2);
			return boxFixtureDefn;
		},
		getSprite(width, height){
			var image = new Sprite(width, height);
			// Offset x,y so that the centre of this image is at the top left of another sprite that this will be added to. Do this in the shape factory?
			image.x = -(pixelsPerMeter * width)/2;
			image.y = -(pixelsPerMeter * height)/2;
			image.graphics.lineStyle(3, 0xff8800);
			image.graphics.beginFill(0xff8800);
			image.graphics.drawRect(0, 0, pixelsPerMeter * width, pixelsPerMeter * height);
			return image;
		}
	};
  }
})
