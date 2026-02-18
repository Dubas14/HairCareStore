// ============================
// Hair Lab Store — PM2 Configuration
// ============================
// Usage: pm2 start deploy/ecosystem.config.js
// ============================

module.exports = {
  apps: [
    {
      name: 'hair-lab',
      script: './frontend/.next/standalone/server.js',
      cwd: '/var/www/hair-lab',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
