const express = require('express');
const router = express.Router();
const getConnection = require('../db');

router.get('/', async (req, res) => {
  const { clients, rounds } = req.query;

  // Prepara filtros se existirem
  const clientFilter = clients ? `AND ict.client_id IN (${clients.split(',').map(c => `'${c}'`).join(',')})` : '';
  const roundFilter = rounds ? `AND ict.current_round IN (${rounds.split(',').map(r => Number(r)).join(',')})` : '';

  const query = `
    WITH base_data AS (
      SELECT
        ict.client_id,
        ict.current_round,
        CASE 
          WHEN ict.n_clusters IS NOT NULL AND ict.n_clusters <> 'None' THEN CAST(ict.n_clusters AS INTEGER)
          ELSE NULL
        END AS clusters,
        CAST(oct.training_time AS DOUBLE) AS training_time,
        CAST(iic.n_samples AS DOUBLE) AS samples
      FROM ds_iclienttraining ict
      LEFT JOIN ds_oclienttraining oct
        ON ict.client_id = oct.client_id AND ict.current_round = oct.current_round
      LEFT JOIN ds_iinitializeclient iic
        ON ict.client_id = iic.client_id
      WHERE 1=1 ${clientFilter} ${roundFilter}
    ),
    clients_per_round AS (
      SELECT current_round, COUNT(DISTINCT client_id) AS count_clients
      FROM base_data
      GROUP BY current_round
    )
    SELECT
      (SELECT COUNT(DISTINCT client_id) FROM base_data) AS total_clients,
      (SELECT COUNT(DISTINCT current_round) FROM base_data) AS total_rounds,
      (SELECT MIN(count_clients) FROM clients_per_round) AS min_clients_per_round,
      (SELECT MAX(count_clients) FROM clients_per_round) AS max_clients_per_round,
      (SELECT MIN(samples) FROM base_data) AS min_samples,
      (SELECT MAX(samples) FROM base_data) AS max_samples,
      (SELECT MIN(clusters) FROM base_data) AS min_clusters,
      (SELECT MAX(clusters) FROM base_data) AS max_clusters,
      (SELECT ROUND(AVG(training_time), 2) FROM base_data) AS avg_training_time
  `;
  const conn = getConnection();

  try {
    await conn.connect();
    const result = await conn.execute(query);
    await conn.close();
    res.json(result); // retorna objeto com os campos direto
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({ error: 'Erro ao obter resumo.' });
  }
});

module.exports = router;
