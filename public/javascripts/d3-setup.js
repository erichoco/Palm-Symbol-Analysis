var margin = {top: 20, right: 20, bottom: 40, left: 40},
    // width = $('#chart').width() - margin.left - margin.right,
    width = 600 - margin.right - margin.left;
    height = 600 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.x;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10).tickSize(-width, 0, 0);

// setup y
var yValue = function(d) { return d.y;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickSize(-height, 0, 0);

// setup scale domain
var scaleMax = -100,
    scaleMin = 100;

// setup fill color
var cValue = function(d, i, j) { return j;},
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

var diffLine = d3.svg.line()
    .x(function(d) { return xMap(d);})
    .y(function(d) { return yMap(d);})
    .interpolate('basis');

xScale.domain([scaleMin-10, scaleMax+10]);
yScale.domain([scaleMin-10, scaleMax+10]);

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

function drawSymbol(dataset) {

    // don't want dots overlapping axis, so add in buffer to data domain
    // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    xScale.domain([scaleMin-10, scaleMax+10]);
    yScale.domain([scaleMin-10, scaleMax+10]);

    // x-axis
    svg.select(".x.axis").transition().call(xAxis);

    // y-axis
    svg.select(".y.axis").transition().call(yAxis);

    svg.selectAll("g.tick line")
        .style("stroke", "lightgrey");

    // draw legend
    var legend = svg.selectAll(".legend")
            .data(dataset)
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {
            return color(i);
        });

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d.trial;});

    // draw dots
    var symbol = svg.selectAll(".symbol")
            .data(dataset)
        .enter().append("g")
            .attr("class", "symbol");

    symbol.selectAll(".dot")
            .data(function(d) {
                return d.coord;
            })
        .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
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
    symbol.each(function(d, i) {
        d3.select(this).selectAll(".dot")
            .style("fill", function() { return color(i);});
    });
}

function drawDiff(dataset) {
    var sample = svg.selectAll('.sample')
            .data(dataset)
        .enter().append('g')
            .attr('class', 'sample');

    sample.selectAll('.sample-dot')
            .data(function(d) { return d;})
        .enter().append('circle')
            .attr('class', 'sample-dot')
            .attr('r', 2)
            .attr('cx', xMap)
            .attr('cy', yMap)
            .style('fill', '#760000')
            .style('opacity', 0.6)
    sample.append('path')
            .attr('d', diffLine)
            .style('stroke', '#760000');
}
