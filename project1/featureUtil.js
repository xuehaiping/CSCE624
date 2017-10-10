function arrayToObj(array) {
      var obj = {}
      for (var i = 0; i < array.length; i++) {
          var val = array[i];
          var id = val.id;
          delete val.id;
          obj[id] = val;
      }
      return obj;
  }

/* Helper functions */
function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function squareEuclideanDistance(p1, p2) {
  var deltaX = p1["x"] - p2["x"];
  var deltaY = p1["y"] - p2["y"];
  return deltaX*deltaX + deltaY*deltaY;
}

function euclideanDistance(p1, p2) {
  return Math.sqrt(squareEuclideanDistance(p1, p2));
}

function cosine(p1, p2) {
  var numerator = p2["x"] - p1["x"];
  var denominator = euclideanDistance(p1, p2);
  if(denominator == 0) return 0;
  return numerator/denominator;
}

function sine(p1, p2) {
  var numerator = p2["y"] - p1["y"];
  var denominator = euclideanDistance(p1, p2);
  if(denominator == 0) return 0;
  return numerator/denominator;
}

function maxPoint(points) {
  var maxX = Number.MIN_VALUE;
  var maxY = Number.MIN_VALUE;
  for(var i = 0; i < points.length; i++) {
    if(points[i]["x"] > maxX) maxX = points[i]["x"];
    if(points[i]["y"] > maxY) maxY = points[i]["y"];
  }
  return {x:maxX, y:maxY};
}

function minPoint(points) {
  var minX = Number.MAX_VALUE;
  var minY = Number.MAX_VALUE;
  for(var i = 0; i < points.length; i++) {
    if(points[i]["x"] < minX) minX = points[i]["x"];
    if(points[i]["y"] < minY) minY = points[i]["y"];
  }
  return {x:minX, y:minY};
}
/* Start of features */

function initAngleCosine(sketch) {
  //return cosine(sketch.points[sketch.strokes[0].points[0]], sketch.points[sketch.strokes[0].points[2]]);
  return cosine(sketch["points"][0], sketch["points"][2]);
}

function initAngleSine(sketch) {
  return sine(sketch["points"][0], sketch["points"][2]);
}

function BoundBoxDiagonalLength(sketch) {
  var maxP = maxPoint(sketch["points"]);
  var minP = minPoint(sketch["points"]);
  return euclideanDistance(maxP, minP);
}

function BoundBoxDiagonalAngle(sketch) {
  var maxP = maxPoint(sketch["points"]);
  var minP = minPoint(sketch["points"]);
  var numerator = maxP["y"] - minP["y"];
  var denominator = maxP["x"] - minP["x"];
  if(denominator == 0) return 0;
  return Math.atan(numerator/denominator);
}

function firstLastPointDistance(sketch) {
  var len = sketch["points"].length;
  return euclideanDistance(sketch["points"][0], sketch["points"][len-1]);
}

function firstLastPointCosine(sketch) {
  var len = sketch["points"].length;
  return cosine(sketch["points"][0], sketch["points"][len-1]);
}

function firstLastPointSine(sketch) {
  var len = sketch["points"].length;
  return sine(sketch["points"][0], sketch["points"][len-1]);
}

function totalGestureLength(sketch) {
  var sum = 0;
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 0; j < stroke.length-1; j++) {
      var p1 = sketch.pointsDict[stroke[j]];
      var p2 = sketch.pointsDict[stroke[j+1]];
      if(typeof p1 === "undefined" || typeof p2 === "undefined") {
          continue;
      }
      sum += euclideanDistance(p1, p2);
    }
  }
  return sum;
}

//definition Theta(p) in paper
function thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1) {
  var numerator = deltaX*deltaYMinus1 - deltaXMinus1*deltaY;
  var denominator = deltaX*deltaXMinus1 + deltaY*deltaYMinus1;
  if(denominator == 0) return 0;
  return Math.atan(numerator/denominator);
}

function totalAngleTraversed(sketch) {
  var angleSum = 0;

  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 1; j < stroke.length-1; j++) {
      if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined" || typeof sketch.pointsDict[stroke[j-1]] === "undefined") {
          continue;
      }
      var deltaX = sketch.pointsDict[stroke[j+1]]["x"]-sketch.pointsDict[stroke[j]]["x"],
      deltaY = sketch.pointsDict[stroke[j+1]]["y"]-sketch.pointsDict[stroke[j]]["y"],
      deltaXMinus1 = sketch.pointsDict[stroke[j]]["x"]-sketch.pointsDict[stroke[j-1]]["x"],
      deltaYMinus1 = sketch.pointsDict[stroke[j]]["y"]-sketch.pointsDict[stroke[j-1]]["y"];
      angleSum += thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1);
    }
  }
  return angleSum;
}

