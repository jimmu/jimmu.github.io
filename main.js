require(["libs/d3v3min"
       , "whimsy"]
,
function(d3, whim){
  var whimthing=whim();
  d3.select("body").call(whimthing);
});
