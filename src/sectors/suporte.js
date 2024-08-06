const fs = require("fs");
const serviceMapFilePath = "../../service-map.json";
fs.writeFileSync(serviceMapFilePath, JSON.stringify({}), "utf8");

let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const spotOption = require("../options/suporte/spot-option");
const playerOption = require("../options/suporte/player-option");
const settingsOption = require("../options/suporte/settings-option");
const sectorsOption = require("../options/suporte/sectors-option");
const menuOptions = require("../options/suporte/menu-options");
const technicalSupport = require("../options/suporte/technical-support");
const technicalSupportMenu = require("../options/menu/technical-support-menu");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6"];
const generalFunctions = require("./general/general");

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
  const clientMessage = msg.body.toLowerCase().trim();
  const msgFrom = msg.from;
  const msgAuthor = msg.author;
  const isGroupMessage = msgFrom.includes("g");
  const numberOfWords = clientMessage.split(" ").length;

  if (!generalFunctions.companyNumbers.includes(msgFrom)) {
    if (dateMsg >= timeStarted) {
      if (!isGroupMessage) {
        const hasService = await generalFunctions.hasService(
          msgFrom.split("@")[0]
        );
        const hasGreetings = await generalFunctions.checkGreetings(
          clientMessage
        );

        if (hasGreetings && numberOfWords <= 6) {
          await welcomeMessage(hasService).then((result) =>
            client.sendMessage(`${msgFrom}`, result)
          );
        } else if (options.includes(clientMessage)) {
          showOptions(clientMessage).then((result) =>
            client.sendMessage(`${msgFrom}`, result)
          );
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
      console.log("Message sent before bot start");
    }
  } else {
    console.log("Message didn't answered because is from a company number ");
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
  let currentDayTime = await generalFunctions.updateDayTime(daytime);

  if (!hasService) {
    saudacao = `${currentDayTime} Seja bem vindo(a) ao suporte técnico InfyMedia.`;
  } else {
    saudacao = `${currentDayTime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
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
