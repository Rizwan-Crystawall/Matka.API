const redis = require('redis');
const client = redis.createClient(); // default localhost:6379

client.connect();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = client;
