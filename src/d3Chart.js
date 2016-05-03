import {List, Map, toJSON} from 'immutable';

const OPACITY = {
  INNERAREA: 0.05,
  OUTERAREA: 0.05,
  INTERSECTION: 0.25
};

const COLORS = ['red','blue','green','pink','orange','yellow'];

// d3Chart.js
export const createD3Chart = function(el, props, state) {


  //Initialise the svg element
  var svg = d3.select(el).append("svg")
                        .attr("id","plan")
                        .attr("viewBox","0 0 1000 1000")
                        .attr("preserveAspectRatio","xMidYMid meet")
                        .on("mousedown", mouseDown)
                        .on("mouseup", mouseUp)
                        .on("click", mouseClick)
                        .append("g")
                          .call(d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", zoom))
                        .append("g")
                          .attr("id", "inside");


  //Click listenners
  function mouseDown() {
    let coord = d3.mouse(d3.select('#inside').node());
    state.onMapClick({type: 'MAP_CLICK', x: coord[0], y: coord[1]});
  }
   
  //placeholders
  function mouseUp() {
  }
  function mouseClick() {
  }

  //Draw the elements here
  $(function(){
    $("#inside").load("./res/planC.svg", function(){
      d3.select('#inside').append('g').attr('class', 'main');
      d3.select('#inside').append('g').attr('class', 'anchor');
      d3.select('#inside').append('g').attr('class', 'areaInner');
      d3.select('#inside').append('g').attr('class', 'areaOuter');
      d3.select('#inside').append('g').attr('class', 'intersection');

      //Prepare the scale tools helpers
      d3.select("#inside").append("circle")
                          .attr("class", "cursor")
                          .attr("id", "i1")
                          .attr("cx", 0)
                          .attr("cy", 0)
                          .attr("r", 0);
      d3.select("#inside").append("circle")
                          .attr("id", "i2")
                          .attr("class", "cursor")
                          .attr("cx", 0)
                          .attr("cy", 0)
                          .attr("r", 0);

      //Prepare the diagonal to make it visible later, to help to place the second point when using scale tool.
      d3.select('#inside').append('line')
                        .attr('id', 'diagonalHelper')
                        .attr('x1', 0)
                        .attr('y1', 0)
                        .attr('x2', 0)
                        .attr('y2', 0)
                        .attr('stroke-width', 2)
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-dasharray', '15,6')
                        .attr('stroke', 'green')
                        .style('opacity', 0);

    });
  });

  //Allow pinch-to-zoom, scroll zoom, pan.
  function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  //updateD3Chart(el, state);
};

//Update the elements depending of the state.
export const updateD3Chart = function(el, state) {

  if(state.isScaleDefined){
    manageMains(state);
    manageAnchors(state);
    managePriority(state);
  }

  //Circle or Point mode
  if(state.options.get('precisionMode') == 'point'){
    //Point mode

    d3.selectAll('.mainCircle').transition().style("opacity",1);

    //Clear the Circle mode elements
    d3.selectAll('.anchorCircle').transition().style("opacity",0);
    d3.selectAll('.areaInnerCircle').transition().style("opacity",0);
    d3.selectAll('.areaOuterCircle').transition().style("opacity",0);
    d3.selectAll('.intersectionArea').transition().style("opacity",0);

  }else{
    //Circle mode
    
    d3.selectAll('.mainCircle').transition().style("opacity",0);

    //Clear the Point mode elements
    d3.selectAll('.anchorCircle').transition().style("opacity",1);
    d3.selectAll('.areaInnerCircle').transition().style("opacity",OPACITY.INNERAREA);
    d3.selectAll('.areaOuterCircle').transition().style("opacity",OPACITY.OUTERAREA);
    d3.selectAll('.intersectionArea').transition().style("opacity",OPACITY.INTERSECTION);



    //TODO : 1 intersection circle for each wino
  }


  //Toolbar tools
  if(state.event.size != 0){

    if(state.event.get('type') == 'scale'){
      //If we are using the scale tool

      if(state.event.get('data').get('firstPoint') != ''){

        //Store the first point coordinates
        let firstX = state.event.get('data').get('firstPoint').get(0);
        let firstY = state.event.get('data').get('firstPoint').get(1);

        //If first point is already defined
        d3.select('#i1').attr('cx', firstX)
                        .attr('cy', firstY)
                        .attr('r', 4)
                        .style("opacity",1);

        
        //Place the line to the clicked point for better transition.
        d3.select('#diagonalHelper').attr('x1', firstX)
                                    .attr('y1', firstY)
                                    .attr('x2', firstX)
                                    .attr('y2', firstY)
                                    .style('opacity', 0.2);

        if(state.event.get('data').get('secondPoint') != ''){
          //If second point is already defined

          //Redraw the diagonal without transition
          d3.select('#diagonalHelper').attr('x1', firstX-400)
                                      .attr('y1', firstY-400)
                                      .attr('x2', 400+firstX)
                                      .attr('y2', 400+firstY)

          d3.select('#i2').attr('cx', state.event.get('data').get('secondPoint').get(0))
                          .attr('cy', state.event.get('data').get('secondPoint').get(1))
                          .attr('r', 4)
                          .style("opacity",1);
        }else{
          //Draw the diagonal with transition
          d3.select('#diagonalHelper').transition()
                                      .duration(300)
                                      .attr('x1', firstX-400)
                                      .attr('y1', firstY-400)
                                      .attr('x2', 400+firstX)
                                      .attr('y2', 400+firstY)
        }

      }else{
        //If both are not defined, we clear them.
        d3.select('#diagonalHelper').style("opacity",0);
        d3.select('#i1').style("opacity",0);
        d3.select('#i2').style("opacity",0);
      }

    }else{

        //Reset every components related to events if we aren't in an event.
        d3.select('#diagonalHelper').transition().style("opacity",0);
        d3.select('#i1').transition().style("opacity",0);
        d3.select('#i2').transition().style("opacity",0);
      }
  }
};


function manageMains(state){
  //Manages the main winos
  var g = d3.select('#inside').selectAll('.main');
  var main = g.selectAll('.mainCircle').data(state.mainWinos, function(main) { return main.get('id') });
  
  //EXIT
  main.exit().remove();

  //ENTER
  main.enter().append('circle')
              .attr("class", "mainCircle")
              .attr("r", 15)
              .style("opacity", 1)
              .on("click", function(wino) { console.log('click'); state.setAnchorWino(wino.get('id')) });
  //ENTER & UPDATE
  main.attr("id", function(wino) { return "main"+wino.get('id') })
      .attr("cx", function(wino) { return wino.get('x') })
      .attr("cy", function(wino) { return wino.get('y') });

  main.enter().append('g')
              .attr('class', function(wino){ return 'areaInner'+wino.get('id')});
  main.enter().append('g')
              .attr('class', function(wino){ return 'areaOuter'+wino.get('id')});

  
}

/**
* Update the anchors based on the new state
*
*/
function manageAnchors(state){
  
  //Store the data of the outer circles to generate the intersections
  var intersectionDatas = {};

  //For each anchor, update it's <g> containing the area circles data.
  for(var key in state.mainWinos){

    var main = state.mainWinos[key];
    intersectionDatas[main.get('id')] = {x: [], y: [], r: []};

    //Inner area
    var g = d3.select('#inside').selectAll('.areaInner'+main.get('id'));
    var areaInner = g.selectAll('.areaInnerCircle').data(state.anchorWinos, function(anchor) { return anchor.get('id') });
    //ENTER
    areaInner.enter().append('circle')
            .attr("class", "areaInnerCircle")
            .style("opacity", OPACITY.INNERAREA);
    //ENTER & UPDATE
    areaInner.attr("id", function(wino) { return 'areaInner'+main.get('id')+'-'+wino.get('id') })
            .attr("cx", function(wino) { return wino.get('x') })
            .attr("cy", function(wino) { return wino.get('y') })
            .attr("r", function(wino) { return wino.getIn(['radius', ''+main.get('id')])*state.precision });
    //EXIT
    areaInner.exit().remove();

    //Outer area
    var g = d3.select('#inside').selectAll('.areaOuter'+main.get('id'));
    var areaOuter = g.selectAll('.areaOuterCircle').data(state.anchorWinos, function(anchor) { return anchor.get('id') });
    //ENTER
    areaOuter.enter().append('circle')
            .attr("class", "areaOuterCircle")
            .style("opacity", OPACITY.OUTERAREA);
    //ENTER & UPDATE
    areaOuter.attr("id", function(wino) { return "areaOuter"+main.get('id')+"-"+wino.get('id') })
            .attr("cx", function(wino) { intersectionDatas[main.get('id')]['x'].push(wino.get('x'));
                                        return wino.get('x'); })
            .attr("cy", function(wino) { intersectionDatas[main.get('id')]['y'].push(wino.get('y'));
                                        return wino.get('y'); })
            .attr("r", function(wino) { intersectionDatas[main.get('id')]['r'].push(wino.getIn(['radius',''+main.get('id')]))
                                        return wino.getIn(['radius',''+main.get('id')])});
    //EXIT
    areaOuter.exit().remove();
  }

  var intersectList = [];
  for(var key in state.mainWinos){
    intersectList.push({id: state.mainWinos[key].get('id'), inter: generateIntersections(intersectionDatas[state.mainWinos[key].get('id')])});
  }
  manageIntersections(intersectList);

  //Manages the anchor winos after the circles so we can click on it
  var g = d3.select('#inside').selectAll('.anchor');
  var anchor = g.selectAll('.anchorCircle').data(state.anchorWinos, function(anchor) { return anchor.get('id') });
  //ENTER
  anchor.enter().append('circle')
              .on("click", function(wino) { state.setMainWino(wino.get('id')) })
              .attr("class", "anchorCircle")
              .attr("r", 10)
              .style("opacity", 1);
  //ENTER & UPDATE
  anchor.attr("id", function(wino) { return "anchor"+wino.get('id') })
        .attr("cx", function(wino) { return wino.get('x') })
        .attr("cy", function(wino) { return wino.get('y') })
  //EXIT
  anchor.exit().remove();


}

/**
* Draw the intersections of the area circles on the screen
* /!\ Warning! The of the winos may corrupt the intersections : process in order of the X datas.
* TODO: manage the order of the datas
* @param intersectionPoints array the intersections datas.
*/
function manageIntersections(intersectionPoints){
  if(intersectionPoints){
    var currentColor = -1;
    //Outer area
    var g = d3.select('#inside').selectAll('.intersection');
    console.log('---');
    var intersection = g.selectAll('.intersectionArea').data(intersectionPoints, function(d) { console.log(d.id);return d.id });

    //ENTER
    intersection.enter().append('path')
                        .attr('class','intersectionArea');

    //ENTER & UPDATE
    intersection.attr('d', function(d) {
            return "M" + d.inter[2][1] + "," + d.inter[2][3] + "A" + d.inter[3] + "," + d.inter[3] +
              " 0 0,1 " + d.inter[0][0] + "," + d.inter[0][2] + "A" + d.inter[4] + "," + d.inter[4] +
              " 0 0,1 " + d.inter[1][0] + "," + d.inter[1][2] + "A" + d.inter[5] + "," + d.inter[5] +
              " 0 0,1 " + d.inter[2][1] + "," + d.inter[2][3];})
        .style('opacity', OPACITY.INTERSECTION)
        .style('fill', function(d){
          currentColor++; return COLORS[currentColor];
        });

    //EXIT
    intersection.exit().remove();
  }
}

/**
* Manage the Z-index of the elements to make the ones behind clickable
*/
function managePriority(state){
  for(var key in state.mainWinos){
    const wino = state.mainWinos[key];
    var sel = d3.select(".main"+wino.get('id'))
    sel.moveToFront();
  }
}

/** Generate the intersections data for given circles data
* @param intersectionDatas array datas of differents circles for one main wino.
*/
function generateIntersections(intersectionDatas){
  var x = [], y = [], r = [];
  for(var i=0;i<3;i++){
    x[i] = intersectionDatas['x'][i];
    y[i] = intersectionDatas['y'][i];
    r[i] = intersectionDatas['r'][i];
    //console.log('x : '+x[i]+' y : '+y[i]+' r : '+r[i]);
  }
  var interPoints = [];
  interPoints[0] = intersection(x[0], y[0], r[0], x[1], y[1], r[1]);
  interPoints[1] = intersection(x[1], y[1], r[1], x[2], y[2], r[2]);
  interPoints[2] = intersection(x[0], y[0], r[0], x[2], y[2], r[2]);

  //We need to send the radius data too
  interPoints[3] = r[0];
  interPoints[4] = r[1];
  interPoints[5] = r[2];

  //If there is an intersection
  if(interPoints[0] && interPoints[1] && interPoints[2]){
    return interPoints;
  }
  return false;
}


//http://stackoverflow.com/questions/33330074/d3-js-detect-intersection-area
function intersection(x0, y0, r0, x1, y1, r1) {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;

  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  dx = x1 - x0;
  dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  d = Math.sqrt((dy * dy) + (dx * dx));

  /* Check for solvability. */
  if (d > (r0 + r1)) {
    /* no solution. circles do not intersect. */
    return false;
  }
  if (d < Math.abs(r0 - r1)) {
    /* no solution. one circle is contained in the other */
    return false;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.  
   */

  /* Determine the distance from point 0 to point 2. */
  a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);

  /* Determine the coordinates of point 2. */
  x2 = x0 + (dx * a / d);
  y2 = y0 + (dy * a / d);

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  h = Math.sqrt((r0 * r0) - (a * a));

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  rx = -dy * (h / d);
  ry = dx * (h / d);

  /* Determine the absolute intersection points. */
  var xi = x2 + rx;
  var xi_prime = x2 - rx;
  var yi = y2 + ry;
  var yi_prime = y2 - ry;

  return [xi, xi_prime, yi, yi_prime];
}


/**
* Allow to count D3 selections
*/
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

/**
* Allow to move a d3 element to front
*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
