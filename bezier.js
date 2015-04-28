define(["interpolate"]
,
function (interpolate){
  // We'll plot a bezier curve from x1 to x2 
  // via a control x in n steps.
  // What we'll return is a function that returns
  // the next value each time it is called.
  // This looks fairly complex, but that's all so that we can
  // avoid doing any multiplication in the repeated calculation method.
  // We do it all by forward differences.
  return function (x1, x2, cx, n){
    var thisStep = 0;
    // The line length after one step.
    var firstLineLeftEdge = x1+((cx-x1)/n);
    var firstLineRightEdge = cx+((x2-cx)/n);
    var firstLineLength = firstLineRightEdge - firstLineLeftEdge;
    var firstLineStepSize = firstLineLength/n;
    // The step from the start point to the point on the first-step line.
    var initialStepSize = (firstLineLeftEdge + firstLineStepSize) - x1;
    // The line length one step before the end;
    var lastLineRightEdge = x2-((x2-cx)/n);
    var lastLineLeftEdge = cx-((cx-x1)/n);
    var lastLineLength = lastLineRightEdge - lastLineLeftEdge;
    var lastLineStepSize = lastLineLength/n;
    var finalStepSize = x2 - (lastLineRightEdge - lastLineStepSize);
    var stepSize = interpolate(initialStepSize, finalStepSize, n-1);
    
    var sumOfSteps = 0;

    return function(){
      thisStep++;
      if (thisStep > n){
        return x2;
      } 
      sumOfSteps += stepSize.next();
      return sumOfSteps;
    }
  }
});

