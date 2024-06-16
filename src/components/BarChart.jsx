import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3';

const BarChart = (props) => {

  const [isBusy, setBusy] = useState(true);
  const canvas = useRef();

  useEffect(() => {

    if (props.data !== undefined && props.data.length) {

      // Clear the canvas
      canvas.current.replaceChildren();

      // Prep data
      const stats = props.data;

      // Declare the chart dimensions and margins.
      const width = 600, height = 160;
      const marginTop = 20, marginRight = 20, marginBottom = 30, marginLeft = 40;

      // Declare the x (horizontal position) scale.
      const x = d3.scaleBand()
      .domain(stats.map((d) => d.term))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

      // Declare the y (vertical position) scale.
      const y = d3.scaleLinear()
      .domain([0, d3.max(stats, (d) => d.total)])
      .range([height - marginBottom, marginTop]);

      // Create the SVG container.
      const svg = d3.select("#barchart .figure")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

      // Add a rect for each bar.
      svg.append("g")
      .selectAll()
      .data(stats)
      .join("rect")
      .attr("height", 0)
      .attr("y", (d) => y(0))
      .attr("x", (d, i) => x(i))
      .attr("x", (d) => x(d.term))
      .attr("width", x.bandwidth())
      .transition()
      .duration(500)
      .attr("y", (d) => y(d.total))
      .attr("height", (d) => y(0) - y(d.total))
      .attr('fill', function (d, i) {
        return props.colormap[stats[i].term].rgba;
      });

      // Add the x-axis and label.
      svg.append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

      // Remove axis lines
      svg.selectAll("path, line").remove();

    }

    // Clean up
    return () => {
      setBusy(true);
    }

  }, [props]);

  return (
    <div id='barchart'>
      <p className='legend'>Which term(s) do you commonly use or encounter in your research planning?</p>
      <div className='figure' ref={canvas}></div>
    </div>
  );
  
}

export default BarChart;