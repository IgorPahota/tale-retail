// @ts-ignore
const CronJob = require('cron').CronJob;
const job = new CronJob(
    '*/3 * * * * *',
    function() {
        console.log('You will see this message every second');
    },
    null,
    true,
    'America/Los_Angeles'
);
// Use this if the 4th param is default value(false)
job.start()