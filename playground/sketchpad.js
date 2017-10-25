// #######################
// ##### INITIALIZER #####
// #######################

// Set-up the canvas and add our event handlers after the page has loaded
function init() {
    // Get the specific canvas element from the HTML document
    drawCanvas = document.getElementById('drawCanvas');
    previewCanvas = document.getElementById('previewCanvas');

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (drawCanvas.getContext)
        drawContext = drawCanvas.getContext('2d');
    if (previewCanvas.getContext)
        previewContext = previewCanvas.getContext('2d');

    // initially hide the preview canvas
		document.getElementById('previewCanvas').style.display = "none";

    // get the draw (and preview) canvas width
    width = this.drawCanvas.width;
		height = this.drawCanvas.height;

    // Check that we have a valid context to draw on/with before adding event handlers
    if (drawContext) {
        // React to mouse events on the canvas, and mouseup on the entire document
        drawCanvas.addEventListener('mousedown', drawCanvas_mouseDown, false);
        drawCanvas.addEventListener('mousemove', drawCanvas_mouseMove, false);
        window.addEventListener('mouseup', drawCanvas_mouseUp, false);

        // React to touch events on the canvas
        drawCanvas.addEventListener('touchstart', drawCanvas_touchStart, false);
        drawCanvas.addEventListener('touchend', drawCanvas_touchEnd, false);
        drawCanvas.addEventListener('touchmove', drawCanvas_touchMove, false);
    }
}



// ###############################
// ##### BUTTON INTERACTIONS #####
// ###############################

// Clear the canvas context using the canvas width and height
function clearButton(canvas, context) {
  clearCanvas(canvas, context);
  DrawCanvasData.points = [];
  DrawCanvasData.strokes = [];
}

function undoButton(canvas, context) {
  // do nothing if there are not recorded strokes
  if (DrawCanvasData.strokes.length === 0) { return; }

  // remove the last stroke and clear the canvas
  DrawCanvasData.strokes.pop();
  clearCanvas(canvas, context);

  // re-add the remaining strokes
  for (var i = 0; i < DrawCanvasData.strokes.length; i++) {
    var points = DrawCanvasData.strokes[i].points;

    if (points.length === 1) {
      var point = points[0];
      drawLineSegment(context, point.x, point.y, point.x, point.y, strokeSize);
      continue;
    }

    for (var j = 0; j < points.length - 1; j++) {
      var point0 = points[j];
      var point1 = points[j + 1];
      var prevX = point0.x;
      var prevY = point0.y;
      var currX = point1.x;
      var currY = point1.y;
      drawLineSegment(context, prevX, prevY, currX, currY, strokeSize);
    }
  }
}

function showPreview() {
	document.getElementById('previewCanvas').style.display = "inline";	// show preview in document
	previewContext.clearRect(0, 0, width, height);		// clear the preview
}

function previewSketch(sketch, color) {
  //
	var originalColor = this.strokeColor;					// save original color
	strokeColor = color;								// change color
  previewContext.fillStyle = color;

	// iterate through each stroke
	var strokes = sketch.strokes;
	for (var i = 0; i < strokes.length; i++) {
		var points = strokes[i].points;

		// iterate through each point in the stroke
		for (var j = 0; j < points.length - 1; j++) {

			var currPoint = points[j];
			var nextPoint = points[j + 1];
			drawLineSegment(previewContext, currPoint.x, currPoint.y, nextPoint.x, nextPoint.y, strokeColor, strokeSize);
		}
	}
  strokeColor = originalColor;						// revert color
  previewContext.fillStyle = strokeColor;

}

function previewPoints(points, color) {

		previewContext.fillStyle = color;						// change color
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			previewContext.beginPath();
			//this.previewContext.fillRect(point.x - 7, point.y - 7, 15, 15);
			previewContext.arc(point.x, point.y, 5, 0, 2* Math.PI);
			previewContext.fill();
			previewContext.closePath();
		}
		previewContext.fillStyle = strokeColor;			// revert color
	}

// Draws a line between the specified position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function updateCanvas(context, x, y) {

  // If lastX is not set, set lastX and lastY to the current position
  if (lastX === -1) {
    lastX = x;
    lastY = y;
  }

  // draw latest line segment
  drawLineSegment(context, lastX, lastY, x, y, strokeColor, strokeSize);

  // Update the last position to reference the current position
  lastX = x;
  lastY = y;
}

