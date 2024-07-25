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
let clientMessage;
let answerQuestions = false;

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
  clientMessage = msg.body.toLowerCase();
  const msgFrom = msg.from;
  const msgAuthor = msg.author;
  const isGroupMessage = msgFrom.includes("g");
  const numberOfWords = clientMessage.split(" ").length;

  if (!answerQuestions) {
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
  } else if (answerQuestions) {
    const state = conversationState[numberArgument];

    if (state) {
      const currentQuestionIndex = state.currentQuestion;
      const currentQuestionObj =
        generalFunctions.formQuestionsRadioIndoor[currentQuestionIndex];

      if (state.awaitingDetail) {
        currentQuestionObj.validAnswers = state.responses.push({
          question: `${currentQuestionObj.question} (Detail)`,
          answer: clientMessage,
        });

        state.awaitingDetail = false;
        state.currentQuestion++;

        await sendNextFormQuestion(numberArgument);
      } else if (currentQuestionObj.type === "multiple-choice") {
        if (isValidResponse(currentQuestionIndex, clientMessage)) {
          if (clientMessage === currentQuestionObj.requiresDetail) {
            state.awaitingDetail = true;
            await client.sendMessage(
              `${numberArgument}@c.us`,
              "Por favor, especifique:"
            );
          } else {
            state.responses.push({
              question: currentQuestionObj.question,
              answer: clientMessage,
            });
            state.currentQuestion++;

            await sendNextFormQuestion(numberArgument);
          }
        } else {
          await client.sendMessage(
            `${numberArgument}@c.us`,
            `Resposta inválida, por favor responda conforme as alternativas acima`
          );
        }
      } else if (currentQuestionObj.type === "open-ended") {
        state.responses.push({
          question: currentQuestionObj.question,
          answer: clientMessage,
        });
        state.currentQuestion++;

        await sendNextFormQuestion(numberArgument);
      }
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

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const conversationState = {};
let numberArgument;

client.on("receive-form", async (form) => {
  const { leadPhoneNumber, leadName, leadEmail } = form;
  const dddSouthEast = generalFunctions.dddSouthEast;
  // const leadEmailMessage = generalFunctions.leadEmailMessage;

  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: leadEmail,
  //   subject: "Formulário InfyMedia",
  //   text: `Nome: ${leadName}\nEmail: ${leadEmail}\nMensagem: ${leadEmailMessage}`,
  // };

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
    conversationState[numberArgument] = { currentQuestion: 0, responses: [] };
  }

  const greetingsForm = generalFunctions.greetingsForm;

  answerQuestions = true;
  await client.sendMessage(`${numberArgument}@c.us`, `${greetingsForm}`);
  try {
    await sendNextFormQuestion(numberArgument);
  } catch (error) {
    console.error("Error sending the first question:", error);
  } // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error("Erro ao enviar e-mail:", error);
  //     return { status: 500, message: "Server error trying send email" };
  //   } else {
  //     console.log("E-mail enviado:", info.response);
  //     return { status: 200, message: "Email sent succesfully" };
  //   }
  // });
});

const app = express();
app.use(bodyParser.json());

let leadPhoneNumber;
let leadName;
let leadEmail;

app.post("/rd-webhook", (req, res) => {
  const leads = req.body.leads;
  for (const lead of leads) {
    leadPhoneNumber = lead.personal_phone;
    leadName = lead.name;
    leadEmail = lead.email;

    client.emit("receive-form", {
      leadPhoneNumber,
      leadName,
      leadEmail,
    });
  }

  res.status(200).send("Event received");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function sendNextFormQuestion(number) {
  const state = conversationState[number] || {
    currentQuestion: 0,
    responses: [],
    awaitingDetail: false,
  };
  const client_ = client;
  const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;

  if (state.currentQuestion < formQuestionsRadioIndoor.length) {
    const questionObj = formQuestionsRadioIndoor[state.currentQuestion];
    try {
      await client_.sendMessage(`${number}@c.us`, `${questionObj.question}`);
    } catch (error) {
      console.error(error);
    }
  } else {
    await client_.sendMessage(
      `${number}@c.us`,
      "Todas as perguntas foram respondidas. Obrigado! Em breve um dos nossos profissinais entrará em contato para dar sequência ao atendimento."
    );
    answerQuestions = false;

    delete conversationState[number];
  }
}

function isValidResponse(questionIndex, response) {
  const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;
  const validAnswers = formQuestionsRadioIndoor[questionIndex].validAnswers;
  if (
    formQuestionsRadioIndoor[questionIndex].type === "multiple-choice" &&
    !formQuestionsRadioIndoor[questionIndex].requiresDetail
  ) {
    return validAnswers.includes(response.toLowerCase());
  }
  return true;
}
