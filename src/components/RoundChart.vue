<template>
    <div ref="chartContainer"></div>
  </template>
  
  <script>
  import * as d3 from "d3";
  
  export default {
    name: "FederatedLearningGraph",
    mounted() {
      this.drawChart();
    },
    methods: {
      drawChart() {
        const rounds = [0, 1, 2, 3, 4, 5];
        const clients = ['clientA', 'clientB', 'clientC', 'clientD', 'clientE'];
  
        const participation = {
          clientA: [0, 1, 2],
          clientB: [1, 2, 3, 4],
          clientC: [2, 3, 4, 5],
          clientD: [0],
          clientE: [3, 4]
        };
  
        const width = 300;//deixar isso dinâmico de acordo com a quantidade de rounds
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 40, left: 100 };
        const roundSpacing = 10;
        const nodeRadius = 4;
  
        const svg = d3.select(this.$refs.chartContainer)
          .append("svg")
          .attr("width", width)
          .attr("height", height);
  
        const xScale = d3.scalePoint()
          .domain(rounds)
          .range([margin.left, width - margin.right]);
  
        const yScale = d3.scalePoint()
          .domain(clients)
          .range([margin.top, height - margin.bottom]);
  
        svg.selectAll(".round-rect")
          .data(rounds)
          .enter()
          .append("rect")
          .attr("x", d => xScale(d) - roundSpacing / 2)
          .attr("y", margin.top - 20)
          .attr("width", roundSpacing)
          .attr("height", height - margin.top - margin.bottom + 40)
          .attr("fill", "#f0f0f0")
          .attr("stroke", "#ccc");
  
        clients.forEach(client => {
          const roundsParticipated = participation[client];
          const points = roundsParticipated.map(r => ({
            round: r,
            x: xScale(r),
            y: yScale(client)
          }));
  
          svg.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "#999")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
              .x(d => d.x)
              .y(d => d.y)
            );
  
          points.forEach((p, i) => {
            const isFirst = i === 0;
            const isLast = i === points.length - 1;
            let color = "black";
            if (isFirst) color = "blue";
            if (isLast) color = "red";
  
            svg.append("circle")
              .attr("cx", p.x)
              .attr("cy", p.y)
              .attr("r", nodeRadius)
              .attr("fill", color)
              .attr("stroke", "#fff")
              .attr("stroke-width", 1.5);
          });
        });
  
        svg.selectAll(".round-label")
          .data(rounds)
          .enter()
          .append("text")
          .attr("x", d => xScale(d))
          .attr("y", margin.top - 25)
          .attr("text-anchor", "middle")
          .text(d => `${d}`)
          .attr("font-size", 12)
          .attr("fill", "#333");
  
        svg.selectAll(".client-label")
          .data(clients)
          .enter()
          .append("text")
          .attr("x", margin.left - 10)
          .attr("y", d => yScale(d))
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "middle")
          .text(d => d)
          .attr("font-size", 12)
          .attr("fill", "#333");
      }
    }
  };
  </script>
  
  <style scoped>
  /* opcional: estilos adicionais */
  </style>
  