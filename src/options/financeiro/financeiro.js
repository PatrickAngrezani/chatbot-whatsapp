let daytime = require("../hour-time");

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const sectorsOption = require("../options/suporte/sectors-option");
const menuOptions = require("../options/suporte/menu-options");
const bankSlipAndPayment = require("../options/financeiro/bank-slip-and-payment");
const transferKey = require("../options/financeiro/transfer-key");
const invoice = require("../options/financeiro/invoice");
const financialAgreement = require("../options/financeiro/financial-agreement");
const contract = require("../options/financeiro/contract");
const purchasingService = require("../options/financeiro/purchasingService");
const ecadRoyalties = require("../options/financeiro/ecad-royalties");

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
    await welcomeMessage(true).then((result) =>
      client.sendMessage(`${msgFrom}`, result)
    );
  } else if (options.includes(clientMessage)) {
    showOptions(clientMessage).then((result) =>
      client.sendMessage(`${msgFrom}`, result)
    );
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
    default:
      return invalidOption;
  }
}

async function welcomeMessage(firstTime) {
  let saudacao;
  if (firstTime === true) {
    saudacao = `${daytime} Seja bem vindo(a) ao setor Financeiro InfyMedia! Será uma satisfação atendê-lo.

Para agilizar seu atendimento informe os dados abaixo:
- Nome completo da pessoa:
- Número de lojas que possui conosco (Ex: 2 unid):
- CNPJs das empresas (Ex: Pedir o 1° cnpj e depois o 2° cnpj):`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Será uma satisfação atendê-lo novamente.
    
Para agilizar seu atendimento informe os dados abaixo:
- Nome completo da pessoa:
- Número de lojas que possui conosco (Ex: 2 unid):
- CNPJs das empresas (Ex: Pedir o 1° cnpj e depois o 2° cnpj):

Na sequência, selecione a opção desejada.`;
  }

  return `${saudacao}`;
}

client.initialize();
