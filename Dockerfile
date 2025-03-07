# Use the official Node.js image as the base image
FROM node:16

# Set environment variables
ENV EMAIL_FINANCEIRO=katharine@infymedia.com.br
ENV EMAIL_COMERCIAL=comercial@infymedia.com.br
ENV EMAIL_CUSTOMER_SUCCESS=fernanda.moraes@infymedia.com.br
ENV EMAIL_CUSTOMER_SUCCESS2=fernanda.araujo@infymedia.com.br 
ENV EMAIL_COMERCIAL_PASS="mqco wkvu asjb hxmi"
ENV EMAIL_SUPORTE=suporte@infymedia.com.br
ENV EMAIL_SUPORTE2=suporte2@infymedia.com.br
ENV EMAIL_SUPORTE_PASS="jpwz bixq ujwv ctcj"

# Install dependencies required by Puppeteer
RUN apt-get update \
    && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    jq \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app source code
COPY . .

# Define environment variable to run the file
ARG APP_FILE

# Expose the port that the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Command to run your app using the entrypoint script
CMD ["sh", "-c", "node ./src/sectors/$APP_FILE"]
