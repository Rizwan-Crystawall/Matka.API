const express = require('express');
const cors = require('cors');

const app = express();

const routes = require('./src/routes/route');

app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);

module.exports = app;
