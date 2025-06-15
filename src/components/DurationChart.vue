<template>
  <div ref="chartContainer" class="chart-scroll-container"></div>
</template>

<script>
import * as d3 from 'd3';
import { formatMonetData } from "@/utils";

export default {
  name: "DurationChart",
  data() {
    return {
      durationData: []
    };
  },
  mounted() {
    fetch("http://localhost:3001/api/trainingTimes")
      .then(res => res.json())
      .then(raw => {
        const data = formatMonetData(raw);
        this.durationData = data;
        this.drawChart();
      })
      .catch(err => console.error("Erro ao buscar dados de duracao:", err));
  },
  methods: {
    drawChart() {
      const rawData = this.durationData;
      const rounds = [...new Set(rawData.map(d => d.round))].sort((a, b) => a - b);
      const margin = { top: 40, right: 40, bottom: 40, left: 100 };
      const nodeRadius = 4.5;
      const totalWidth = 700;
      const totalHeight = margin.top + margin.bottom + rounds.length * 40;
      const width = totalWidth;
      const height = totalHeight;

 const svg = d3.select(this.$refs.chartContainer)
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(rawData, d => d.duration)])
        .range([margin.left, totalWidth - margin.right]);

      const yScale = d3.scalePoint()
        .domain(rounds)
        .range([margin.top, totalHeight - margin.bottom])
        .padding(0.3);

      rounds.forEach(round => {
        const y = yScale(round) - 15;
        svg.append("rect")
          .attr("x", margin.left - 10)
          .attr("y", y)
          .attr("width", totalWidth - margin.left)
          .attr("height", 30)
          .attr("fill", "#fff")
          .attr("stroke", "#000")
          .attr("stroke-width", 0.5);
      });

      const groupedByDuration = d3.group(rawData, d => `${d.round}-${d.duration}`);
      svg.selectAll(".duration-dot")
        .data(rawData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.duration))
        .attr("cy", d => {
          const groupKey = `${d.round}-${d.duration}`;
          const indexInGroup = groupedByDuration.get(groupKey).findIndex(item => item === d);
          return yScale(d.round) - indexInGroup * (nodeRadius * 2 + 2);
        })
        .attr("r", nodeRadius)
        .attr("fill", "#4682B4")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);

      svg.selectAll(".round-label")
        .data(rounds)
        .enter()
        .append("text")
        .attr("x", margin.left - 20)
        .attr("y", d => yScale(d))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(d => `Round ${d}`)
        .attr("font-size", 11)
        .attr("font-family", "serif")
        .attr("fill", "#333");
      
      const xAxis = d3.axisBottom(xScale)
      .ticks(5) 
      .tickFormat(d => `${d} s`);

      svg.append("g")
        .attr("transform", `translate(0, ${totalHeight - margin.bottom + 5})`)
        .call(xAxis);
    }
  }
};
</script>

<style>
.chart-scroll-container {
  max-height: 300px;
  max-width: 700px;
  overflow: auto;
  border: 1px solid #ccc;
}
</style>
