let daytime = require("../hour-time");

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

require("dotenv").config;

const saudacoes = [
  "oi",
  "ola",
  "olá",
  "bom dia",
  "boa tarde",
  "boa noite",
  "bom dia, tudo bem?",
  "boa tarde, tudo bem?",
  "boa noite, tudo bem?",
];

const options = ["1", "2", "3", "4", "5", "6", "7", "8"];

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
  const clientMessage = msg.body.toLowerCase();

  if (saudacoes.includes(clientMessage)) {
    await welcomeMessage(true).then((result) => msg.reply(result));
    await showMenu(clientMessage).then((result) => msg.reply(result));
  } else if (options.includes(clientMessage)) {
    showOptions(clientMessage).then((result) => msg.reply(result));
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

async function welcomeMessage(firstTime) {
  let saudacao;
  if (firstTime === true) {
    saudacao = `${daytime} Seja bem vindo(a) a InfyMedia! Será uma satisfação atendê-lo(a).
Para agilizar seu atendimento, informe os dados abaixo: 

Nome da empresa:`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}`;
}

async function showMenu() {
  return `Após informar os dados. Selecione a opção que gostaria:
    
1 - Agendar treinamento;
2 - Solicitar Spots;
3 - Informações sobre Planos;
4 - Fale com Customer Success;
5 - Outros Setores;
6 - Cancelamento;
7 - Cobrança Ecad;
8 - Voltar ao Menu Principal.`;
}

client.initialize();
