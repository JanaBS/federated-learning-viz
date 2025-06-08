const express = require('express');
const router = express.Router();
const getConnection = require('../db');

router.get('/', async (req, res) => {
  const { clients, rounds } = req.query;

  const clientFilter = clients
    ? `AND oct.client_id IN (${clients.split(',').map(c => `'${c}'`).join(',')})`
    : '';
  const roundFilter = rounds
    ? `AND oct.current_round IN (${rounds.split(',').map(r => Number(r)).join(',')})`
    : '';

  const query = `
    SELECT
      oct.client_id,
      CAST(oct.current_round AS INT) AS round,
      ROUND(CAST(oct.training_time AS DOUBLE), 2) AS duration
    FROM ds_oclienttraining oct
    WHERE 1=1
      AND oct.training_time IS NOT NULL
      ${clientFilter}
      ${roundFilter}
    ORDER BY round, duration;
  `;

  const conn = getConnection();

  try {
    await conn.connect();
    const result = await conn.execute(query);
    await conn.close();

    // MonetDB retorna um array com objetos no formato { data: [...] }, então retornamos só os dados:
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar tempos de treinamento:', error);
    res.status(500).json({ error: 'Erro ao buscar tempos de treinamento.' });
  }
});

module.exports = router;
