const express = require('express');
const router = express.Router();
const getConnection = require('../db');

router.get('/', async (req, res) => {
  const query = `
    WITH participation AS (
      SELECT DISTINCT
        client_id,
        CAST(current_round AS INT) AS round_number,
        'client' AS type
      FROM ds_iclienttraining

    UNION ALL

    -- Servidor
    SELECT 
      'server' AS client_id,
      CAST(current_round AS INT) AS round_number,
      'server' AS type
    FROM ds_iassemble

    ),
    grouped AS (
      SELECT 
        client_id,
        round_number,
        type,
        ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY round_number) AS rn
      FROM participation
    ),
    block_id AS (
      SELECT 
        client_id,
        round_number,
        type,
        round_number - rn AS grp
      FROM grouped
    ),
    blocks AS (
      SELECT 
        client_id,
        type,
        grp,
        MIN(round_number) AS start_round,
        MAX(round_number) AS end_round
      FROM block_id
      GROUP BY client_id, type, grp
    ),
    labeled AS (
      SELECT 
        p.client_id,
        p.round_number,
        p.type,
        CASE 
          WHEN p.round_number = b.start_round THEN 'start'
          WHEN p.round_number = b.end_round THEN 'end'
          ELSE 'middle'
        END AS role
      FROM block_id p
      JOIN blocks b 
        ON p.client_id = b.client_id AND p.grp = b.grp
    )
    SELECT * FROM labeled
    ORDER BY type, client_id, round_number;
  `;

  const conn = getConnection();

  try {
    await conn.connect();
    const result = await conn.execute(query);
    await conn.close();
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar participação:', error);
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
