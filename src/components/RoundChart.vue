<template>
    <div ref="chartContainer" class="chart-scroll-container"></div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { formatMonetData } from '@/utils';
  export default {
    name: "FederatedLearningGraph",
    mounted() {
      fetch('http://localhost:3001/api/clientRounds')
    .then(res => res.json())
    .then(raw => {
      const data = formatMonetData(raw);
      this.participationData = data;
      this.drawChart();
    })
    .catch(err => console.error('Erro ao buscar dados:', err));
    },

    methods: {
      drawChart() {
      const rawData = this.participationData;

//  Extrai uma lista única de rounds e de clientes
    const rounds = [...new Set(rawData.map(d => d.round_number))].sort((a, b) => a - b);
    const clients = [
        'server',
        ...[...new Set(rawData.filter(d => d.type === 'client').map(d => d.client_id))]
];

    // Mapeia participações
    const participation = {};
    clients.forEach(client => {
      participation[client] = rawData
        .filter(d => d.client_id === client)
        .map(d => d.round_number);
    });

    //conta a quantidade de clientes por round
    const roundParticipationCount = {};
    rawData.forEach(d => {
        if (!roundParticipationCount[d.round_number]) {
          roundParticipationCount[d.round_number] = 0;
        }
        roundParticipationCount[d.round_number]++;

    });

        const width = 690; 
        const height = 290;
        const margin = { top: 40, right: 40, bottom: 40, left: 100 };
        const roundSpacing = 20;
        const nodeRadius = 4.5;
        const totalWidth = margin.right + margin.left + clients.length * 28; // se adápta de acordo com a quantidade de clientes
        const totalHeight = margin.top + margin.bottom + rounds.length * 28; //se adápta de acordo com a quantidade de rounds

  
        //container onde o round chart será adicionado
        const svg = d3.select(this.$refs.chartContainer)
          .append("svg")
          .attr("width", width)
          .attr("height", height);
  
          const xScale = d3.scalePoint()
            .domain(clients)
            .range([margin.left, totalWidth - margin.right])
            .padding(1);

          const yScale = d3.scalePoint()
            .domain(rounds)
            .range([margin.top, totalHeight - margin.bottom]) // totalHeight será calculado
            .padding(0.3);


        rounds.forEach(round => {
          const y = yScale(round) - roundSpacing / 2;

        //retângulo de tamanho fixo  
        svg.append("rect")
          .attr("x", margin.left - 10)
          .attr("y", y)
          .attr("width", width > totalWidth ? (width - margin.left) : (totalWidth - margin.left))
          .attr("height", roundSpacing)
          .attr("fill", "#fff")
          .attr("stroke", "#000")
          .attr("stroke-width", 1);

        svg.append("rect")
          .attr("x", margin.left)
          .attr("y", y)
          .attr("width", margin.left, totalWidth - margin.right)
          .attr("height", roundSpacing)
          .attr("fill", "#fff")
          .attr("stroke", "#000")
          .attr("stroke-width", 0.8);
        });
  
        clients.forEach(client => {
        const roundsParticipated = participation[client];
        const points = roundsParticipated.map(r => ({
          round: r,
          x: xScale(client),
          y: yScale(r)
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
          let color = "white";
          if (isFirst) color = "blue";
          if (isLast) color = "red";
          let strokeColor = "black";
          if (isFirst || isLast) strokeColor = "gray";

          if (client === 'server') {
            const rect = svg.append("rect")
              .attr("x", p.x - nodeRadius)
              .attr("y", p.y - nodeRadius)
              .attr("width", nodeRadius * 2)
              .attr("height", nodeRadius * 2)
              .attr("fill", "white")
              .attr("stroke", "black")
              .attr("stroke-width", 0.3);
              rect.append("title").text(`${client}`);
          } else {
            const circle = svg.append("circle")
              .attr("cx", p.x)
              .attr("cy", p.y)
              .attr("r", nodeRadius)
              .attr("fill", color)
              .attr("stroke", strokeColor)
              .attr("stroke-width", 1.5)

            circle.append("title").text(`Client ${client}`);
          }
        });
      });
      
  
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
        .attr("font-family", "sans-serif")
        .attr("fill", "#333");
        
      }
    }
  };
  </script>
  <style>
    .chart-scroll-container {
    max-height: 300px;
    max-width: 700px;
    overflow-y: auto;
    border: 1px solid #ccc;
  }
</style>
  
  