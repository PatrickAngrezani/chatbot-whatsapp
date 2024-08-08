module.exports = {
  apps: [
    {
      name: "chatbot-infymedia",
      script: "./src/sectors/comercial.js",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
