var canvas = document.getElementById("canvas");
var ctx    = canvas.getContext("2d");

var BRUSH_RADIUS = 10;
var DELTA_MIN = 1;
var DELTA_MAX = 10;

// Paint whenever the mouse moves
canvas.addEventListener("mousemove", (function(){
  var i = 0;
  var prevX = -1;
  var prevY = -1;
  return function(e){

    // START: Position related
    // Calculate position of the mouse relative to the canvas
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;

    // Only use the previous position if it has been valid
    if(prevX === -1 || prevY === -1){
      prevX = x;
      prevY = y;
    }

    // Calculate distance in both dimensions.
    var dx = (x - prevX);
    var dy = (y - prevY);

    // Calculate l2 norm between old and new position, with
    // a minimum of 1
    var delta = Math.min(DELTA_MAX, Math.max( DELTA_MIN,
                  Math.sqrt(dx * dx + dy * dy)
                ));

    // Save the current position as previous one.
    prevX = x;
    prevY = y;
    // END: Position related

    // START: Drawing
    ctx.fillStyle = "hsl(" + i + ", 100%, 50%)";

    // Draw the circle
    ctx.beginPath();
    ctx.arc(x, y, delta * BRUSH_RADIUS , 0, 2 * Math.PI, true);
    ctx.fill();

    // Choose the next colour in HSL.
    i = (i + 1) % 360;

    // Paint over the whole canvas with a mostly transparent
    // colour, which makes old brushes "fade" away.
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  };
})());