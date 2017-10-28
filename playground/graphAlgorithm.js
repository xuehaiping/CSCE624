var testcase1 = [
  [0,1,1,1,0,0,1,0],
  [1,0,0,1,1,0,0,0],
  [1,0,0,1,0,0,0,0],
  [1,1,1,0,1,0,0,0],
  [0,1,0,1,0,0,0,0],
  [0,0,0,0,0,0,1,0],
  [1,0,0,0,0,1,0,1],
  [0,0,0,0,0,0,1,0]];

var testcase2 = [
  [0,1,1],
  [1,0,1],
  [1,1,0]
];

function findValidVertices(graph) {
  var validVertices = [];
  for(var i=0; i<graph.length; i++)
    validVertices.push(i);

  var invalid = findSingleEdgeVertices(validVertices, graph);
  while(invalid.length>0) {
    //remove the edges from graph
    removeInvalidVertices(invalid, graph);
    //remove vertices from valid vertices
    for(var i=0; i<invalid.length; i++) {
      var index = validVertices.indexOf(invalid[i]);
      validVertices.splice(index, 1);
    }
    //search invalid vertices again
    invalid = findSingleEdgeVertices(validVertices, graph);
  }

  return validVertices;
}

//find single connect vertices in the graph
function findSingleEdgeVertices(validVertices, graph) {
  var singleEdgeVertices = [];
  for(var i=0; i<validVertices.length; i++) {
    var count = 0;
    for(var j=0; j<graph[validVertices[i]].length; j++) {
      if(graph[validVertices[i]][j]!=0)
        count++;
    }
    if(count == 1 || count == 0)
      singleEdgeVertices.push(validVertices[i]);
  }
  return singleEdgeVertices;
}

//remove edges for invalid vertices
function removeInvalidVertices(invalidList, graph) {
  for(var i=0; i<invalidList.length; i++) {
    for(var j=0; j<graph[invalidList[i]].length; j++) {
      //remove edges in two directions in the graph
      if(graph[invalidList[i]][j]!=0) {
        graph[invalidList[i]][j] = 0;
        graph[j][invalidList[i]] = 0;
      }
    }
  }
}
