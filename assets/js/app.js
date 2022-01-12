var svgWidth = 1000;
var svgHeight = 800;

var margin = {
  top: 20,
  right: 20,
  bottom: 120,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
// // Initial Params
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}


// function used for updating x-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
    d3.max(stateData, d => d[chosenYAxis]) * 1.1
  ])
  .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles text group with a transition to
// new circle text
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age: ";
  }
  else if (chosenXAxis === "income") {
    xlabel = "Household Income: ";
  }
  else {
    xlabel = " ";
  };

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "obesity") {
    ylabel = "Obesity: ";
  }
  else if (chosenYAxis === "smokes")  {
    ylabel = "Smokes: ";
  }
  else {
    ylabel = " ";
  };;

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("color", "white")
    .style("font-weight", "bold")
    .style("padding", "10px")
    .html(function(d) {
      var toolTipText;
      if (chosenXAxis === "poverty"){
        toolTipText = `${d.state}<br>${ylabel} ${d[chosenYAxis]}% <br>${xlabel} ${d[chosenXAxis]}% `;
      }
      else if (chosenXAxis === "income"){
        toolTipText = `${d.state}<br>${ylabel} ${d[chosenYAxis]}% <br>${xlabel} $${d[chosenXAxis]}`;
      }
      else{
        toolTipText = `${d.state}<br>${ylabel} ${d[chosenYAxis]}% <br>${xlabel} ${d[chosenXAxis]}`;
      }
      return toolTipText;
    });
    

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    d3.select(this)
    .style('stroke', 'black')
    .style('stroke-width', '3px');
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
      d3.select(this).style('stroke', 'white')
      .style('stroke-width', '1px');
    });

  return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, err) {
  if (err) throw err;

  // parse data
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });
  

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);
  // yLinearScale function above csv import
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "#03a5fc")
    .attr("opacity", "0,8")
    .style("stroke", "white");

  // Add label to each circle
  var textGroup = chartGroup.selectAll("textCircle")
    .data(stateData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis])*1.01)
    .text(d => d.abbr)
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("font-family", "Arial")
    .style("font-weight", "bold")
    .style("font-size", "0.9em");

  // Create group for the x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .style("font-weight", "bold")
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .style("font-weight", "bold")
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 75)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .style("font-weight", "bold")
    .text("Household Income (Median)");

  // Create group for the y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var obesityLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  .style("font-weight", "bold")
  .text("Obese (%)");

var smokesLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "2.50em")
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  .style("font-weight", "bold")
  .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "4em")
  .attr("value", "healthcare") // value to grab for event listener
  .classed("active", true)
  .style("font-weight", "bold")
  .text("Lacks Healthcare (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates the text in the circles
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });


   // y axis labels event listener
   yLabelsGroup.selectAll("text")
   .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // updates y scale for new data
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x and y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates the text in the circles
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
         obesityLabel
           .classed("active", true)
           .classed("inactive", false);
         smokesLabel
           .classed("active", false)
           .classed("inactive", true);
         healthcareLabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else if (chosenYAxis === "smokes") {
        obesityLabel
           .classed("active", false)
           .classed("inactive", true);
         smokesLabel
           .classed("active", true)
           .classed("inactive", false);
         healthcareLabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else {
        obesityLabel
           .classed("active", false)
           .classed("inactive", true);
        smokesLabel
           .classed("active", false)
           .classed("inactive", true);
        healthcareLabel
           .classed("active", true)
           .classed("inactive", false);
       }

     }
    });

}).catch(function(error) {
  console.log(error);
});
