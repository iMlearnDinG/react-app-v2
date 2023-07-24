const cron = require('node-cron');
const dayjs = require('dayjs');
const Lobby = require('../models/Lobby');

// This will schedule the job to run every 1 minute
// Check https://crontab.guru/ to see how to set the timing according to your needs
cron.schedule('* * * * *', function() {
  console.log('Running the scheduled job to clean up lobbies...');

  const fiveMinutesAgo = dayjs().subtract(5, 'minutes').toDate();

  Lobby.deleteMany({ 
    'players.1': { $exists: false }, 
    createdAt: { $lt: fiveMinutesAgo }
  })
  .then((result) => {
    console.log(`Deleted ${result.deletedCount} old lobbies.`);
  })
  .catch((error) => {
    console.log('Error in deleting old lobbies:', error);
  });
});
