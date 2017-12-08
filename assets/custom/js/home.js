$('document').ready(function() {
  renderDeathsVsOwnership();
});

function renderDeathsVsOwnership() {
  var w = 725,
      h = 525,
      margin = {top: 20, right: 20, bottom: 30, left: 60},
      svg = d3.select("#foo").append('svg')
             //better to keep the viewBox dimensions with variables
            .attr("viewBox", "0 0 " + (w) + " " + (h) )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr('width', w)
            .attr('height', h),
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y-%m");

  var x = d3.scaleTime()
      .rangeRound([0, width]);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var line = d3.line()
      .x(function(d) {  return x(parseTime(d.key)); })
      .y(function(d) {  return y(d.value.checks); });

  d3.csv("data/ancillary/nics_background_checks.csv", function(d) {
    d.totals = +d.totals;
    return d;
  }, function(error, data) {
    if (error) throw error;

    let nested_data = d3.nest()
        .key(function(d) { return d.month; })
        .rollup(function(v) { return {
          checks: d3.sum(v, function(d) { return d.totals; })
        }; })
        .entries(data);

    x.domain(d3.extent(nested_data, function(d) { return parseTime(d.key); }));
    y.domain(d3.extent(nested_data, function(d) { return d.value.checks; }));

    console.warn(nested_data);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    g.append("path")
        .datum(nested_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
  });
}