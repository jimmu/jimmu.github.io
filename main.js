require(["libs/d3v3min"
       , "circleData"
       , "circleDrawer"]
,
function(d3, circles, renderer){
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
                            .startHoverColour(128, 16, 128)
                            .endHoverColour(16, 192, 128)

  var circleData = circleDataGenerator();
  // Now add another set of circles. Identical apart from the position of the control point.
  circleDataGenerator.controlPoint(80,80);
  circleData = circleData.concat(circleDataGenerator());

  // These are actual pixel sizes.
  var rendererThing=renderer()
                .width(window.innerWidth-30)
                .height(window.innerHeight-30)
                .x(function(d){return d.x})
                .y(function(d){return d.y})
                .r(function(d){return d.r})
                .fill(function(d){return d.colour})
                .handle("mouseover", mouseover)
                .handle("mouseout", mouseout)
				.handle("click", click)

  function mouseover(d){
    var me = d3.select(this);
    if (!me.attr("originalR")){
      me.attr("originalR", me.attr("r"));
    }
    animate(me, me.attr("originalR")*1.4, d.hoverColour);
  }

  function mouseout(d){
     var me = d3.select(this);
     if (me.attr("originalR")){
       animate(me, me.attr("originalR"), d.colour);
     }
  }

  function click(d){
	  window.location.href = "index2.html";
  }
  
  function animate(me, newR, newFill){
     me.transition()
       .attr("r", newR)
       .attr("fill", newFill)
  }

  d3.selectAll(".container")
    .datum(circleData)
    .call(rendererThing);

});