function clearCanvas(canvas, context) {
  //
  context.clearRect(0, 0, canvas.width, canvas.height);
	document.getElementById('previewCanvas').style.display = "none";
}

function drawLineSegment(context, x0, y0, x1, y1, color, size) {
  // Select a fill style
  context.strokeStyle = color;
  //ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

  // Set the line "cap" style to round, so lines at different angles can join into each other
  //context.lineCap = "round";
  //ctx.lineJoin = "round";

  // Draw a filled line
  context.beginPath();

  // First, move to the old (previous) position
  context.moveTo(x0, y0);

  // Now draw a line to the current touch/pointer position
  context.lineTo(x1, y1);

  // Set the line thickness and draw the line
  context.lineWidth = size;
  context.stroke();

  context.closePath();
}



// ################################
// ##### MOUSE EVENT HANDLERS #####
// ################################

// Keep track of the mouse button being pressed and draw a dot at current location
function drawCanvas_mouseDown() {
  mouseDown = true;
  updateCanvas(drawContext, mouseX, mouseY);
  collectPoint(mouseX, mouseY);
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function drawCanvas_mouseMove(e) {
  // Update the mouse co-ordinates when moved
  getMousePos(e);

  // Draw a dot if the mouse button is currently being pressed
  if (mouseDown) {
      updateCanvas(drawContext, mouseX, mouseY);
      collectPoint(mouseX, mouseY);
  }
}

// Keep track of the mouse button being released
function drawCanvas_mouseUp() {

  if (mouseDown) { collectStroke(); }

  mouseDown = false;

  // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
  lastX = -1;
  lastY = -1;
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
 }



// ################################
// ##### TOUCH EVENT HANDLERS #####
// ################################

// Draw something when a touch start is detected
function drawCanvas_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    updateCanvas(drawContext, touchX, touchY);
    collectPoint(touchX, touchY);

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

// Draw something and prevent the default scrolling when touch movement is detected
function drawCanvas_touchMove(e) {
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    updateCanvas(drawContext, touchX, touchY);
    collectPoint(touchX, touchY);

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

function drawCanvas_touchEnd() {
    // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
    lastX = -1;
    lastY = -1;

    collectStroke();
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
  if (!e) {var e = event; }

  if(e.touches) {
    if (e.touches.length === 1) { // Only deal with one finger
      var touch = e.touches[0]; // Get the information for finger #1
      touchX = touch.pageX - touch.target.offsetLeft;
      touchY = touch.pageY - touch.target.offsetTop;
    }
  }
}



// ########################
// ##### DATA STORAGE #####
// ########################

/**
 * Collects the current point.
 * @param {number} x - The current point's x-coordinate.
 * @param {number} y - The current point's y-coordinate.
 */
function collectPoint(x, y) {
  // create the current point and add to the point collection
  var time = Date.now();     // create the time
  var point = {x: x, y: y, time: time};   // create the point
  DrawCanvasData.points.push(point);                     // add to point collection
}

function collectStroke() {
  var stroke = {points: DrawCanvasData.points};
  DrawCanvasData.strokes.push(stroke);
  DrawCanvasData.points = [];
}

function getSketch() {
  var sketch = {};
  sketch.strokes = DrawCanvasData.strokes;
  return sketch;
}

function doNothing(sketch) {
  for (var i = 0; i < sketch.strokes.length; i++) {
    var points = strokes[i].points;
    for (var j = 0; j < points.length; j++) {
      var point = points[j];
      // do stuff
    }
  }
}



// ##################
// ##### FIELDS #####
// ##################

// Variables for referencing the canvas and 2dcanvas context
var drawCanvas;
var previewCanvas
var drawnContext;
var previewContext;

// Variables to keep track of the mouse position and left-button status
var mouseX = 0;
var mouseY = 0;
var mouseDown;

// Variables to keep track of the touch position
var touchX;
var touchY;

// Keep track of the old/last position when drawing a line
// We set it to -1 at the start to indicate that we don't have a good value for it yet
var lastX = -1;
var lastY = -1;

// Size of the stroke
var strokeSize = 3;
var strokeColor = "black";

var DrawCanvasData = {
  points: [],
  strokes: [],
  sketch: {},
};
