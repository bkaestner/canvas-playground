var canvas = document.getElementById("canvas");
var ctx    = canvas.getContext("2d");

var BRUSH_RADIUS = 10;  //!< the basic brush size
var DELTA_MIN = 1;      //!< factor at the lowest speed
var DELTA_MAX = 20;     //!< factor at the highest speed
var DELTA_RATIO = 0.95; //!< "smoothing" of the factor
var DRAW_OPACITY = 0.1; //!< the opacity of rectangle used for the "fading"

//! Takes the current actual values of height and width
//! and sets them as the element's attributes.
function registerCanvasSizeChange(){
  var style = window.getComputedStyle(canvas);

  //! @remark Without this, the canvas coordinates won't
  //!         match their respective (relaiteve) screen
  //!         coordinates and one would end up with a
  //!         offset.
  canvas.width  = style.width.replace("px",'');
  canvas.height = style.height.replace("px",'');
}

registerCanvasSizeChange();

window.addEventListener("resize", registerCanvasSizeChange);

// Paint whenever the mouse moves
canvas.addEventListener("mousemove", (function(){
  var i = 0;
  var prevX = -1;
  var prevY = -1;
  var prevDelta = DELTA_MIN;
  return function(e){

    // START: Position related
    // Calculate position of the mouse relative to the canvas
    //! @bug This doesn't take scrolling into account.
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
    ctx.fillStyle = "rgba(255, 255, 255, " + DRAW_OPACITY +")";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  };
})());