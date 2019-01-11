define(
function() {
	return function(stage){
		// Take in a position, size, angle - in box2d units.
		// Create something which can be manipluated as a box2d object and can render itself as graphics.
		// Create a box               
		var pixelsPerMeter = 100;
		var world;
		var objects = [];
		var previousMouseX;
		var previousMouseY;
		var mouseVelocity;
		
		var background = new Sprite();
		stage.addChild(background);

		var	b2Vec2		= Box2D.Common.Math.b2Vec2,
			b2BodyDef	= Box2D.Dynamics.b2BodyDef,
			b2Body		= Box2D.Dynamics.b2Body,
			b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
			b2World		= Box2D.Dynamics.b2World,
			b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape;
			b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape;

		// Create the world.
		var gravity = new b2Vec2(0, 10);
		world = new b2World(gravity, true);

		//
		var boxFixtureDefn = new b2FixtureDef();	// box  fixture definition. 
		boxFixtureDefn.shape = new b2PolygonShape();
		boxFixtureDefn.density = 1;

		var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_staticBody;

		// Create the ground
		var groundWidth = 20;
		var groundHeight = 0.5;
		boxFixtureDefn.shape.SetAsBox(groundWidth/2, groundHeight/2);
		bodyDef.position.Set(groundWidth/2, stage.stageHeight/pixelsPerMeter - 1);	// The position of a box in box2d is the position of its centre.
		var groundBody = world.CreateBody(bodyDef);
		groundBody.CreateFixture(boxFixtureDefn);
		// Image of the ground.
		var groundImage = new Sprite();
		groundImage.graphics.lineStyle(4, 0x444444);
		groundImage.graphics.beginFill(0x444444);
		groundImage.graphics.drawRect(0,0, pixelsPerMeter * groundWidth, pixelsPerMeter * groundHeight);
		stage.addChild(groundImage);
		groundImage.x = (pixelsPerMeter * groundBody.GetPosition().x) - (groundImage.width/2);
		groundImage.y = (pixelsPerMeter * groundBody.GetPosition().y) - (groundImage.height/2);
		// A wall at the left
		var leftWallFixtureDefn = new b2FixtureDef();
		leftWallFixtureDefn.shape = new b2PolygonShape();
		leftWallFixtureDefn.density = 1;
		var leftWallBodyDef = new b2BodyDef();
		leftWallBodyDef.type = b2Body.b2_staticBody;
		var leftWallWidth = 0.5;
		var leftWallHeight = 4;
		leftWallFixtureDefn.shape.SetAsBox(leftWallWidth/2, leftWallHeight/2);
		leftWallBodyDef.position.Set(0, stage.stageHeight/pixelsPerMeter - leftWallHeight + 1);	// The position of a box in box2d is the position of its centre.
		var leftWallBody = world.CreateBody(leftWallBodyDef);
		leftWallBody.CreateFixture(leftWallFixtureDefn);
		// Image of the left wall.
		var leftWallImage = new Sprite();
		leftWallImage.graphics.lineStyle(4, 0x444444);
		leftWallImage.graphics.beginFill(0x444444);
		leftWallImage.graphics.drawRect(0,0, pixelsPerMeter * leftWallWidth, pixelsPerMeter * leftWallHeight);
		stage.addChild(leftWallImage);
		leftWallImage.x = (pixelsPerMeter * leftWallBody.GetPosition().x) - (leftWallImage.width/2);
		leftWallImage.y = (pixelsPerMeter * leftWallBody.GetPosition().y) - (leftWallImage.height/2);

		// Put an event handler on the stage to record the mouse velocity.
		stage.addEventListener(MouseEvent.MOUSE_MOVE, function(e){
			var currentMouseX = stage.mouseX/pixelsPerMeter;
			var currentMouseY = stage.mouseY/pixelsPerMeter;
			if (previousMouseX){
				//console.log("Mouse coords: "+previousMouseX+", "+previousMouseY);
				mouseVelocity = new b2Vec2(10*(currentMouseX - previousMouseX), 10*(currentMouseY - previousMouseY));
			}
			previousMouseX = currentMouseX;
			previousMouseY = currentMouseY;
			//console.log(mouseVelocity);
		});

		stage.addEventListener(Event.ENTER_FRAME, onEnterFrame);

		console.log("simple world created");
			return {
				step: function(){
					world.Step(1/60, 4, 4);
					world.ClearForces();
				},
				createBody: function(bodyDefinition){
					return world.CreateBody(bodyDefinition);
				},
				getMouseVelocity(){
					return mouseVelocity;
				},
				addShape: function(shape){
					objects.push(shape);
				}
			}
		
		function onEnterFrame(e){
			physicsCalcs();
			for (const shape of objects){
				shape.draw();
			}
		}

		function physicsCalcs(){
			world.Step(1/60, 4, 4);
			world.ClearForces();
		}
	

	}
})

