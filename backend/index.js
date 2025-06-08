const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// importar e usar rotas
const clientRoundsRoute = require('./routes/client_rounds');
app.use('/api/clientRounds', clientRoundsRoute);

const summaryViewRoute = require('./routes/summary_view');
app.use('/api/summary', summaryViewRoute);

const trainingTimesRouter = require('./routes/training_times');
app.use('/api/trainingTimes', trainingTimesRouter);


// iniciar servidor
app.listen(PORT, () => {
  console.log(`API sendo executada em http://localhost:${PORT}`);
});