function absoluteTotalAngleTraversed(sketch) {
  var absAngleSum = 0;
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 1; j < stroke.length-1; j++) {
      if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined" || typeof sketch.pointsDict[stroke[j-1]] === "undefined") {
          continue;
      }
      var deltaX = sketch.pointsDict[stroke[j+1]]["x"]-sketch.pointsDict[stroke[j]]["x"],
      deltaY = sketch.pointsDict[stroke[j+1]]["y"]-sketch.pointsDict[stroke[j]]["y"],
      deltaXMinus1 = sketch.pointsDict[stroke[j]]["x"]-sketch.pointsDict[stroke[j-1]]["x"],
      deltaYMinus1 = sketch.pointsDict[stroke[j]]["y"]-sketch.pointsDict[stroke[j-1]]["y"];
      absAngleSum += Math.abs(thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1));
    }
  }

  return absAngleSum;
}

function squareTotalAngleTraversed(sketch) {
  var angleSquareSum = 0;
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 1; j < stroke.length-1; j++) {
      if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined" || typeof sketch.pointsDict[stroke[j-1]] === "undefined") {
          continue;
      }
      var deltaX = sketch.pointsDict[stroke[j+1]]["x"]-sketch.pointsDict[stroke[j]]["x"],
      deltaY = sketch.pointsDict[stroke[j+1]]["y"]-sketch.pointsDict[stroke[j]]["y"],
      deltaXMinus1 = sketch.pointsDict[stroke[j]]["x"]-sketch.pointsDict[stroke[j-1]]["x"],
      deltaYMinus1 = sketch.pointsDict[stroke[j]]["y"]-sketch.pointsDict[stroke[j-1]]["y"];
      angleSquareSum += Math.pow(thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1), 2);
    }
  }
  return angleSquareSum;
}

function maxSpeedSquare(sketch) {
  var maxDelta = Number.MIN_VALUE;
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 0; j < stroke.length-1; j++) {
      var p1 = sketch.pointsDict[stroke[j]];
      var p2 = sketch.pointsDict[stroke[j+1]];
      if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined") {
          continue;
      }
      var deltaTime = p2["time"] - p1["time"];
      if(deltaTime != 0) {
        var div = squareEuclideanDistance(p1, p2) / (deltaTime * deltaTime);
        maxDelta = Math.max(div, maxDelta);
      }
    }
  }
  return maxDelta;
}

function gestureDuration(sketch) {
  var points = sketch["points"];
  return points[points.length-1]["time"] - points[0]["time"];
}

function aspectRatio(sketch) {
  return Math.abs(toRadians(45) - BoundBoxDiagonalAngle(sketch));
}

function relativeRotation(sketch) {
  return totalAngleTraversed(sketch)/totalGestureLength(sketch);
}

function Curviness(sketch) {
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var angle19 = toRadians(19);
    var absAngleSum = 0;
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 1; j < stroke.length-1; j++) {
      if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined" || typeof sketch.pointsDict[stroke[j-1]]=== "undefined") {
          continue;
      }
      var deltaX = sketch.pointsDict[stroke[j+1]]["x"]-sketch.pointsDict[stroke[j]]["x"],
      deltaY = sketch.pointsDict[stroke[j+1]]["y"]-sketch.pointsDict[stroke[j]]["y"],
      deltaXMinus1 = sketch.pointsDict[stroke[j]]["x"]-sketch.pointsDict[stroke[j-1]]["x"],
      deltaYMinus1 = sketch.pointsDict[stroke[j]]["y"]-sketch.pointsDict[stroke[j-1]]["y"];
        var curAngle = Math.abs(thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1));
        if(curAngle < angle19)
          absAngleSum += curAngle;
    }
  }
  return absAngleSum;
}

function strokeLenEndPointRatio(sketch) {
  var totalLen = totalGestureLength(sketch);
  var firstLastPointDis = firstLastPointDistance(sketch);

  if(firstLastPointDistance(sketch) == 0) {
    return  Number.MAX_VALUE;
  }
  return totalLen/firstLastPointDis;
}

function strokeLenBoundingBoxRatio(sketch) {
  return totalGestureLength(sketch)/BoundBoxDiagonalLength(sketch);
}

function openess(sketch) {
  return firstLastPointDistance(sketch)/BoundBoxDiagonalLength(sketch);
}

function areaOfBoundingBox(sketch) {
  var maxP = maxPoint(sketch["points"]);
  var minP = minPoint(sketch["points"]);
  return Math.abs((maxP.x - minP.x) * (maxP.y - minP.y));
}

