define(["interpolate"]
,
function (interpolate){
  // We'll plot a bezier curve from x1 to x2 
  // via a control x in n steps.
  // (Actually, is that truly Bezier? Or just a spline?)
  // What we'll return is a function that returns
  // the next value each time it is called.
  // This looks fairly complex, but that's all so that we can
  // avoid doing any multiplication in the repeated calculation method.
  // We do it all by forward differences.
  return function (x1, x2, cx, n){
    var thisStep = 0;
    var firstPartStepSize = (cx-x1)/n;
    var secondPartStepSize = (x2-cx)/n;
    // The line length after one step.
    var firstLineLeftEdge = x1+firstPartStepSize;
    var firstLineRightEdge = cx+secondPartStepSize;
    var firstLineLength = firstLineRightEdge - firstLineLeftEdge;
    // And one step along that line.
    var firstLineStepSize = firstLineLength/n;
    // The line length one step before the end;
    var lastLineRightEdge = x2-secondPartStepSize;
    var lastLineLeftEdge = cx-firstPartStepSize;
    var lastLineLength = lastLineRightEdge - lastLineLeftEdge;
    // And one step along that line.
    var lastLineStepSize = lastLineLength/n;
    // The step from the start point to the point on the first-step line.
    var initialStepSize = (firstLineLeftEdge + firstLineStepSize) - x1;
    // The step from the penultimate point to the end point.
    var finalStepSize = x2 - (lastLineRightEdge - lastLineStepSize);
    // So we know the sizes of the first and last steps.
    // All the other step sizes are linear interpolations between those.
    var stepSize = interpolate(initialStepSize, finalStepSize, n-1);
    
    var sumOfSteps = 0;

    // All the stuff up there was a one-off.
    // Here's the bit which is called repeatedly.
    // It has no slow maths in it.
    return function(){
      thisStep++;
      if (thisStep > n){
        return x2;
      } 
      sumOfSteps += stepSize.next();
      return sumOfSteps + x1;
    }
  }
});

