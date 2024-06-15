let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const sectorsOption = require("../options/financeiro/sector-options");
const bankSlipAndPayment = require("../options/financeiro/bank-slip-and-payment");
const transferKey = require("../options/financeiro/transfer-key");
const invoice = require("../options/financeiro/invoice");
const financialAgreement = require("../options/financeiro/financial-agreement");
const contract = require("../options/financeiro/contract");
const purchasingService = require("../options/financeiro/purchasingService");
const ecadRoyalties = require("../options/financeiro/ecad-royalties");
const rescission = require("../options/financeiro/rescission");
const financialSector = require("../options/financeiro/financial-sector");
const menuOptions = require("../options/financeiro/menu-options");
const financialMenu = require("../options/menu/financial-menu");
const saudacoes = require("../saudations/saudations");
const cancelHits = require("../options/general/cancel-contract/cancel-hits");
const cancelRoyaltyFree = require("../options/general/cancel-contract/cancel-royalty-free");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
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

  if (dateMsg >= timeStarted) {
    if (!companyNumbers.includes(msgFrom)) {
      if (!isGroupMessage) {
        const hasService = await generalFunctions.hasService(
          msgFrom.split("@")[0]
        );
        if (saudacoes.includes(clientMessage)) {
          await welcomeMessage(hasService).then((result) => msg.reply(result));
          await showMenu(clientMessage).then((result) => msg.reply(result));
        } else if (options.includes(clientMessage)) {
          if (clientMessage == "8") {
            await replyCancelContract().then((result) => msg.reply(result));
          } else {
            showOptions(clientMessage).then((result) => msg.reply(result));
          }
        } else if (clientMessage == "r" || clientMessage == "h") {
          await displayCancelContract(clientMessage).then((result) =>
            msg.reply(result)
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
      console.log("Message didn't answered because is from a company number ");
    }
  } else {
    console.log("Message sent before bot start");
  }
});

async function showOptions(option) {
  switch (option) {
    case "1":
      return bankSlipAndPayment; //Boleto/Pagamento;
    case "2":
      return transferKey; //Chave PIX da Empresa/Pagamento;
    case "3":
      return invoice; //Nota fiscal;
    case "4":
      return financialAgreement; //Acordo Financeiro;
    case "5":
      return contract; //Contrato;
    case "6":
      return purchasingService; //Contratação;
    case "7":
      return ecadRoyalties; //Cobrança Ecad;
    case "8":
      return rescission; //Cancelamento;
    case "9":
      return financialSector;
    case "10":
      return sectorsOption;
    case "11":
      return menuOptions;
  }
}

async function welcomeMessage(hasService) {
  let saudacao;
  if (!hasService) {
    saudacao = `${daytime} Seja bem vindo(a) ao setor Financeiro InfyMedia! Será uma satisfação atendê-lo.

Para agilizar seu atendimento informe os dados abaixo:
- Nome completo da pessoa:
- Número de lojas que possui conosco (Ex: 2 unid):
- CNPJs das empresas (Ex: Pedir o 1° cnpj e depois o 2° cnpj):`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Será uma satisfação atendê-lo novamente.
    
Deseja seguir com as mesmas informações anteiores? 
Pode também encaminhar o novo CNPJ a tratarmos.`;
  }

  return `${saudacao}`;
}

async function showMenu() {
  return `Após o envio das informações solicitadas. Selecione a opção:
  
${financialMenu}`;
}

async function replyCancelContract() {
  return `Atualmente, qual plano você tem contratado conosco?
  
H - HITS;
R - ROYALTY FREE.`;
}

async function displayCancelContract(clientMessage) {
  switch (clientMessage) {
    case "h":
      return cancelHits;
    case "r":
      return cancelRoyaltyFree;
  }
}

client.initialize();
