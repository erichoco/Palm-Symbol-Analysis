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

var isSelectingVert = false;
var selectedVertData = undefined;
var vertDist = 0;

function drawSymbol(dataset) {

    // don't want dots overlapping axis, so add in buffer to data domain
    // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    xScale.domain([scaleMin-10, scaleMax+10]);
    yScale.domain([scaleMin-10, scaleMax+10]);
    // xScale.domain([0, 100]);
    // yScale.domain([0, 100]);

    // x-axis
    svg.select(".x.axis").transition().call(xAxis);

    // y-axis
    svg.select(".y.axis").transition().call(yAxis);

    svg.selectAll("g.tick line")
        .style("stroke", "lightgrey");

    // draw legend
    var legend = svg.selectAll(".legend")
            .data(dataset);

    legend.enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
            .call(function(selection) {
                // draw legend colored rectangles
                selection.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d, i) {
                        return color(i);
                    });
                // draw legend text
                selection.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) { return d.trial;});
            });

    legend.exit().remove();
    legend.select("text")
        .text(function(d) { return d.trial;});


    // draw dots
    var symbol = svg.selectAll(".symbol")
            .data(dataset);

    symbol.enter().append("g")
            .attr("class", "symbol");
    symbol.exit().remove();


    var dots = symbol.selectAll(".dot")
            .data(function(d) {
                return d.coord;
            });

    dots.enter().append("circle")
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
                d3.select(this).transition().attr("r", 7);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                     .duration(500)
                     .style("opacity", 0);
                var self = d3.select(this);
                if (!self.classed("clicked")) {
                    d3.select(this).transition().attr("r", 3.5);
                }
            })
            .on("click", function(d, i, j) {
                if (isSelectingVert) {
                    var self = d3.select(this);
                        self.classed("clicked", true);

                    var parent = d3.select(this.parentNode);
                    parent.append("circle")
                        .attr("class", "shape-vert")
                        .attr("r", 3)
                        .attr("cx", xMap(d))
                        .attr("cy", yMap(d))
                        .style('fill', '#760000');

                    // one vertex is already selected
                    if (selectedVertData) {
                        var lineDist = (Math.sqrt(
                            Math.pow((d.x - selectedVertData.x),2)+
                            Math.pow((d.y - selectedVertData.y),2)));
                        vertDist += lineDist;
                        console.log(vertDist);
                        var line = parent.append("line")
                            .attr("class", "shape-vert")
                            .attr("x1", xMap(d))
                            .attr("y1", yMap(d))
                            .attr("x2", xMap(selectedVertData))
                            .attr("y2", yMap(selectedVertData))
                            .style("stroke", "#760000")
                            .style("stroke-width", "3px")
                            .on("mouseover", function() {
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                tooltip.html(lineDist.toFixed(2) + "mm")
                                    .style("left", (d3.event.pageX + 5) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                            })
                            .on("mouseout", function() {
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0);
                            });

                        selectedVertData = undefined;
                    }
                    // select now vertex
                    else {
                        selectedVertData = d;
                    }
                }
            });

    dots.exit().remove();
    dots.attr("cx", xMap).attr("cy", yMap);

    symbol.each(function(d, i) {
        d3.select(this).selectAll(".dot")
            .style("fill", function() { return color(i);});
    });
}

function drawDiff(dataset) {
    var sample = svg.selectAll('.sample')
            .data(dataset);

    sample.enter().append('g')
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

    sample.exit().remove();
}

function clearVert() {
    var symbol = svg.selectAll('.symbol');
    symbol.selectAll('.shape-vert').remove();
    symbol.selectAll('.clicked')
        .classed('clicked', false)
        .transition()
        .attr('r', 3.5);
    vertDist = 0;
}

function calArea() {
    var polygons = [];
    var polyArea = [];
    for (var i = 0, len = symbols.length; i < len; i++) {
        var vertices = [];
        for (var j = 0, len2 = symbols[i].coord.length; j < len2; j++) {
            vertices.push([symbols[i].coord[j].x, symbols[i].coord[j].y]);
        }

        var poly = d3.geom.polygon(vertices);
        polygons.push(poly);
        polyArea.push(poly.area());
    }
    return polyArea;
}
