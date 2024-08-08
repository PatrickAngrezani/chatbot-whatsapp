module.exports = {
  apps: [
    {
      name: "chatbot-infymedia",
      script: "pm2 start ./src/sectors/comercial.js --name chatbot-infymedia",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
