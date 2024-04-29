const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const messages = {};
const now = new Date();
const hour = now.getHours();
let sent = false;
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
    console.log("Boa tarde! ️");
    break;
  default:
    break;
  case 18:
  case 19:
    daytime = "Boa noite!";
    console.log("Boa noite! ");
    break;
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
  //generate and scan this code with your phone
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Connected");
});

client.on("message_create", async (msg) => {
  if (!messages[msg.from]) {
    messages[msg.from] = [];
  }

  messages[msg.from].push({
    body: msg.body,
    timestamp: msg.timestamp,
  });

  if (!messages[msg.from].some((m) => m.body === "start")) {
    await sendWelcomeMessage(msg);
  }
});

async function sendWelcomeMessage(msg) {
  if (!sent) {
    console.log({ sent });
    const reply = client.sendMessage(
      msg.from,
      `${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.

Por favor, selecione a opção a seguir para seguir com o atendimento:
1 - Solicitação de spots;
2 - Dúvidas sobre o acesso ao player;
3 - Configurações técnicas;
4 - Outros setores.`
    );
    sent = true;
    messages[msg.from.status] = "start";
    console.log({ fromstart: messages[msg.from] });

    await reply;
  }
}

client.initialize();
