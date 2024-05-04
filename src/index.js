//system
const fs = require("fs");

//libraries
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIPI } = require("openai");
require("dotenv").config;

//intern files
const spotOption = require("./options/spot-option");
const playerOption = require("./options/player-option");
const settingsOption = require("./options/settings-option");
const sectorsOption = require("./options/sectors-option");
const menuOptions = require("./options/menu-options");

const atendimentoMapFile = "./atendimentoMap.json";
const now = new Date();
const hour = now.getHours();
let daytime = "";

switch (hour) {
  case 5:
  case 6:
  case 7:
  case 8:
  case 9:
  case 10:
    daytime = "Bom dia!";
    console.log("Bom dia! ☀️");
    break;
  case 11:
  case 12:
  case 13:
  case 14:
  case 15:
  case 16:
  case 17:
    daytime = "Boa tarde!";
    console.log("Boa tarde! ️🔆");
    break;
  default:
    break;
  case 18:
  case 19:
  case 20:
  case 21:
  case 22:
  case 23:
    daytime = "Boa noite!";
    console.log("Boa noite! 🌑");
    break;
}

const saudacoes = ["oi745"];

const options = ["1", "2", "3", "4", "5"];
let atendimentoMap = {};

try {
  const data = fs.readFileSync(atendimentoMapFile, "utf8");
  atendimentoMap = JSON.parse(data);
} catch (error) {
  if (error.code === "ENOENT") {
    console.log("AtendimentoMap file not found, creating a new one.");
    atendimentoMap = {};
  } else {
    console.error("Error reading atendimentoMap file:", error);
  }
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

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Connected");
});

client.on("message", async (msg) => {
  const clientMessage = msg.body.toLowerCase();

  if (saudacoes.includes(clientMessage)) {
    welcomeMessage().then((result) => msg.reply(result));
  }
});

client.on("message", async (option) => {
  const clientOption = option.body.toLowerCase();

  if (options.includes(clientOption)) {
    showOptions(clientOption).then((result) => option.reply(result));
  }
});

async function welcomeMessage() {
  console.log({ daytime });
  return `${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.

Por favor, selecione a opção a seguir para seguir com o atendimento:
1 - Solicitação de spots;
2 - Dúvidas sobre o acesso ao player;
3 - Configurações técnicas;
4 - Outros setores.`;
}

async function showOptions(option) {
  switch (option) {
    case "1":
      return spotOption;
    case "2":
      return playerOption;
    case "3":
      return settingsOption;
    case "4":
      return sectorsOption;
    case "5":
      return menuOptions;
  }
}

async function welcomeMessage(firstTime) {
  let saudacao;
  if (firstTime === true) {
    saudacao = `${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
  
1 - Solicitação de spots;
2 - Dúvidas sobre o acesso ao player;
3 - Configurações técnicas;
4 - Outros setores;
5 - Voltar ao Menu Principal.`;
}

async function saveAtendimentoMap() {
  try {
    const data = JSON.stringify(atendimentoMap);
    fs.writeFileSync(atendimentoMapFile, data, "utf-8");
  } catch (error) {
    console.error("Error saving atendimentoMapFile:", error);
  }
}

client.initialize();
