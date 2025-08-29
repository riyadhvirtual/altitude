module.exports = {
  apps: [
    {
      name: 'web',
      script: 'sh deploy/start.sh',
      cwd: '/app',
      max_memory_restart: '600M',
    },
    {
      name: 'bot',
      script: 'bun run bot/index.ts',
      cwd: '/app',
      stop_exit_codes: [0],
    },
    {
      name: 'send-inactivity-notifications',
      script: 'bun run scripts/send-inactivity-notification.ts',
      cwd: '/app',
      cron_restart: '0 0 * * *',
      autorestart: false,
    },

    // Debugging purpose
    // {
    //   name: 'heartbeat',
    //   script: 'bun run scripts/heartbeat.ts',
    //   cwd: '/app',
    //   cron_restart: '* * * * *', // Every minute
    //   autorestart: false,
    // },
  ],
};
