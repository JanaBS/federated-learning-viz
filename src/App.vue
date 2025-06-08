<template>
  <div class="app-grid">
    <div class="summary-card">
      <FederatedSummary
        :selectedClients="selectedClients"
        :selectedRounds="selectedRounds"
       />
    </div>
    <div class="chart-card">
      <RoundChart @updateSelection="updateSelection" /> 
    </div>
        <div class="chart-card">
      <DurationChart @updateSelection="updateSelection" /> 
    </div>
  </div>
</template>

<script>
import RoundChart from './components/RoundChart.vue'
import FederatedSummary from './components/FederatedSummary.vue'
import DurationChart from './components/DurationChart.vue'

export default {
  name: 'App',
  components: { RoundChart, FederatedSummary, DurationChart },
  data() {
    return {
      selectedClients: [],
      selectedRounds: [],
    }
  },
  methods: {
    updateSelection({ clients, rounds }) {
      this.selectedClients = clients
      this.selectedRounds = rounds
    },
  },
}
</script>

<style scoped>
.app-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr; /* 1/3 + 2/3 */
  gap: 1rem;
  padding: 1rem;
}

.summary-card {
  background: #ffffff;
  border-radius: 8px;
  padding: rem;
  font-family: serif;
  font-size: 0.875rem; /* menor */
  line-height: 1.3;   /* menos espaçado */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;   /* Centraliza horizontalmente */
  align-items: center;       /* Centraliza verticalmente */           /* Ocupa toda a altura da coluna */
  
}

.chart-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Responsividade */
@media (max-width: 768px) {
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>