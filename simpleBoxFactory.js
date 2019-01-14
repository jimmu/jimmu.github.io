define(
function() {
  return function(){
	"use strict";  
	// Create a box as a fixture for the physical model and as a graphic.
	var	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape;

	return {
		getFixtureDefinition: function(width, height){	// Width and height in meters
			var boxFixtureDefn = new b2FixtureDef();
			boxFixtureDefn.shape = new b2PolygonShape();
			boxFixtureDefn.density = 1;
			boxFixtureDefn.restitution = 0.225;	// make it bouncy
			boxFixtureDefn.friction = 0.25;
			boxFixtureDefn.shape.SetAsBox(width/2, height/2);
			return boxFixtureDefn;
		},
		getSprite(width, height){	// Width and height in pixels
			var image = new Sprite(width, height);
			// Offset x,y so that the centre of this image is at the top left of another sprite that this will be added to. Do this in the shape factory?
			image.x = -width/2;
			image.y = -height/2;
			image.graphics.lineStyle(3, 0xff8800);
			image.graphics.beginFill(0xff8800);
			image.graphics.drawRect(0, 0, width, height);
			return image;
		}
	};
  }
})