function logAreaOfBoundingBox(sketch) {
  var area = areaOfBoundingBox(sketch);
  if(area == 0) return Number.MIN_VALUE;
  return Math.log10(area);
}

function rotationalChange(sketch) {
  return totalAngleTraversed(sketch)/absoluteTotalAngleTraversed(sketch);
}

function logStrokeLen(sketch) {
  return Math.log10(totalGestureLength(sketch));
}

function logAspectRatio(sketch) {
  var aspectRat = aspectRatio(sketch);
  if(aspectRat == 0)
    return Number.MIN_VALUE;
  return Math.log10(aspectRat);
}

function directionChange(p1, p2) {
  var deltaX = p2['x'] - p1['x'];
  var deltaY = p2['y'] - p1['y'];
  return deltaY/deltaX;
}

function DCR(sketch) {
  var sum = 0;
  var maxValue = Number.MIN_VALUE;
  for(var i = 0; i < sketch["strokes"].length; i++) {
    var stroke = sketch["strokes"][i]["points"];
    for(var j = 0; j < stroke.length-1; j++) {
      var p1 = sketch.pointsDict[stroke[j]];
      var p2 = sketch.pointsDict[stroke[j+1]];
      if(typeof p1 === "undefined" || typeof p2 === "undefined" || (p2['x'] - p1['x']) == 0) {
          continue;
      }
      var change = directionChange(p1, p2);
      if(change > maxValue)
        maxValue = change;
      sum = sum + change;
      }
    }

    if(sketch['points'].length == 0 || sum/sketch['points'].length == 0)
      return 0;
    return maxValue/(sum/sketch['points'].length);
  }

  function DCRMin(sketch) {
    var sum = 0;
    var minValue = Number.MAX_VALUE;
    for(var i = 0; i < sketch["strokes"].length; i++) {
      var stroke = sketch["strokes"][i]["points"];
      for(var j = 0; j < stroke.length-1; j++) {
        var p1 = sketch.pointsDict[stroke[j]];
        var p2 = sketch.pointsDict[stroke[j+1]];
        if(typeof p1 === "undefined" || typeof p2 === "undefined" || (p2['x'] - p1['x']) == 0) {
            continue;
        }
        var change = directionChange(p1, p2);
        if(change < minValue)
          minValue = change;
        sum = sum + change;
        }
      }
      if(sketch['points'].length == 0 || sum/sketch['points'].length == 0)
        return 0;
      return minValue/(sum/sketch['points'].length);
    }

  function numberOfStrokes(sketch) {
    return sketch["strokes"].length;
  }

  function numberOfAngle(sketch) {
    for(var i = 0; i < sketch["strokes"].length; i++) {
      var angle19 = toRadians(19);
      var number= 0;
      var stroke = sketch["strokes"][i]["points"];
      for(var j = 1; j < stroke.length-1; j++) {
        if(typeof sketch.pointsDict[stroke[j+1]] === "undefined" || typeof sketch.pointsDict[stroke[j]] === "undefined" || typeof sketch.pointsDict[stroke[j-1]]=== "undefined") {
            continue;
        }
        var deltaX = sketch.pointsDict[stroke[j+1]]["x"]-sketch.pointsDict[stroke[j]]["x"],
        deltaY = sketch.pointsDict[stroke[j+1]]["y"]-sketch.pointsDict[stroke[j]]["y"],
        deltaXMinus1 = sketch.pointsDict[stroke[j]]["x"]-sketch.pointsDict[stroke[j-1]]["x"],
        deltaYMinus1 = sketch.pointsDict[stroke[j]]["y"]-sketch.pointsDict[stroke[j-1]]["y"];
          var curAngle = Math.abs(thetaP(deltaX, deltaXMinus1, deltaY, deltaYMinus1));
          if(curAngle > angle19)
            number += 1;
      }
    }
    return number;
  }

function sumOfStrokeFirstLastPointLen(sketch) {
  var sum = 0;
  for(var i = 0; i < sketch["strokes"].length; i++) {

    var length = sketch["strokes"][i]["points"].length;
    if(typeof  sketch.pointsDict[sketch["strokes"][i]["points"][length-1]] === "undefined" || typeof sketch.pointsDict[sketch["strokes"][i]["points"][0]] === "undefined")
      continue;
    sum += euclideanDistance(sketch.pointsDict[sketch["strokes"][i]["points"][length-1]], sketch.pointsDict[sketch["strokes"][i]["points"][0]]);
  }
  return sum;
}

function numberOfPoints(sketch) {
  return sketch["points"].length;
}
