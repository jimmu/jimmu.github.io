require(["libs/d3v3min"
       , "circleData"
       , "whimsy"]
,
function(d3, circles, whim){
  // The numeric ranges here are kind of arbitrary, 
  // as the actual display size will be scaled
  // when we do the rendering.
  // So really they're just setting proportions.
  var circleDataGenerator = circles()
                            .numCircles(25)
                            .width(150)
                            .height(100)
                            .startRadius(8)
                            .endRadius(1)
                            .startPoint(8, 83)
                            .endPoint(90, 99)
                            .controlPoint(140, 0)
                            .startColour(192, 16, 16)
                            .endColour(192, 192, 16)
  // These are actual pixel sizes.
  var whimthing=whim()
                .width(window.innerWidth)
                .height(window.innerHeight)
                .x(function(d){return d.x})
                .y(function(d){return d.y})
                .r(function(d){return d.r})
                .fill(function(d){return d.colour});

  d3.selectAll(".container")
    .datum(circleDataGenerator())
    .call(whimthing);
});
