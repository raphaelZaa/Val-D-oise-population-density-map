/* ----------------------------------------------------------------------------
File: popdensity95.js
Contructs a density map of communes from Val D'oise, France using D3
-----------------------------------------------------------------------------*/
/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */

//Credit to Mike Bostock for his California Population Density Code: https://bl.ocks.org/mbostock/5562380
//Credit to Mike Adam Janes for his Choropleth V5 Code: https://bl.ocks.org/adamjanes/6cf85a4fd79e122695ebde7d41fe327f
//Credit to Gregoire David for the geojson file: https://github.com/gregoiredavid/france-geojson
//Credit to bien-dans-ma-ville.fr for the desity per commune: https://www.bien-dans-ma-ville.fr/classement-ville-densite-val-doise/
//thanks to mygeodata for the conversion from geojson to topojson: https://mygeodata.cloud/


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var popDensity = d3.map();


var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Density of people per kilometer squared");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();

var promises = [
  d3.json("communes-95.topojson"),
  d3.tsv("stats.tsv", function(d) { popDensity.set(d.id, +d.rate); })
]

Promise.all(promises).then(ready)

function ready([vd]) {
   var communes = topojson.feature(vd, vd.objects.communes95)
   svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(communes.features)
    .enter().append("path")
      .attr("fill", function(d) { return color(d.rate = popDensity.get(d.id)); })
      .attr("d", path)
    .append("title")
      .text(function(d) { return d.rate + "%"; });

  svg.append("path")
      .datum(topojson.mesh(vd, vd.objects.communes95.geometries, function(a, b) { return a !== b; }))
      .attr("class", "communes")
      .attr("d", path);
}
