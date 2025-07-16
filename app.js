const express = require('express');
const cors = require('cors');

const app = express();

const bullBoardAdapter = require('./src/queues/bullDashboard');
app.use('/admin/queues', bullBoardAdapter.getRouter());

const routes = require('./src/routes/route');
const routesV2 = require('./src/routes/v2/route');

app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);
app.use('/api/v2', routesV2);

module.exports = app;