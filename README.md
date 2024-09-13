# Chatbot WhatsApp

This is a WhatsApp Chatbot project developed with Node.js, using libraries such as Puppeteer and Mongoose for automating responses and integrating with MongoDB for data storage.


## Features

- Lead identification in WhatsApp groups
- QR code email delivery for connecting with WhatsApp Web
- MongoDB integration for data storage
- Automated technical support menu
- Different sectors configured for personalized responses (Commercial, Support, Finance, etc.)


## Requirements

Before starting, you need to have the following installed:

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local or remote)
- An email account configured for sending QR codes (using Nodemailer)
- [Puppeteer](https://pptr.dev/) for WhatsApp Web automation


## Installation

1. Clone the repository:

```bash
git clone https://github.com/PatrickAngrezani/chatbot-whatsapp.git
```

2. Install dependences:
- cd chatbot-whatsapp
- npm install

3. Set the .env file in project root with the following variables:
- EMAIL_SUPORTE=seuemail@gmail.com
- EMAIL_SUPORTE_PASS=suasenha
- MONGO_URL=mongodb://localhost:27017/chatbot-infymedia

4. Run MongoDB locally or set an instance in MongoDB Atlas;

5. Start the bot:
- cd src/sectors
- node <file>


## Project Structure

- src/: It contains the main bot code;
    - sectors/: Specific modules to each sector (comercial, support, financial, etc.);
    - database/: Schemas and functions related to DB;
    - options/: Auxiliary functions such as technical support menus.


## Use

- At run bot momment, will be generated a QR Code. Scan It using Whats App Web to connect the bot in your account number;
- The bot answers clients, identify lead filling the form and send a questionary to knows the client and your need.


## Contribuition

- Do a repository fork;
- Create a branch for your feature; (git checkout -b feature/<feature-name>)
- Commit your changes; (git commit -m: "<some-message>")
- Send to branch; (git push origin feature/<feature-name>)
- Open a Pull Request.