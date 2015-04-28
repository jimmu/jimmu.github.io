define(
function (){
  // We'll interpolate between a and b in n steps.
  // That is, we expect to be called n+1 times to return all the values;
  // What we'll return is a function that returns
  // the next value each time it is called.
  return function (a, b, n){
    var currentValue = a;
    var thisStep = 0;
    var stepSize = (b-a)/n;

    return{
      next: function(){
        if (thisStep > n){
          return b;
        } 
        thisStep++;
        var returnValue = currentValue;
        currentValue += stepSize;
        return returnValue;
      }
      ,
      current: function(){
	return currentValue-stepSize;
      }
    }
  }
});

