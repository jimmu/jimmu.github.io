define(["interpolate"]
,
function (interpolate){
  // We'll plot a spline curve from x1 to x2 
  // via a control x in n steps.
  // What we'll return is a function that returns
  // the next value each time it is called.
  // This looks fairly complex, but that's all so that we can
  // avoid doing any multiplication in the repeated calculation method.
  // We do it all by forward differences.
  return function (x1, x2, cx, n){
    var thisStep = 0;
    var firstPartStepSize = (cx-x1)/n;
    var secondPartStepSize = (x2-cx)/n;
    // Calculate the position on the intermediate line after one step.
    var firstLineLeftEdge = x1+firstPartStepSize;
    var firstLineRightEdge = cx+secondPartStepSize;
    var firstLinePosition = ((n-1)*firstLineLeftEdge + firstLineRightEdge)/n;
    var initialStepSize = firstLinePosition - x1;

    // The average step size is trivial to calculate.
    // From that and the first step size we can work out the last step.
    var averageStepSize = (x2-x1)/n;
    var finalStepSize = (2*averageStepSize)-initialStepSize;

    // So we know the sizes of the first and last steps.
    // All the other step sizes are linear interpolations between those.
    var stepSize = interpolate(initialStepSize, finalStepSize, n-1);
    var currentPosition = x1;	// This is our starting point.

    // All the stuff up there was a one-off.
    // Here's the bit which is called repeatedly.
    // It has no multiplications or divisions in it.
    return function(){
      thisStep++;
      if (thisStep > n){
        return x2;
      } 
      currentPosition += stepSize.next();
      return currentPosition;
    }
  }
});

