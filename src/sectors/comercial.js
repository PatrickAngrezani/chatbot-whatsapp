require("dotenv").config();
const fs = require("fs");
const serviceMapFilePath = "../../service-map.json";
fs.writeFileSync(serviceMapFilePath, JSON.stringify({}), "utf8");
const nodemailer = require("nodemailer");

let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const servicesAndProducts = require("../options/comercial/services-and-products");
const plansAndValues = require("../options/comercial/plans-and-values");
const partnershipsAndAdvertising = require("../options/comercial/partnerships-and-advertising");
const hiringProcess = require("../options/comercial/hiring-process");
const sectorsOption = require("../options/comercial/sectors-option");
const menuOptions = require("../options/comercial/menu-options");
const royaltyFree = require("../options/comercial/royalty-free");
const spots = require("../options/comercial/spots");
const metrics = require("../options/comercial/metrics");
const comercial = require("../options/comercial/comercial-sector");
const legislation = require("../options/comercial/legislation");
const comercialMenu = require("../options/menu/comercial-menu");

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const generalFunctions = require("./general/general");
let emailComercialSent = false;

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

async function sendQRCodeByEmail(qrCodeFilePath) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SUPORTE,
      pass: process.env.EMAIL_SUPORTE_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_SUPORTE,
    to: process.env.EMAIL_COMERCIAL,
    subject: "Your WhatsApp QR Code",
    text: "Por favor, escaneie esse QRCode com seu aplicativo do WhatsApp para conectar ao bot.",
    attachments: [
      {
        filename: "qrcode.png",
        path: qrCodeFilePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log("QR code sent via email.");
  emailComercialSent = true;
}

client.on("qr", async (qr) => {
  try {
    if (!emailComercialSent) {
      const qrCodeFilePath = "qrcode.png";
      await qrcode.toFile(qrCodeFilePath, qr);
      console.log("QR code saved as qrcode.png");

      await sendQRCodeByEmail(qrCodeFilePath);
    }
  } catch (err) {
    console.error("Failed to generate or send QR code:", err);
  }
});

client.on("ready", () => {
  console.log("Connected");
});

client.on("message", async (msg) => {
  const timestamp = msg.timestamp;
  const dateMsg = new Date(timestamp * 1000).toLocaleString();
  const clientMessage = msg.body.toLowerCase();
  const msgFrom = msg.from;
  const isGroupMessage = msgFrom.includes("g");
  const numberOfWords = clientMessage.split(" ").length;
  const formattedNumber = msgFrom.split("@")[0];

  if (generalFunctions.companyNumbers.includes(msgFrom)) {
    console.log("Message didn't answer because it's from a company number");
    return;
  }

  if (!dateMsg >= timeStarted) {
    console.log("Message sent before bot start");
    return;
  }

  if (isGroupMessage) {
    console.log("Message from a group message");
    return;
  }

  const hasService = await generalFunctions.hasService(formattedNumber);
  const hasGreetings = await generalFunctions.checkGreetings(clientMessage);

  if (hasGreetings && numberOfWords <= 6) {
    await welcomeMessage(hasService).then((result) =>
      client.sendMessage(`${msgFrom}`, result)
    );
  } else if (options.includes(clientMessage)) {
    showOptions(clientMessage).then((result) =>
      client.sendMessage(`${msgFrom}`, result)
    );
  }

  await generalFunctions.saveService(formattedNumber, dateMsg, clientMessage);
});

async function welcomeMessage(hasService) {
  let saudacao;
  if (!hasService) {
    saudacao = `${daytime} Seja Bem-vindo ao setor Comercial InfyMedia! Por favor, selecione uma opção para continuar:`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
    
${comercialMenu}`;
}

async function showOptions(option) {
  switch (option) {
    case "1":
      return servicesAndProducts;
    case "2":
      return plansAndValues;
    case "3":
      return partnershipsAndAdvertising;
    case "4":
      return hiringProcess;
    case "5":
      return royaltyFree;
    case "6":
      return spots;
    case "7":
      return legislation;
    case "8":
      return metrics;
    case "9":
      return comercial;
    case "10":
      return sectorsOption;
    case "11":
      return menuOptions;
  }
}

client.initialize();
