define(["interpolate"]
,
function (interpolate){
  // We'll interpolate between colours a and b in n steps.
  // What we'll return is a function that returns
  // the next value each time it is called.
  return function (a, b, n){
    var red = interpolate(a.red, b.red, n);
    var green = interpolate(a.green, b.green, n);
    var blue = interpolate(a.blue, b.blue, n);
    var currentColour = decToString(a.red, a.green, a.blue);

    function decToString(r, g, b){
      var red=Math.floor(r).toString(16);
      var green=Math.floor(g).toString(16);
      var blue=Math.floor(b).toString(16);
      return "#"+red+green+blue;
    } 

    return{
      next: function(){
        currentColour = decToString(red.next(), green.next(), blue.next());
        return currentColour;
      }
      ,
      current: function(){
	return currentColour;
      }
    }
  }
});

