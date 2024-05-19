let daytime = require("../hour-time");

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const servicesAndProducts = require("../options/comercial/services-and-products");
const personalizedQuote = require("../options/comercial/personalized-quote");
const partnershipsAndAdvertising = require("../options/comercial/partnerships-and-advertising");
const schedulingMeetings = require("../options/comercial/scheduling-meetings");
const sectorsOption = require("../options/comercial/sectors-option");
const menuOptions = require("../options/comercial/menu-options");

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

  if (saudacoes.includes(clientMessage)) {
    await welcomeMessage(true).then((result) => msg.reply(result));
  } else if (options.includes(clientMessage)) {
    showOptions(clientMessage).then((result) => msg.reply(result));
  }
});

async function welcomeMessage(firstTime) {
  let saudacao;
  if (firstTime === true) {
    saudacao = `${daytime} Seja Bem-vindo ao setor Comercial InfyMedia! Por favor, selecione uma opção para continuar:`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione uma opção para continuar:`;
  }

  return `${saudacao}
    
1 - Serviços e Produtos;
2 - Orçamento personalizado;
3 - Parcerias e Publicidade;
4 - Agendamento de Reuniões;
5 - Outros setores;
6 - Voltar ao Menu Principal.`;
}

async function showOptions(option) {
  switch (option) {
    case "1":
      return servicesAndProducts;
    case "2":
      return personalizedQuote;
    case "3":
      return partnershipsAndAdvertising;
    case "4":
      return schedulingMeetings;
    case "5":
      return sectorsOption;
    case "6":
      return menuOptions;
  }
}

client.initialize();
