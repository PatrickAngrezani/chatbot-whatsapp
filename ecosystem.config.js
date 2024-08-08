module.exports = {
  apps: [
    {
      name: "chatbot-infymedia",
      script: "./src/sectors/comercial.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
