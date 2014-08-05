var symbols = {};

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    // width = $('#chart').width() - margin.left - margin.right,
    width = height = 600 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.x;}, // data -> value
    xScale = d3.scale.linear().domain([-100, 100]).range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10).tickSize(-width, 0, 0);

// setup y
var yValue = function(d) { return d.y;}, // data -> value
    yScale = d3.scale.linear().domain([100, -100]).range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickSize(-height, 0, 0);

// setup fill color
var cValue = function(d) { return d;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var filename0 = "tri-0.csv";
var filename1 = "tri-1.csv";

loadNewData(filename0);
loadNewData(filename1);

function loadNewData(filename) {
    // load data
    d3.csv("../data/" + filename, function(error, data) {

      // change string (from CSV) into number format
      var max = -100,
          min = 100;
      data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        if (d.x > max) max = d.x;
        if (d.x < min) min = d.x;
        if (d.y > max) max = d.y;
        if (d.y < min) min = d.y;
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
      xScale.domain([min-10, max+10]);
      yScale.domain([min-10, max+10]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("X (mm)");

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Y (mm)");

      svg.selectAll("g.tick line")
          .style("stroke", "lightgrey");

      // draw dots
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue(d));})
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("(" + xValue(d) + ", " + yValue(d) + ")")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})
    });

}