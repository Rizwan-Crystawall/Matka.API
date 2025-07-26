const chunkPayloadByBets = (payload, maxItemsPerChunk = 100) => {
  const { bets, requestId, timestamp, ...rest } = payload;

  const winners = Array.isArray(bets.winners) ? bets.winners : [];
  const losers = Array.isArray(bets.losers) ? bets.losers : [];

  const winnerChunks = chunkArray(winners, maxItemsPerChunk);
  const loserChunks = chunkArray(losers, maxItemsPerChunk);

  const chunks = [];
  let counter = 1;

  // Chunk winners first
  if (winnerChunks.length > 0) {
    for (const chunk of winnerChunks) {
      chunks.push({
        ...rest,
        requestId: `${requestId}-${counter++}`,
        bets: {
          winners: chunk,
          losers: []
        },
        timestamp: new Date().toISOString()
      });
    }
  } else {
    chunks.push({
      ...rest,
      requestId: `${requestId}-${counter++}`,
      bets: {
        winners: [],
        losers: []
      },
      timestamp: new Date().toISOString()
    });
  }

  // Then chunk losers
  if (loserChunks.length > 0) {
    for (const chunk of loserChunks) {
      chunks.push({
        ...rest,
        requestId: `${requestId}-${counter++}`,
        bets: {
          winners: [],
          losers: chunk
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  return chunks;
}

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

module.exports = chunkPayloadByBets;

