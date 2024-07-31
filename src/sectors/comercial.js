require("dotenv").config();
const fs = require("fs");
const serviceMapFilePath = "../../service-map.json";
fs.writeFileSync(serviceMapFilePath, JSON.stringify({}), "utf8");

let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const express = require("express");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const servicesAndProducts = require("../options/comercial/services-and-products");
const plansAndValues = require("../options/comercial/plans-and-values");
const partnershipsAndAdvertising = require("../options/comercial/partnerships-and-advertising");
const hiringProcess = require("../options/comercial/hiring-process");
const sectorsOption = require("../options/comercial/sectors-option");
const menuOptions = require("../options/comercial/menu-options");
const royaltyFree = require("../options/comercial/royalty-free");
const spots = require("../options/comercial/spots");
const metrics = require("../options/comercial/metrics");
const comercial = require("../options/comercial/comercial-sector");
const legislation = require("../options/comercial/legislation");
const comercialMenu = require("../options/menu/comercial-menu");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const generalFunctions = require("./general/general");
const conversationState = {};

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
  const numberOfWords = clientMessage.split(" ").length;

  const state = conversationState[msgFrom.split("@")[0]];

  if (state && state.type === "RadioIndoor") {
    const currentQuestionIndex = state.currentQuestion;
    const currentQuestionObj =
      generalFunctions.formQuestionsRadioIndoor[currentQuestionIndex];

    if (currentQuestionObj) {
      if (state.awaitingDetail) {
        currentQuestionObj.validAnswers = state.responses.push({
          question: `${currentQuestionObj.question} (Detail)`,
          answer: clientMessage,
        });

        state.awaitingDetail = false;
        state.currentQuestion++;

        await sendNextFormQuestion(msgFrom, `${state.type}`);
      } else if (currentQuestionObj.type === "multiple-choice") {
        if (
          isValidResponse(
            currentQuestionIndex,
            clientMessage,
            msgFrom.split("@")[0],
            `${state.type}`
          )
        ) {
          2;
          if (clientMessage === currentQuestionObj.requiresDetail) {
            state.awaitingDetail = true;
            await client.sendMessage(`${msgFrom}`, "Por favor, especifique:");
          } else {
            state.responses.push({
              question: currentQuestionObj.question,
              answer: clientMessage,
            });
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          }
        } else {
          await client.sendMessage(
            `${msgFrom}`,
            `Resposta inválida, por favor responda conforme as alternativas acima`
          );
        }
      } else if (currentQuestionObj.type === "open-ended") {
        state.responses.push({
          question: currentQuestionObj.question,
          answer: clientMessage,
        });
        state.currentQuestion++;

        await sendNextFormQuestion(msgFrom, `${state.type}`);
      }
    } else {
      console.error("Error getting Current question object");
    }
  } else if (state && state.type === "Infyads") {
    const currentQuestionIndex = state.currentQuestion;
    const currentQuestionObj =
      generalFunctions.formQuestionsInfyads[currentQuestionIndex];

    if (currentQuestionObj) {
      if (state.awaitingDetail) {
        currentQuestionObj.validAnswers = state.responses.push({
          question: `${currentQuestionObj.question} (Detail)`,
          answer: clientMessage,
        });

        state.awaitingDetail = false;
        state.currentQuestion++;

        await sendNextFormQuestion(msgFrom, `${state.type}`);
      } else if (currentQuestionObj.type === "multiple-choice") {
        if (
          isValidResponse(
            currentQuestionIndex,
            clientMessage,
            msgFrom.split("@")[0],
            `${state.type}`
          )
        ) {
          if (clientMessage === currentQuestionObj.requiresDetail) {
            state.awaitingDetail = true;
            await client.sendMessage(`${msgFrom}`, "Por favor, especifique:");
          } else {
            state.responses.push({
              question: currentQuestionObj.question,
              answer: clientMessage,
            });
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          }
        } else {
          await client.sendMessage(
            `${msgFrom}`,
            `Resposta inválida, por favor responda conforme as alternativas acima`
          );
        }
      } else if (currentQuestionObj.type === "open-ended") {
        state.responses.push({
          question: currentQuestionObj.question,
          answer: clientMessage,
        });
        state.currentQuestion++;

        await sendNextFormQuestion(msgFrom, `${state.type}`);
      }
    } else {
      console.error("Error getting Current question object");
    }
  } else {
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
              msg.reply(result)
            );
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
        console.log("Message sent before bot start");
      }
    } else {
      console.log("Message didn't answered because is from a company number");
    }
  }
});

