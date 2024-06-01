let daytime = require("../hour-time");

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const spotOption = require("../options/suporte/spot-option");
const playerOption = require("../options/suporte/player-option");
const settingsOption = require("../options/suporte/settings-option");
const sectorsOption = require("../options/suporte/sectors-option");
const menuOptions = require("../options/suporte/menu-options");
const technicalSupport = require("../options/suporte/technical-support");
const comercialMenu = require("../options/menu/comercial-menu");
const customerSuccessMenu = require("../options/menu/customer-success-menu");
const financialMenu = require("../options/menu/financial-menu");
const technicalSupportMenu = require("../options/menu/technical-support-menu");
const desiredSubjectMenu = require("../options/menu/desired-subject-menu");

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

const options = ["1", "2", "3", "4", "5", "6"];

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
  const isGroupMessage = msg.from.includes("g");

  if (!isGroupMessage) {
    if (saudacoes.includes(clientMessage)) {
      await welcomeMessage(true).then((result) => msg.reply(result));
    } else if (options.includes(clientMessage)) {
      showOptions(clientMessage).then((result) => msg.reply(result));
    }
  } else {
    if (saudacoes.includes(clientMessage)) {
      await welcomeMessageGroup(true).then((result) => msg.reply(result));
    } else if (options.includes(clientMessage)) {
      showOptionsGroup(clientMessage).then((result) => msg.reply(result));
    }
  }
});

async function showOptions(option) {
  switch (option) {
    case "1":
      return spotOption;
    case "2":
      return playerOption;
    case "3":
      return settingsOption;
    case "4":
      return technicalSupport;
    case "5":
      return sectorsOption;
    case "6":
      return menuOptions;
  }
}

async function welcomeMessage(firstTime) {
  let saudacao;
  if (firstTime) {
    saudacao = `${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
  
${technicalSupportMenu}`;
}

async function welcomeMessageGroup(firstTime) {
  let saudacao;

  if (firstTime) {
    saudacao = `${daytime} Seja bem vindo ao menu para grupos da InfyMedia.

Você deseja contatar qual setor?`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Escolha a opção a seguir:`;
  }

  return `${saudacao}
1 - Comercial;
2 - Customer Success;
3 - Financeiro;
4 - Suporte Técnico;
5 - Digite o assunto desejado:`;
}

async function showOptionsGroup(option) {
  switch (option) {
    case "1":
      return `Comercial

${comercialMenu}`;
    case "2":
      return `Customer Success

${customerSuccessMenu}`;
    case "3":
      return `Financeiro

${financialMenu}`;
    case "4":
      return `Suporte Técnico
      
${technicalSupportMenu}      `;
    case "5":
      return desiredSubjectMenu;
  }
}

client.initialize();
