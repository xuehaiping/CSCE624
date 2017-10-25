var SketchIo = {
    
    getSketchObjects: function(inputs) {
        var sketches = [];
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var sketch = this.getSketchObject(input);
            sketches.push(sketch);
        }
        return sketches;
    },

    /**
     * Gets the JSON-formatted sketch data and converts it to an JS sketch object.
     * @param {Object} input - The  JSON-formatted data.
     * @return {Object} The JS sketch object.
     */
    getSketchObject: function(input) {      
        // error-checking #0: check if input exists
        if (input === null || input === undefined) {
          console.log("ERROR #0: sketch does not exist");
          return null;
        }
      
        // error-checking #1: check if input has shapes
        if (input.shapes === undefined || input.shapes.length === 0) {
          console.log("ERROR #1: sketch has no shapes");
          return null;
        }
      
        // error-checking #2: check if interpretation property exists
        if (!(input.shapes[0]).hasOwnProperty("interpretation")) {
          console.log("ERROR #2: sketch does not have interpretation property");
          return null;
        }
		
		// get the interpretation
		var interpretation = input.shapes[0]["interpretation"];
		
        // error-checking #3: check if strokes property exists
        if (!input.hasOwnProperty("strokes")) {
          console.log("ERROR #3: sketch does not have strokes property");
          return null;
        }
      
        // error-checking #4: check if points property exists
        if (!input.hasOwnProperty("points")) {
          console.log("ERROR #4: sketch does not have points property");
          return null;
        }

        // create mapping of point ID to point data by moving ID out to an attribute
        input.points = this.arrayToObj(input.points);
      
		// get the strokes
		var sketchStrokes = input["strokes"];
		
        // error-checking #5: check if strokes exist
        if (sketchStrokes === null || sketchStrokes === undefined || sketchStrokes.length === 0) {
          console.log("ERROR #5: sketch has no strokes");
          return null;
        }
        
		// collect the strokes
        var strokes = [];
		for (var i = 0; i < sketchStrokes.length; i++) {
		
            // get the current stroke
			var sketchStroke = sketchStrokes[i];
			
            // error-checking #6: check if current stroke exists
            if (sketchStroke === null || sketchStroke === undefined) {
              console.log("ERROR #6: stroke #" + i + " does not exist");
              continue;
            }
          
            // error-checking #7: check if current stroke has points property
			if (!sketchStroke.hasOwnProperty("points")) {
              console.log("ERROR #7: stroke #" + i + " does not have points property");
              continue;
            }
          
            // get the stroke's point IDs
            var pointIds = sketchStroke["points"];
		    
            // error-checking #8: check if there are point IDs
            if (pointIds.length === 0) {
              console.log("ERROR #8: stroke #" + i + " does not have points");
              continue;
            }
          
			// get the list of point objects
			var points = [];
			for (var j = 0; j < pointIds.length; j++) {
				var pointId = pointIds[j];			// get the current point ID
				var point = input.points[pointId];	// get the point

                // error-checking #9: check if point exists
                if (point === null || point === undefined) {
                  console.log("ERROR #9: point #" + j + "at stroke #" + i + "does not exist");
                  continue;
                }
              
                // add ID to point
                point.id = pointId;
              
                // add point to list
				points.push(point);
			}
          
            // error-checking #10: check if stroke exists exists
            if (points.length === 0) {
              console.log("ERROR #10: stroke #" + i + " does not have points");
              continue;
            }
			
			// get the stroke object
			var stroke = {};
			stroke.id = sketchStroke.id;
			stroke.time = points[0].time;
			stroke.points = points;
		
			// add the stroke
			strokes.push(stroke);
		}
      
        // error-checking #11: check if sketch has strokes
        if (strokes.length === 0) {
          console.log("ERROR #11: sketch does not have strokes");
          return null;
        }
		
		// get the sketch
		var sketch = {};
		sketch.interpretation = interpretation;
		sketch.strokes = strokes;
		
		return sketch;
	},

    /**
     * Converts an array to an object.
     * @array {Object[]} array - The input array.
     * @return {Object[]} The output object.
     */
    arrayToObj: function(array) {
        var obj = {}
        for (var i = 0; i < array.length; i++) {
            var val = array[i];
            var id = val.id;
            delete val.id;
            obj[id] = val;
        }
        return obj;
    }
}