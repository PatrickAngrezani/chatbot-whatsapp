let daytime = require("../hour-time");

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
const invalidOption = require("../options/general/invalid-option");
const financialSector = require("../options/financeiro/financial-sector");
const menuOptions = require("../options/financeiro/menu-options");

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

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

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
    await showMenu(clientMessage).then((result) => msg.reply(result));
  } else if (options.includes(clientMessage)) {
    showOptions(clientMessage).then((result) => msg.reply(result));
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
    
Deseja seguir com as mesmas informações anteiores? 
Pode também encaminhar o novo CNPJ a tratarmos.`;
  }

  return `${saudacao}`;
}

async function showMenu() {
  return `Após o envio das informações solicitadas. Selecione a opção:
  
  1 - Boleto/Pagamento;
  2 - Chave PIX da empresa;
  3 - Nota Fiscal;
  4 - Acordo Financeiro;
  5 - Contrato;
  6 - Contratação;
  7 - Cobrança Ecad;
  8 - Cancelamento;
  9 - Fale com o setor Financeiro;
  10 - Outros setores;
  11 - Voltar ao Menu Principal.`;
}

client.initialize();