async function welcomeMessage(hasService) {
  let saudacao;
  if (!hasService) {
    saudacao = `${daytime} Seja Bem-vindo ao setor Comercial InfyMedia! Por favor, selecione uma opção para continuar:`;
  } else {
    saudacao = `${daytime} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
    
${comercialMenu}`;
}

async function showOptions(option) {
  switch (option) {
    case "1":
      return servicesAndProducts;
    case "2":
      return plansAndValues;
    case "3":
      return partnershipsAndAdvertising;
    case "4":
      return hiringProcess;
    case "5":
      return royaltyFree;
    case "6":
      return spots;
    case "7":
      return legislation;
    case "8":
      return metrics;
    case "9":
      return comercial;
    case "10":
      return sectorsOption;
    case "11":
      return menuOptions;
  }
}

client.initialize();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

client.on("receive-form", async (form) => {
  const {
    leadPhoneNumber,
    leadName,
    leadEmail,
    leadCompany,
    leadInfyads,
    leadRadioIndoor,
    brandToBeAnnounced,
  } = form;
  const dddSouthEast = generalFunctions.dddSouthEast;
  let numberArgument;
  const linkWhatsApp = "https://wa.me/5511942700889";
  let dayTimeFreetings = daytime.split("!")[0];

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${leadEmail}`,
    subject: "Formulário InfyMedia",
    html: `${dayTimeFreetings}, ${leadName}! Espero que recebas essa mensagem bem!<br><br>

Meu nome é Raphael Caires, responsável pelo setor Comercial da InfyMedia.<br><br>
    
Estou entrando em contato para confirmar o recebimento das informações através dos nossos formulários. Aproveito para avisar que te enviamos uma mensagem no WhatsApp.<br><br>

Nossa equipe aguarda suas respostas para prosseguir com o atendimento.<br><br>
    
Atenciosamente, Raphael Caires -  <a href="${linkWhatsApp}">Meu WhatsApp</a>.<br><br>`,
  };

  if (leadPhoneNumber) {
    const stringNumber = leadPhoneNumber.split("+")[1].replace(/[()\s-]/g, "");
    const stringNumber8Digits =
      stringNumber.substring(0, 4) + stringNumber.substring(5);

    const dddNumber = stringNumber.substring(2, 4);

    numberArgument = dddSouthEast.includes(dddNumber)
      ? stringNumber
      : stringNumber8Digits;
  }

  if (!conversationState[numberArgument]) {
    conversationState[numberArgument] = {
      currentQuestion: 0,
      responses: [],
      awaitingDetail: false,
      number: numberArgument,
      email: leadEmail,
      answeringQuestions: true,
    };
  }

  const destinataryNumber = `${conversationState[numberArgument].number}@c.us`;
  const formGreeting = leadRadioIndoor
    ? `Olá, ${leadName}!👋 Somos da InfyMedia! Vejo que fala da empresa ${leadCompany}

Recebemos sua solicitação de contato através do nosso site!

O objetivo aqui é entender um pouco mais sobre suas necessidades e detectar como podemos ajudar. Por isso, vamos fazer algumas perguntas, ok?`
    : `Olá, ${leadName}!👋 Somos da InfyMedia! Vejo que fala da empresa ${leadCompany} e gostaria de anunciar a marca ${brandToBeAnnounced}.

Recebemos sua solicitação de contato através do nosso site!

O objetivo aqui é entender um pouco mais sobre suas necessidades e detectar como podemos ajudar. Por isso, vamos fazer algumas perguntas, ok?`;

  await client.sendMessage(destinataryNumber, `${formGreeting}`);
  try {
    let type;
    if (leadRadioIndoor) {
      type = "RadioIndoor";
      conversationState[numberArgument]["type"] = "RadioIndoor";
    } else if (leadInfyads) {
      type = "Infyads";
      conversationState[numberArgument]["type"] = "Infyads";
    }

    await sendNextFormQuestion(destinataryNumber, `${type}`);
  } catch (error) {
    console.error("Error sending the first question:", error);
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      return { status: 500, message: "Server error trying send email" };
    } else {
      console.log("E-mail enviado:", info.response);
      return { status: 200, message: "Email sent succesfully" };
    }
  });
});

const app = express();
app.use(bodyParser.json());

app.post("/rd-webhook", (req, res) => {
  const leads = req.body.leads;

  for (const lead of leads) {
    const leadObject = {
      leadPhoneNumber: lead.personal_phone,
      leadName: lead.name,
      leadEmail: lead.email,
      leadCompany: lead.company,
      leadRadioIndoor: true,
    };

    client.emit("receive-form", {
      leadPhoneNumber: leadObject["leadPhoneNumber"],
      leadName: leadObject["leadName"],
      leadEmail: leadObject["leadEmail"],
      leadCompany: leadObject["leadCompany"],
      leadRadioIndoor: leadObject["leadRadioIndoor"],
    });
  }

  res.status(200).send("Event received");
});

app.post("/infyads-webhook", (req, res) => {
  const leads = req.body.leads;
  for (const lead of leads) {
    const leadObject = {
      leadPhoneNumber: lead.personal_phone,
      leadName: lead.name,
      leadEmail: lead.email,
      leadCompany: lead.company,
      leadInfyads: true,
      brandToBeAnnounced:
        lead.custom_fields["Lead Scoring- Empresa ou Marca (Anunciantes)"],
    };

    client.emit("receive-form", {
      leadPhoneNumber: leadObject["leadPhoneNumber"],
      leadName: leadObject["leadName"],
      leadEmail: leadObject["leadEmail"],
      leadCompany: leadObject["leadCompany"],
      leadInfyads: leadObject["leadInfyads"],
      brandToBeAnnounced: leadObject["brandToBeAnnounced"],
    });
  }

  res.status(200).send("Event received");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function sendNextFormQuestion(number, type) {
  const client_ = client;
  if (type === "RadioIndoor") {
    const state = conversationState[number.split("@")[0]] || {
      currentQuestion: 0,
      responses: [],
      awaitingDetail: false,
      number: number.split("@")[0],
      answeringQuestions: true,
      type: "RadioIndoor",
    };

    const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;

    if (state.currentQuestion < formQuestionsRadioIndoor.length) {
      const questionObj = formQuestionsRadioIndoor[state.currentQuestion];

      try {
        await client_.sendMessage(`${number}`, `${questionObj.question}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      await client_.sendMessage(
        `${number}`,
        "Todas as perguntas foram respondidas. Obrigado! Em breve um dos nossos profissinais entrará em contato para dar sequência ao atendimento."
      );
      state.answeringQuestions = false;

      delete conversationState[number];
    }
  } else if (type === "Infyads") {
    const state = conversationState[number.split("@")[0]] || {
      currentQuestion: 0,
      responses: [],
      awaitingDetail: false,
      number: number.split("@")[0],
      answeringQuestions: true,
      type: "Infyads",
    };
    const formQuestionsInfyads = generalFunctions.formQuestionsInfyads;

    if (state.currentQuestion < formQuestionsInfyads.length) {
      const questionObj = formQuestionsInfyads[state.currentQuestion];

      try {
        await client_.sendMessage(`${number}`, `${questionObj.question}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      await client_.sendMessage(
        `${number}`,
        `Perfeito! Muito obrigado por suas respostas.

Com base nas informações fornecidas, vamos gerar um link de acesso e finalizar a configuração do seu serviço de anúncios na rede InfyAds.

Por favor, aguarde enquanto preparamos tudo para você!`
      );
      state.answeringQuestions = false;

      delete conversationState[number];
    }
  }
}

function isValidResponse(questionIndex, response, number, type) {
  const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;
  const formQuestionsInfyads = generalFunctions.formQuestionsInfyads;

  let validAnswers;
  let questionObj;

  if (type === "RadioIndoor") {
    validAnswers = formQuestionsRadioIndoor[questionIndex].validAnswers;
    questionObj = formQuestionsRadioIndoor[questionIndex];
  } else if (type === "Infyads") {
    validAnswers = formQuestionsInfyads[questionIndex].validAnswers;
    questionObj = formQuestionsInfyads[questionIndex];
  }

  const state = Object.values(conversationState).find(
    (state) => state.number === number
  );

  if (
    state &&
    state.currentQuestion === questionIndex &&
    state.number === number
  ) {
    if (questionObj.type === "multiple-choice" && !questionObj.requiresDetail) {
      return validAnswers.includes(response.toLowerCase());
    }
    return true;
  }
  return true;
}
