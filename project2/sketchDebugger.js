var SketchDebugger = {

	/**
	 * Initializes the drawing canvas.
	 */
	init: function() {

		// initialize and connect to the canvas
		this.drawCanvas = document.getElementById('drawCanvas');
		this.drawContext = this.drawCanvas.getContext("2d");

		this.previewCanvas = document.getElementById('previewCanvas');
		this.previewContext = this.previewCanvas.getContext("2d");
		
		// set the canvas size
		width = this.drawCanvas.width;
		height = this.drawCanvas.height;
		
		//
		document.getElementById('previewCanvas').style.display = "none";
		
		// initialize the strokes and points
		this.strokes = [];
		this.points = [];

		// add the mouse-move event handler to the canvas
		this.drawCanvas.addEventListener("mousemove", function (e) {
			SketchDebugger.findxy('move', e)
		}, false);
		
		// add the mouse-down event handler to the canvas
		this.drawCanvas.addEventListener("mousedown", function (e) {
			SketchDebugger.findxy('down', e)
		}, false);
		
		// add the mouse-up event handler to the canvas
		this.drawCanvas.addEventListener("mouseup", function (e) {
			SketchDebugger.findxy('up', e)
		}, false);
		
		// add the mouse-out-of-focus event handler to the canvas
		this.drawCanvas.addEventListener("mouseout", function (e) {
			SketchDebugger.findxy('out', e)
		}, false);
	},

	/**
	 * Update the mouse drawing location.
	 * @param {string} state - The user's drawing interaction state.
	 * @param {Object} e - The canvas' event handler.
	 */
	findxy: function(state, e) {
		
		// mouse-down
		if (state === 'down') {
			this.prevX = this.currX;
			this.prevY = this.currY;
			this.currX = e.clientX - this.drawCanvas.offsetLeft;
			this.currY = e.clientY - this.drawCanvas.offsetTop;

			this.points = [];
			this.addPoint(this.currX, this.currY);
			
			this.flag = true;

			// add starting endpoint (experiment)
			this.drawContext.beginPath();
			this.drawContext.fillStyle = this.strokeColor;
			this.drawContext.fillRect(this.currX, this.currY, this.dotWidth, this.dotWidth);
			this.drawContext.closePath();
		}
		
		// mouse-up or out-of-focus
		else if (state === 'up' || state === "out") {
			
			if (this.flag) {
				// add the current stroke
				this.addStroke(this.points);
			}

			this.flag = false;
		}
		
		// mouse-move
		else if (state === 'move') {
			if (this.flag) {
				this.prevX = this.currX;
				this.prevY = this.currY;
				this.currX = e.clientX - this.drawCanvas.offsetLeft;
				this.currY = e.clientY - this.drawCanvas.offsetTop;
				this.draw();

				// add the current point
				this.addPoint(this.currX, this.currY);
			}
		}
	},

	/**
	 * Draws the line between the previous and current drawing point.
	 */
	draw: function() {

		this.addLineSegment(this.drawContext, this.prevX, this.prevY, this.currX, this.currY);
	},

	erase: function() {

		// clear the entire canvas' drawing space
		this.drawContext.clearRect(0, 0, width, height);

		// clear the strokes and points
		this.strokes = [];
		this.points = [];

		// 
		document.getElementById('previewCanvas').style.display = "none";
	},

	undo: function() {
		if (this.strokes.length === 0) { return; }

		this.strokes.pop();
		
		this.update(this.drawContext, this.strokes);
	},

	update: function(context, strokes) {
		// clear the entire canvas' drawing space
		context.clearRect(0, 0, width, height);
		
		// iterate through each stroke
		for (var i = 0; i < strokes.length; i++) {
			var points = strokes[i].points;
			
			// do nothing
			if (points.length === 0) { continue; }
			
			// draw the dot
			if (points.length === 1) {
				
				var currPoint = points[0];
				context.fillRect(currPoint.x, currPoint.y, this.dotWidth, this.dotWidth);
				continue;
			}
			
			// iterate through each point in the stroke
			for (var j = 0; j < points.length - 1; j++) {
			
				var currPoint = points[j];
				var nextPoint = points[j + 1];
				this.addLineSegment(context, currPoint.x, currPoint.y, nextPoint.x, nextPoint.y);
			}	
		}
	},

	previewSketch: function(sketch, color) {

		var originalColor = this.strokeColor;					// save original color
		this.strokeColor = color;								// change color

		// iterate through each stroke
		var strokes = sketch.strokes;
		for (var i = 0; i < strokes.length; i++) {
			var points = strokes[i].points;
			
			// iterate through each point in the stroke
			for (var j = 0; j < points.length - 1; j++) {
			
				var currPoint = points[j];
				var nextPoint = points[j + 1];
				this.addLineSegment(this.previewContext, currPoint.x, currPoint.y, nextPoint.x, nextPoint.y);
			}	
		}

		this.strokeColor = originalColor;						// revert color
	},

	previewPoints: function(points, color) {

		this.previewContext.fillStyle = color;						// change color
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			this.previewContext.fillRect(point.x - 7, point.y - 7, 15, 15);
			
		}
		this.previewContext.fillStyle = this.strokeColor;			// revert color
	},

	addLineSegment: function(context, prevX, prevY, currX, currY) {
		context.beginPath();						// start the path
		context.moveTo(prevX, prevY);				// mouse position to previous (x, y)
		context.lineTo(currX, currY);				// draw line to current (x, y)
		context.strokeStyle = this.strokeColor;		// set the stroke color
		context.lineWidth = this.lineWidth;			// set the line width
		context.stroke();							// display the stroke
		context.closePath();						// end the path
	},

	addPoint: function(x, y) {
		var point = {};
		point.x = x;
		point.y = y;
		point.time = Math.floor( Date.now() / 1000 );

		// add the point
		this.points.push(point);
	},

	addStroke: function(points) {
		// hack: filter consecutive points for small strokes
		// needed since JavaScript can't draw line segments for endpoints with same (x,y)
		if (points.length <= 3) {
			for (var i = points.length - 1; i >= 1; i--) {
				if (points[i].x === points[i - 1].x && points[i].y === points[i - 1].y) { points.pop(); }
			}
		}
		
		// create the stroke
		var stroke = {};
		stroke.points = points;

		// add the stroke
		this.strokes.push(stroke);
	},

	showPreview: function() {
		document.getElementById('previewCanvas').style.display = "inline";	// show preview in document
		SketchDebugger.previewContext.clearRect(0, 0, width, height);		// clear the preview
	},

	getSketch: function() {
		var sketch = {};
		sketch.strokes = this.strokes;
		return sketch;
	},

	/**
	 * The fields.
	 * - myDrawCanvas: the canvas HTML5 object
	 * - myDrawContext: the direct access to the canvas object
	 * - flag: the mouse interaction state flag
	 * - myPrevX, myCurrX, myPrevY, myCurrY: the most recent line's (x, y) positions
	 * - dot_flag: the stroke's start point state flag
	 * - myStrokeColor: the color of the drawing stroke
	 * - myLineWidth: the width of the drawing stroke
	 */

	drawCanvas: null,
	drawContext: null,
	previewCanvas: null,
	previewContext: null,
	flag: false,
	prevX: 0,
	currX: 0,
	prevY: 0,
	currY: 0,

	strokeColor: "black",
	lineWidth: 3,
	dotWidth: 2,

	points: [],
	strokes: []
};