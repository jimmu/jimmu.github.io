define(["simpleShape", "simpleBoxFactory", "simpleCircleFactory"],
function(simpleShape, simpleBoxFactory, simpleCircleFactory) {
  return function(world, stage){
	"use strict";  

	var pixelsPerMeter = 100;
	var	b2Vec2		= Box2D.Common.Math.b2Vec2,
	b2BodyDef	= Box2D.Dynamics.b2BodyDef,
	b2Body		= Box2D.Dynamics.b2Body,
	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
	b2World		= Box2D.Dynamics.b2World,
	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape;

	var boxFactory = simpleBoxFactory();
	var circleFactory = simpleCircleFactory();
	
	function createSomething(fixtureDefinition, image, xPos, yPos, angle){
			var body = createBody(xPos, yPos, angle);
			body.CreateFixture(fixtureDefinition);
			var containerImage = new Sprite();
			containerImage.addChild(image);
			var shape = simpleShape(body, containerImage);
			addMouseHandlers(shape);
			stage.addChild(containerImage);
			world.addShape(shape);
			return shape;		
	}
	
	function createBody(xPos, yPos, angle){
		var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.Set(xPos, yPos);
		bodyDef.angle = angle;
		return world.createBody(bodyDef);
	}
	
	function addMouseHandlers(shape){
		var image = shape.getImage();
		image.addEventListener(MouseEvent.MOUSE_MOVE, function(e){console.log("moved")});
		image.addEventListener(MouseEvent.MOUSE_DOWN, function(e){console.log("clicked")});
		image.addEventListener(MouseEvent.MOUSE_UP, function(e){console.log("released")});
		//image.addEventListener(MouseEvent.MOUSE_OVER, function(e){console.log("mouse over")});
		image.addEventListener(MouseEvent.MOUSE_OUT, function(e){console.log("mouse out")});
		var body = shape.getBody();
		image.addEventListener(MouseEvent.MOUSE_OVER, function(e){console.log("mouse over");
			var localCoordX = image.mouseX/pixelsPerMeter;
			var localCoordY = image.mouseY/pixelsPerMeter;
			var newWorldX = body.GetPosition().x + localCoordX;
			var newWorldY = body.GetPosition().y + localCoordY;
			body.ApplyImpulse(world.getMouseVelocity(), new b2Vec2(newWorldX, newWorldY));
			// That impulse thing doesn't account for the body having rotated!
			// If a box has flipped over upside down, the impulse will look like it's being applied at the wrong place.
		});
	}

	return {
		createBox: function(width, height, xPos, yPos, angle){
			return createSomething(boxFactory.getFixtureDefinition(width, height), boxFactory.getSprite(width, height), xPos, yPos, angle);
		},
		createCircle: function(radius, xPos, yPos, angle){
			return createSomething(circleFactory.getFixtureDefinition(radius), circleFactory.getSprite(radius), xPos, yPos, angle);
		}
		
	};
	
	}
})
