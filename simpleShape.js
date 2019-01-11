define(
function() {
  return function(body, image){
	"use strict";  
	var pixelsPerMeter = 100;
	var body;
	var image;	// Contains an embedded image which is offset so that its centre is at the top left of this image.

	return {
		draw: function(){
			image.rotation = body.GetAngle()*180/Math.PI;
			// Image coordinates are the top left. Body coordinates are its centre.
			image.x = body.GetPosition().x * pixelsPerMeter;
			image.y = body.GetPosition().y * pixelsPerMeter;
		},
		getImage: function(){
			return image;
		},
		getBody: function(){
			return body;
		}
	};
  }
})

