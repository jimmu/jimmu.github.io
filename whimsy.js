// A reusable d3 version of the visual whimsy
define(["libs/d3v3min"
       ]
,function(d3) {
  return function(){
    var width=window.innerWidth;  // These can be overridden.
    var height=window.innerHeight;
    var xAccessor = function(d){return d.x};
    var yAccessor = function(d){return d.y};
    var rAccessor = function(d){return d.r};
    var fillAccessor = function(d){return d.colour};

    function drawTheWhimsy(selection){
      selection.each(function(data,i){
        var xScale = d3.scale.linear()
                       .range([0, width])
                       .domain([d3.min(data, function(d){return xAccessor(d)-rAccessor(d)}),
                                d3.max(data, function(d){return xAccessor(d)+rAccessor(d)})]);
        var yScale = d3.scale.linear()
                       .range([0, height])
                       .domain([d3.min(data, function(d){return yAccessor(d)-rAccessor(d)}),
                                d3.max(data, function(d){return yAccessor(d)+rAccessor(d)})]);
        // Make the radius scale linearly with the smaller dimension.
        var domainAccessor;
        var smallerDimension = Math.min(width, height);
        if (height === smallerDimension){
          domainAccessor = yAccessor;
        }
        else {
          domainAccessor = xAccessor;
        }
        var rScale = d3.scale.linear()
                       .range([0, smallerDimension])
                       .domain([0, d3.max(data, function(d){return domainAccessor(d)})]);

        var svg=d3.select(this).append("svg")
		.attr("width", width)
		.attr("height", height);
	var circleGroup = svg.append("g");
	var circles = circleGroup.selectAll("circle")
			.data(data)
			.enter()
			.append("circle");
	circles.attr("cx", function(d){return xScale(xAccessor(d))})
		.attr("cy", function(d){return yScale(yAccessor(d))})
		.attr("r", function(d){return rScale(rAccessor(d))})
		.attr("fill", function(d){return fillAccessor(d)})
                .on("mouseover", function(d){
                   d3.select(this).transition().attr("r", rScale(rAccessor(d))*1.4)
                 })
                .on("mouseout", function(d){
                   d3.select(this).transition().attr("r", rScale(rAccessor(d)))
                 })
      });
    }

    drawTheWhimsy.width =function(value){
      if (!arguments.length) return width;
      width = value;
      return drawTheWhimsy;
    }

    drawTheWhimsy.height =function(value){
      if (!arguments.length) return height;
      height = value;
      return drawTheWhimsy;
    }

    drawTheWhimsy.x = function(accessor){
      if (!arguments.length) return xAccessor;
      xAccessor = accessor;
      return drawTheWhimsy;
    }

    drawTheWhimsy.y = function(accessor){
      if (!arguments.length) return yAccessor;
      yAccessor = accessor;
      return drawTheWhimsy;
    }

    drawTheWhimsy.r = function(accessor){
      if (!arguments.length) return rAccessor;
      rAccessor = accessor;
      return drawTheWhimsy;
    }

    drawTheWhimsy.fill = function(accessor){
      if (!arguments.length) return fillAccessor;
      fillAccessor = accessor;
      return drawTheWhimsy;
    }

    return drawTheWhimsy;
  }
})

