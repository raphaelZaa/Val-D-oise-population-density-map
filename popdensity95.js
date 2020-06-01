/* ----------------------------------------------------------------------------
File: popdensity95.js
Contructs a density map of communes from Val D'oise, France using D3
-----------------------------------------------------------------------------*/
/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */
/*global topojson */

//Credit to Mike Bostock for his California Population Density Code: https://bl.ocks.org/mbostock/5562380
//Credit to Mike Adam Janes for his Choropleth V5 Code: https://bl.ocks.org/adamjanes/6cf85a4fd79e122695ebde7d41fe327f
//Credit to Gregoire David for the geojson file: https://github.com/gregoiredavid/france-geojson
//Credit to Wikipedia and the INSEE for the desity per commune: https://fr.wikipedia.org/wiki/Liste_des_communes_du_Val-d%27Oise https://www.insee.fr/fr/statistiques/2011101?geo=DEP-95
//thanks to mygeodata for the conversion from geojson to topojson: https://mygeodata.cloud/


var width = 1100,
    height = 960,
    svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var popDensity = d3.map();

var projection = d3.geoAlbers()
    .scale( 90000 )
    .rotate( [0,0] )
    .center( [0, 42.313] )
    .translate( [-width*1.5,height*11.5] );
var path = d3.geoPath().projection(projection);

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleQuantize([1, 1000], d3.schemeBlues[9])

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
  d3.csv("stats2.csv", function(d) { popDensity.set(d.nom, +d.val); })
]

Promise.all(promises).then(ready)

function ready([vd]) {
   var communes = topojson.feature(vd, vd.objects.communes95)
   svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(communes.features)
    .enter().append("path")
      .attr("stroke", 'black')
      .attr("fill", function(d) {return color(d.val = popDensity.get(d.properties.nom)); })
      .attr("d", path)
    .append("title")
      .text(function(d) {return d.properties.nom; });

  svg.append("path")
      .datum(topojson.mesh(vd, vd.objects.communes95.geometries, function(a, b) { return a !== b; }))
      .attr("class", "communes")
      .attr("d", path);
}
