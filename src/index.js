//system
const fs = require("fs");
let daytime = require("./hour-time");

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

client.on("message", async (option) => {
  const clientOption = option.body.toLowerCase();

  if (options.includes(clientOption)) {
    showOptions(clientOption).then((result) => option.reply(result));
  }

  await saveAtendimentoMap();
});

//new model to configure historic talks
client.on("message", async (msg) => {
  const clientId = msg.from;
  const clientMessage = msg.body.toLowerCase();

  //verify previous service "today"
  const atendimento = atendimentoMap[clientId];

  //configure message test
  if (saudacoes.includes(clientMessage)) {
    if (
      atendimento &&
      atendimento.data === new Date().toISOString().slice(0, 10)
    ) {
      //service in same day, recover talk and continue
      const conversa = atendimento.conversa;

      //process new message and update talk
      conversa.push(clientMessage);
      atendimentoMap[clientId].conversa = conversa;

      //send answer to user
      await welcomeMessage(false).then((result) => msg.reply(result));

      //save updated talk historic
      await saveAtendimentoMap();
    } else {
      //save new service to customer
      const novoAtendimento = {
        data: new Date().toISOString().slice(0, 10),
        conversa: [clientMessage],
      };

      //add new service to map
      atendimentoMap[clientId] = novoAtendimento;

      //send welcome message showing options
      await welcomeMessage(true).then((result) => msg.reply(result));

      //save service in localStorage
      await saveAtendimentoMap();
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
4 - Outros setores.`;
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
