

<template>
  <div ref="chartContainer" class="chart-scroll-container"></div>
</template>

<script>
import * as d3 from "d3";
import { formatMonetData } from "@/utils";

export default {
  name: "FederatedLearningGraph",
  data() {
    return {
      participationData: [],
      selectedPoints: []
    };
  },
  mounted() {
    fetch("http://localhost:3001/api/clientRounds")
      .then(res => res.json())
      .then(raw => {
        const data = formatMonetData(raw);
        this.participationData = data;
        this.drawChart();
      })
      .catch(err => console.error("Erro ao buscar dados:", err));
  },
  methods: {
    drawChart() {
      console.log(this.participationData)
      const rawData = this.participationData;

const rounds = [...new Set(
      rawData.map(d => d.round_number)
    )].sort((a, b) => a - b);
      const clients = [
        "server",
        ...[...new Set(rawData.filter(d => d.type === "client").map(d => d.client_id))]
      ];

      const participation = {};
      clients.forEach(client => {
        participation[client] = rawData
          .filter(d => d.client_id === client)
          .map(d => d.round_number);
      });

      const margin = { top: 40, right: 40, bottom: 40, left: 100 };
      const nodeRadius = 4.5;
      const totalWidth = 700;
      const totalHeight = margin.top + margin.bottom + rounds.length * 40;
      const width = totalWidth;
      const height = totalHeight;

      const svg = d3.select(this.$refs.chartContainer)
        .html("") // limpa antes de redesenhar
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const xScale = d3.scalePoint()
        .domain(clients)
        .range([margin.left, totalWidth - margin.right])
        .padding(1);

      const yScale = d3.scalePoint()
        .domain(rounds)
        .range([margin.top, totalHeight - margin.bottom])
        .padding(0.3);

      // Retângulos horizontais por round
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

      clients.forEach(client => {
        const roundsParticipated = participation[client] || [];

        // Detecta blocos contínuos
        const blocks = [];
        let currentBlock = [];

        roundsParticipated.sort((a, b) => a - b).forEach((r, i, arr) => {
          if (i === 0 || r === arr[i - 1] + 1) {
            currentBlock.push(r);
          } else {
            blocks.push(currentBlock);
            currentBlock = [r];
          }
        });
        if (currentBlock.length > 0) blocks.push(currentBlock);

        // Mapeia status de entrada e saída
        const roundStatus = {};
        blocks.forEach(block => {
          const first = block[0];
          const last = block[block.length - 1];
          roundStatus[first] = "return";
          roundStatus[last] = "drop";
        });

        const points = roundsParticipated.map(r => ({
          round: r,
          x: xScale(client),
          y: yScale(r),
          status: roundStatus[r]
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

        points.forEach(p => {
          const isSelected = this.selectedPoints.some(sel => sel.client === client && sel.round === p.round);
          let color = "white";
          if (p.status === "return") color = "blue";
          if (p.status === "drop") color = "red";
          let strokeColor = isSelected ? "black" : "gray";

          if (client === 'server') {
            svg.append("rect")
              .attr("x", p.x - nodeRadius)
              .attr("y", p.y - nodeRadius)
              .attr("width", nodeRadius * 2)
              .attr("height", nodeRadius * 2)
              .attr("fill", isSelected ? "#ffd700" : color)
              .attr("stroke", strokeColor)
              .attr("stroke-width", isSelected ? 2 : 0.5)
              .on("click", () => this.toggleSelection(client, p.round));
          } else {
            svg.append("circle")
              .attr("cx", p.x)
              .attr("cy", p.y)
              .attr("r", isSelected ? nodeRadius + 1 : nodeRadius)
              .attr("fill", isSelected ? "#ffd700" : color)
              .attr("stroke", strokeColor)
              .attr("stroke-width", isSelected ? 2.5 : 1.5)
              .on("click", () => this.toggleSelection(client, p.round));
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
        .attr("font-family", "serif")
        .attr("fill", "#333");
    },

    toggleSelection(client, round) {
      const index = this.selectedPoints.findIndex(p => p.client === client && p.round === round);
      if (index !== -1) {
        this.selectedPoints.splice(index, 1);
      } else {
        this.selectedPoints.push({ client, round });
      }

      this.$emit("updateSelection", {
        clients: this.selectedPoints.map(p => p.client),
        rounds: this.selectedPoints.map(p => p.round)
      });

      this.drawChart();
    }
  }
};
</script>

<style>
.chart-scroll-container {
  max-height: 350px;
  max-width: 700px;
  overflow: auto;
  border: 1px solid #ccc;
}
</style>


