const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue } = require('bullmq');

// Use the same queue name you used elsewhere
const retryQueue = new Queue('retry-settlements', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(retryQueue)],
  serverAdapter
});

module.exports = serverAdapter;
