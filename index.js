const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const now = new Date();
const hour = now.getHours();
console.log({ hour });
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
    daytime = "Boa tarde!";
    console.log("Boa tarde! ️");
    break;
  default:
    break;
  case 17:
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

client.once("message_create", async (msg) => {
  if (msg.body != "") {
    console.log({ msg, id: msg.id });
    await msg.reply`${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.

           Por favor, escolha a opção a seguir para darmos continuidade ao seu atendimento:
           1 - Solicitação de spots;
           2 - Dúvidas sobre o acesso ao player;
           3 - Configurações técnicas;
           4 - Outros setores.
           `;
  }
});

client.initialize();
