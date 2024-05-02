const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIPI } = require("openai");
require("dotenv").config;

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

const saudacoes = [
  "oi",
  "olá",
  "ola",
  "bom dia",
  "boa tarde",
  "boa noite",
  "tudo bem?",
];

const options = ["1", "2", "3", "4"];

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
      return `1 - Solicitação de Spots:

Descreva sua solicitação no modelo a seguir:
      
Data de Vigência: (Defina o período de reprodução);
Estabelecimento: (Identifique sua rádio);
Título: (Identifique o Spot);
Conteúdo: (Digite o conteúdo do spot ou nos envie em arquivo.).`;
    case "2":
      return `2 - Acesso ao Player:

Problema ocorrido: 
(Envie imagens se necessário)`;
    case "3":
      return `3 - Configurações técnicas:

Deseja falar sobre qual tópico?
 - Programação;
 - Volume;
 - Seleção Musical;
 - Outros assuntos.`;
    case "4":
      return `4 - Outros setores:

Selecione o setor de sua preferência:
- Comercial
- Customer Success
- Financeiro
- Suporte - Raphael Melo
- Suporte - Valdiene Goes`;

    default:
      return `Opção inválida, vamos recomeçar!`;
  }
}

client.initialize();
