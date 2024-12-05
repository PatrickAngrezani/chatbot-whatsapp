const fs = require("fs");
const serviceMapFilePath = "../../service-map.json";
fs.writeFileSync(serviceMapFilePath, JSON.stringify({}), "utf8");
const nodemailer = require("nodemailer");

let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const sectorsOption = require("../options/financeiro/sector-options");
const bankSlipAndPayment = require("../options/financeiro/bank-slip-and-payment");
const transferKey = require("../options/financeiro/transfer-key");
const invoice = require("../options/financeiro/invoice");
const financialAgreement = require("../options/financeiro/financial-agreement");
const contract = require("../options/financeiro/contract");
const purchasingService = require("../options/financeiro/purchasingService");
const ecadRoyalties = require("../options/financeiro/ecad-royalties");
const rescission = require("../options/financeiro/rescission");
const financialSector = require("../options/financeiro/financial-sector");
const menuOptions = require("../options/financeiro/menu-options");
const financialMenu = require("../options/menu/financial-menu");
const cancelHits = require("../options/general/cancel-contract/cancel-hits");
const cancelRoyaltyFree = require("../options/general/cancel-contract/cancel-royalty-free");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const generalFunctions = require("./general/general");
let emailFinanceiroSent = false;

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
    to: process.env.EMAIL_FINANCEIRO,
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
  emailFinanceiroSent = true;
}

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

client.on("qr", async (qr) => {
  try {
    if (!emailFinanceiroSent) {
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
  const msgAuthor = msg.author;
  const isGroupMessage = msgFrom.includes("g");
  const numberOfWords = clientMessage.split(" ").length;

  if (!generalFunctions.companyNumbers.includes(msgFrom)) {
    if (dateMsg >= timeStarted) {
      if (!isGroupMessage) {
        const hasService = await generalFunctions.hasService(
          msgFrom.split("@")[0]
        );
        const hasGreetings = await generalFunctions.checkGreetings(
          clientMessage
        );

        if (hasGreetings && numberOfWords <= 4) {
          await welcomeMessage(hasService).then((result) =>
            client.sendMessage(`${msgFrom}`, result)
          );
          await showMenu(clientMessage).then((result) =>
            client.sendMessage(`${msgFrom}`, result)
          );
        } else if (options.includes(clientMessage)) {
          if (clientMessage == "8") {
            await replyCancelContract().then((result) =>
              client.sendMessage(`${msgFrom}`, result)
            );
          } else {
            showOptions(clientMessage).then((result) =>
              client.sendMessage(`${msgFrom}`, result)
            );
          }
        } else if (clientMessage == "r" || clientMessage == "h") {
          await displayCancelContract(clientMessage).then((result) =>
            client.sendMessage(`${msgFrom}`, result)
          );
        }
        await generalFunctions.saveService(
          msgFrom.split("@")[0],
          dateMsg,
          clientMessage
        );
      } else {
        // if (saudacoes.includes(clientMessage)) {
        //   await welcomeMessageGroup(true).then((result) => msg.reply(result));
        // } else if (options.includes(clientMessage)) {
        //   showOptionsGroup(clientMessage).then((result) => msg.reply(result));
        // }
        await generalFunctions.saveService(
          msgAuthor.split("@")[0],
          dateMsg,
          clientMessage
        );
      }
    } else {
      console.log("Message sent before bot start");
    }
  } else {
    console.log("Message didn't answered because is from a company number ");
  }
});

async function showOptions(option) {
  switch (option) {
    case "1":
      return bankSlipAndPayment;
    case "2":
      return transferKey;
    case "3":
      return invoice;
    case "4":
      return financialAgreement;
    case "5":
      return contract;
    case "6":
      return purchasingService;
    case "7":
      return ecadRoyalties;
    case "8":
      return rescission;
    case "9":
      return sectorsOption;
    case "10":
      return financialSector;
    case "11":
      return menuOptions;
  }
}

async function welcomeMessage(hasService) {
  let saudacao;
  let currentDayTimeGreeting = generalFunctions.getGreeting();

  if (!hasService) {
    saudacao = `${currentDayTimeGreeting} Seja bem vindo(a) ao setor Financeiro InfyMedia! Será uma satisfação atendê-lo.

Para agilizar seu atendimento informe os dados abaixo:
- Nome completo:
- Número de lojas que possui conosco (Ex: 2 unid):
- CNPJs das empresas:`;
  } else {
    saudacao = `${currentDayTimeGreeting} Vejo que hoje já nos falamos. Será uma satisfação atendê-lo novamente.
    
Deseja seguir com as mesmas informações anteriores? 
Pode também encaminhar o novo CNPJ a tratarmos.`;
  }

  return `${saudacao}`;
}

async function showMenu() {
  return `Após o envio das informações solicitadas. Selecione a opção:
  
${financialMenu}`;
}

async function replyCancelContract() {
  return `Atualmente, qual plano você tem contratado conosco?
  
H - HITS;
R - ROYALTY FREE.`;
}

async function displayCancelContract(clientMessage) {
  switch (clientMessage) {
    case "h":
      return cancelHits;
    case "r":
      return cancelRoyaltyFree;
  }
}

client.initialize();
