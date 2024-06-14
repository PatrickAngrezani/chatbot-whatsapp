let daytime = require("../hour-time");
const now = new Date().toLocaleDateString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const spotOption = require("../options/suporte/spot-option");
const playerOption = require("../options/suporte/player-option");
const settingsOption = require("../options/suporte/settings-option");
const sectorsOption = require("../options/suporte/sectors-option");
const menuOptions = require("../options/suporte/menu-options");
const technicalSupport = require("../options/suporte/technical-support");
const technicalSupportMenu = require("../options/menu/technical-support-menu");
const saudacoes = require("../saudations/saudations");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6"];

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
    // "555180326030@c.us",
    "5518996074748@c.us",
  ];

  if (dateMsg >= now) {
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

async function welcomeMessage(hasService) {
  let saudacao;
  if (!hasService) {
    saudacao = `${daytime} Seja bem vindo(a) ao suporte técnico InfyMedia.`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
  
${technicalSupportMenu}`;
}

// async function welcomeMessageGroup(firstTime) {
//   let saudacao;

//   if (firstTime) {
//     saudacao = `${daytime} Seja bem vindo ao menu para grupos da InfyMedia.

// Você deseja contatar qual setor?`;
//   } else {
//     saudacao = ${daytime} Vejo que hoje já nos falamos. Escolha a opção a seguir:;
//   }

//   return `${saudacao}
// 1 - Comercial;
// 2 - Customer Success;
// 3 - Financeiro;
// 4 - Suporte Técnico;
// 5 - Digite o assunto desejado:`;
// }

// async function showOptionsGroup(option) {
//   switch (option) {
//     case "1":
//       return `Comercial

// ${comercialMenu}`;
//     case "2":
//       return `Customer Success

// ${customerSuccessMenu}`;
//     case "3":
//       return `Financeiro

// ${financialMenu}`;
//     case "4":
//       return `Suporte Técnico

// ${technicalSupportMenu}      `;
//     case "5":
//       return desiredSubjectMenu;
//   }
// }

client.initialize();
