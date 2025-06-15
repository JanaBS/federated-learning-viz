<template>
    <div class="summary-box">
      <h2>Resumo do Processo</h2>
      <div v-if="summary">
        <p><strong>Total de clientes:</strong> {{ summary.total_clients }}</p>
        <p><strong>Total de rounds:</strong> {{ summary.total_rounds }}</p>
        <p><strong>Clientes por round:</strong> {{ summary.min_clients_per_round }} - {{ summary.max_clients_per_round }}</p>
        <p><strong>amostras:</strong> {{ summary.min_samples }} - {{ summary.max_samples }}</p>
        <p><strong>Clusters:</strong> {{ summary.min_clusters }} - {{ summary.max_clusters }}</p>
        <p><strong>Tempo médio de treinamento:</strong> {{ summary.avg_training_time }}</p>
      </div>
      <div v-else>
        <p>Carregando resumo...</p>
      </div>
    </div>
  </template>
  
  <script>
import { formatMonetData } from '@/utils';
  export default {
    name: "FederatedSummary",
    props: {
      selectedClients: {
        type: Array,
        default: () => []
      },
      selectedRounds: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        summary: null
      };
    },
    watch: {
      selectedClients: "fetchSummary",
      selectedRounds: "fetchSummary"
    },
    mounted() {
      this.fetchSummary();
    },
    methods: {
      fetchSummary() {
        let url = "http://localhost:3001/api/summary";
  
        const params = [];
        if (this.selectedClients.length > 0) {
          params.push(`clients=${this.selectedClients.join(",")}`);
        }
        if (this.selectedRounds.length > 0) {
          params.push(`rounds=${this.selectedRounds.join(",")}`);
        }
        if (params.length > 0) {
          url += "?" + params.join("&");
        }
  
        fetch(url)
          .then(res => res.json())
          .then(raw => {
            const data = formatMonetData(raw);
            this.summary = data[0];
            console.log(this.summary)
          })
          .catch(err => {
            console.error("Erro ao buscar resumo:", err);
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .summary-box {
    background-color: #fff;
    padding: 16px;
    min-width: 200px;
    border: 1px solid #ddd;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
  }
  .summary-box h2 {
    font-size: 16px;
    margin-bottom: 10px;
  }
  .summary-box p {
    margin: 4px 0;
  }
  </style>