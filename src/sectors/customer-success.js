let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const ecadRoyalties = require("../options/financeiro/ecad-royalties");
const scheduleTraining = require("../options/customer-success/schedule-training");
const spotOption = require("../options/customer-success/spots");
const plans = require("../options/customer-success/plans");
const sectorsOption = require("../options/customer-success/sector-options");
const customerSuccess = require("../options/customer-success/customer-success-sector");
const cancelContract = require("../options/customer-success/cancel-contract");
const menuOptions = require("../options/customer-success/menu-options");
const customerSuccessMenu = require("../options/menu/customer-success-menu");
const saudacoes = require("../saudations/saudations");
const cancelHits = require("../options/general/cancel-contract/cancel-hits");
const cancelRoyaltyFree = require("../options/general/cancel-contract/cancel-royalty-free");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6", "7", "8"];
const generalFunctions = require("../sectors/general/general-functions");

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

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
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
  const companyNumbers = [
    "5511942700889@c.us",
    "5511975983317@c.us",
    "555186116422@c.us",
    "553898548432@c.us",
    "555196095602@c.us",
    "555196695926@c.us",
    "555185468899@c.us",
    "555198763990@c.us",
    "555180631413@c.us",
    "555186070833@c.us",
    "555185440509@c.us",
    "555184648888@c.us",
    "555180326030@c.us",
    "5518996074748@c.us",
  ];

  if (dateMsg >= timeStarted) {
    if (!companyNumbers.includes(msgFrom)) {
      if (!isGroupMessage) {
        const hasService = await generalFunctions.hasService(
          msgFrom.split("@")[0]
        );
        if (saudacoes.includes(clientMessage)) {
          await welcomeMessage(hasService).then((result) => msg.reply(result));
          await showMenu(clientMessage).then((result) => msg.reply(result));
        } else if (options.includes(clientMessage)) {
          if (clientMessage == "6") {
            await replyCancelContract().then((result) => msg.reply(result));
          } else {
            showOptions(clientMessage).then((result) => msg.reply(result));
          }
        } else if (clientMessage == "r" || clientMessage == "h") {
          await displayCancelContract(clientMessage).then((result) =>
            msg.reply(result)
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
      console.log("Message didn't answered because is from a company number ");
    }
  } else {
    console.log("Message sent before bot start");
  }
});

async function showOptions(option) {
  switch (option) {
    case "1":
      return scheduleTraining;
    case "2":
      return spotOption;
    case "3":
      return plans;
    case "4":
      return customerSuccess;
    case "5":
      return sectorsOption;
    case "6":
      return cancelContract;
    case "7":
      return ecadRoyalties;
    case "8":
      return menuOptions;
  }
}

async function welcomeMessage(hasService) {
  let saudacao;
  if (!hasService) {
    saudacao = `${daytime} Seja bem vindo(a) a InfyMedia! Será uma satisfação atendê-lo(a).
Para agilizar seu atendimento, informe os dados abaixo: 

Nome da empresa:
CNPJs das empresas:`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}`;
}

async function showMenu() {
  return `Após informar os dados. Selecione a opção que gostaria:
    
${customerSuccessMenu}`;
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
