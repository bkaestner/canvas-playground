var canvas = document.getElementById("canvas");
var ctx    = canvas.getContext("2d");

var BRUSH_RADIUS = 10;
var DELTA_MIN = 1;      //!< factor at the lowest speed
var DELTA_MAX = 20;     //!< factor at the highest speed
var DELTA_RATIO = 0.95; //!< "smoothing" of the factor
var DRAW_OPACITY = 0.1; //!< the opacity of rectangle used for the "fading"

var buffer = [];
var buffer_read  = 0;
var buffer_write = 0;
var buffer_pop   = 0;
var BUFFER_SIZE  = 255;
var BUFFER_HANDLE_AMOUNT = 3;


var WINDOW_THRESH = 20;
var last_cut = -10;
var i;


// Paint whenever the mouse moves
canvas.addEventListener("mousemove", (function(){
  var i = 0;
  var prevX = -1;
  var prevY = -1;
  var prevDelta = DELTA_MIN;
  var now = Date.now();
  return function(e){
    if(buffer_pop >= BUFFER_SIZE)
      return;
    if(last_cut >= now + WINDOW_THRESH)
      return;
    last_cut = now;

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

    delta = DELTA_RATIO * prevDelta + (1 - DELTA_RATIO) * delta;

    // Save the current position as previous one.
    prevX = x;
    prevY = y;
    prevDelta = delta;

    // END: Position related

    if(typeof buffer[buffer_write] !== "object")
      buffer[buffer_write] = {};
    buffer[buffer_write].x = x;
    buffer[buffer_write].y = y;
    buffer[buffer_write].delta = delta;

    buffer_write = (buffer_write + 1) % BUFFER_SIZE;
    buffer_pop++;
  };
})());

var draw = function(){
  var i, blt;
  for(i = 0; buffer_pop > 0 && i < BUFFER_HANDLE_AMOUNT; i++){
    var blt = buffer[buffer_read];

    buffer_read = (buffer_read + 1) % BUFFER_SIZE;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(blt.x, blt.y, blt.delta * BRUSH_RADIUS , 0, 2 * Math.PI, true);
    ctx.fill();
    buffer_pop--;
  }
  // Paint over the whole canvas with a mostly transparent
  // colour, which makes old brushes "fade" away.
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();

  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);