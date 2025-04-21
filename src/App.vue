<template>
  <div>
    <RoundChart
      @updateSelection="updateSelection"
    />
    <FederatedSummary
      :selectedClients="selectedClients"
      :selectedRounds="selectedRounds"
    />
  </div>
</template>

<script>
import RoundChart from './components/RoundChart.vue';
import FederatedSummary from './components/FederatedSummary.vue';
export default {
  components: { RoundChart, FederatedSummary },
  data() {
    return {
      selectedClients: [],
      selectedRounds: []
    };
  },
  methods: {
    updateSelection({ clients, rounds }) {
      this.selectedClients = clients;
      this.selectedRounds = rounds;
    }
  }
};
</script>

