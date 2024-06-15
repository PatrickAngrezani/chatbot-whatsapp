let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
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
const saudacoes = require("../saudations/saudations");

require("dotenv").config;

const scheduleTraining = require("../options/comercial/schedule-training");

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const generalFunctions = require("./general/general-functions");

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
    // "555180326030@c.us",
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
        } else if (options.includes(clientMessage)) {
          showOptions(clientMessage).then((result) => msg.reply(result));
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
      return scheduleTraining;
    case "10":
      return comercial;
    case "11":
      return sectorsOption;
    case "12":
      return menuOptions;
  }
}

client.initialize();
