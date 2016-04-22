import {List, Map} from 'immutable';

const OPACITY = {
  INNERAREA: 0.05,
  OUTERAREA: 0.05,
  INTERSECTION: 0.25
};

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
    //console.log(coord);
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
      var circle = d3.select("#inside").append("circle")
                                        .attr("id", "marker")
                                        .attr("cx", -500)
                                        .attr("cy", -500)
                                        .attr("r", 15);
      var indicatorOne = d3.select("#inside").append("circle")
                                              .attr("class", "cursor")
                                              .attr("id", "i1")
                                              .attr("cx", 0)
                                              .attr("cy", 0)
                                              .attr("r", 0);
      var indicatorTwo = d3.select("#inside").append("circle")
                                              .attr("id", "i2")
                                              .attr("class", "cursor")
                                              .attr("cx", 0)
                                              .attr("cy", 0)
                                              .attr("r", 0);

      //append the number of sensors we have. Currently it is fixed as 3.
      for(var i=1;i<=3;i++){
        //Draw the sensor point
        d3.select("#inside").append("circle")
                            .attr("id", "sensor"+i)
                            .attr("class", "sensor")
                            .attr("cx", -5)
                            .attr("cy", -5)
                            .attr("r", 3);
        //Draw the sensor inner area
        d3.select("#inside").append("circle")
                            .attr("id", "sensorOuterArea"+i)
                            .attr("class", "innerArea")
                            .attr("cx", -5)
                            .attr("cy", -5)
                            .attr("r", 0);

        //Draw the sensor outer area
        d3.select("#inside").append("circle")
                            .attr("id", "sensorInnerArea"+i)
                            .attr("class", "outerArea")
                            .attr("cx", -5)
                            .attr("cy", -5)
                            .attr("r", 0);
      }
      //Form for the intersection of the circles above
      d3.select("#inside").append("g")
                          .append("path")
                          .attr("id", "intersection");

      //Draw the diagonal to make it visible later, to help to place the second point when using scale tool.
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

  updateD3Chart(el, state);
};

//Update the elements depending of the state.
export const updateD3Chart = function(el, state) {

  //Circle or Point mode
  if(state.options.get('precisionMode') == 'point'){
    //Point mode
    if(state.mainWino != undefined){
      //If we have the winos datas
      d3.select('#marker').transition()
                          .attr('cx', state.mainWino.get('x'))
                          .attr('cy', state.mainWino.get('y'))
                          .attr('r', 15)
                          .style("opacity",1);
    }

    //Clear the Circle mode elements
    for(var i=1;i<=3;i++){
      d3.select('#sensor'+i).transition().style("opacity",0);
      d3.select('#sensorInnerArea'+i).transition().style("opacity",0).attr('r', 0);
      d3.select('#sensorOuterArea'+i).transition().style("opacity",0).attr('r', 0);
    }
    d3.select('#intersection').transition().style("opacity",0);

  }else{
    //Circle mode
    if(state.mainWino != undefined){
      d3.select('#intersection').transition().style("opacity",0);
      //If we have the winos datas
      
      //Store the datas of each circle to generate the intersection.
      var x = [];
      var y = [];
      var rOuter = [];
      var rInner = [];

      //Place a blue circle for each Sensors winos
      //WARNING : we suppose the main wino to be the first one
      for(var i=0;i<state.winos.size;i++){
        if(state.winos.get(i).get('main') != true){

          //get the datas
          x[i] = state.winos.get(i).get('x');
          y[i] = state.winos.get(i).get('y')
          rOuter[i] = state.winos.get(i).get('radius')+state.scaledPrecision;
          rInner[i] = state.winos.get(i).get('radius')-state.scaledPrecision;

          //If it isn't the main wino, update the point and area
          d3.select('#sensor'+i).transition()
                                .attr('cx', x[i])
                                .attr('cy', y[i])
                                .attr('r', 3)
                                .style("opacity",1);

          //Warning, is only translated by the X ratio
          d3.select('#sensorInnerArea'+i).transition()
                                        .attr('cx', x[i])
                                        .attr('cy', y[i])
                                        .attr('r', rInner[i])
                                        .style("opacity", OPACITY.INNERAREA);
          d3.select('#sensorOuterArea'+i).transition()
                                        .attr('cx', x[i])
                                        .attr('cy', y[i])
                                        .attr('r', rOuter[i])
                                        .style("opacity", OPACITY.OUTERAREA);
      }
    }

    //intersection circle
    var interPoints1 = intersection(x[1], y[1], rOuter[1], x[2], y[2], rOuter[2]);
    var interPoints2 = intersection(x[2], y[2], rOuter[2], x[3], y[3], rOuter[3]);
    var interPoints3 = intersection(x[1], y[1], rOuter[1], x[3], y[3], rOuter[3]);
    if(interPoints1 && interPoints2 && interPoints3){
      d3.select("#intersection")
          .transition()
          .attr("d", function() {
              return "M" + interPoints3[1] + "," + interPoints3[3] + "A" + rOuter[1] + "," + rOuter[1] +
                " 0 0,1 " + interPoints1[0] + "," + interPoints1[2] + "A" + rOuter[2] + "," + rOuter[2] +
                " 0 0,1 " + interPoints2[0] + "," + interPoints2[2] + "A" + rOuter[3] + "," + rOuter[3] +
                " 0 0,1 " + interPoints3[1] + "," + interPoints3[3];
            })
          .style("opacity", OPACITY.INTERSECTION);
          }
    }

    //Clear the Point mode elements
    d3.select('#marker').transition().style("opacity",0);
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
