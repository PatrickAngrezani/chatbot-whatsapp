const fs = require("fs");
const serviceMapFilePath = "../../service-map.json";
fs.writeFileSync(serviceMapFilePath, JSON.stringify({}), "utf8");

let daytime = require("../hour-time");
const timeStarted = new Date().toLocaleString();

const express = require("express");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const spotOption = require("../options/suporte/spot-option");
const playerOption = require("../options/suporte/player-option");
const settingsOption = require("../options/suporte/settings-option");
const sectorsOption = require("../options/suporte/sectors-option");
const menuOptions = require("../options/suporte/menu-options");
const technicalSupport = require("../options/suporte/technical-support");
const technicalSupportMenu = require("../options/menu/technical-support-menu");
const { Form } = require("../database/mongo/formSchema");

require("dotenv").config;

const options = ["1", "2", "3", "4", "5", "6"];
const generalFunctions = require("./general/general");
const registerTracks = require("../options/general/register-tracks");
const conversationState = {};
let emailSuporteSent = false;

const mongoURL = "mongodb://mongodbcontainer:27017/chatbot-infymedia";

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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

async function sendQRCodeByEmail(qrCodeFilePath) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SUPORTE,
      pass: process.env.EMAIL_SUPORTE_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_SUPORTE,
    to: process.env.EMAIL_SUPORTE2,
    subject: "Your WhatsApp QR Code",
    text: "Por favor, escaneie esse QRCode com seu aplicativo do WhatsApp para conectar ao bot.",
    attachments: [
      {
        filename: "qrcode.png",
        path: qrCodeFilePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log("QR code sent via email.");
  emailSuporteSent = true;
}

function formatResponse(question, answer) {
  const lines = question.split("\n");
  const responseLine = lines.find((line) => line.startsWith(`${answer} -`));

  if (!responseLine) {
    console.error("No matching answer found in the question");
    return `${answer}`;
  }

  const formattedResponse = responseLine.split("-")[1].trim();

  return formattedResponse;
}

async function saveQuestionsResponsesDB(number, state) {
  let formattedResponse;

  const questions = [];
  const answers = [];

  try {
    state.responses.forEach((response) => {
      const question = response.question;
      const answer = response.answer;

      formattedResponse = formatResponse(question, answer);

      questions.push(question);
      answers.push(formattedResponse);
    });

    const brazilDate = generalFunctions.formatDateToBrazil(new Date());
    const parsedDate = generalFunctions.parseDate(brazilDate);

    await Form.create({
      company: state.company,
      client_first_name: state.firstName,
      client_last_name: state.lastName,
      client_phone: number,
      question: questions,
      answer: answers,
      date: parsedDate,
    });

    console.log(`Form number ${number} saved succesfully`);
  } catch (error) {
    console.error(`Error saving database:`, error);
  }
}

client.on("qr", async (qr) => {
  try {
    if (!emailSuporteSent) {
      const qrCodeFilePath = "qrcode.png";
      await qrcode.toFile(qrCodeFilePath, qr);
      console.log("QR code saved as qrcode.png");

      await sendQRCodeByEmail(qrCodeFilePath);
    }
  } catch (err) {
    console.error("Failed to generate or send QR code:", err);
  }
});

client.on("ready", () => {
  console.log("Connected");
});

client.on("message", async (msg) => {
  const timestamp = msg.timestamp;
  const dateMsg = new Date(timestamp * 1000).toLocaleString();
  const clientMessage = msg.body.toLowerCase().trim();
  const msgFrom = msg.from;
  const isGroupMessage = msgFrom.includes("g");
  const numberOfWords = clientMessage.split(" ").length;
  const formattedNumber = msgFrom.split("@")[0];

  if (!generalFunctions.companyNumbers.includes(msgFrom)) {
    const state =
      conversationState[`${formattedNumber}`] ||
      generalFunctions.createConversationState(
        conversationState,
        formattedNumber
      );

    switch (true) {
      case state.botActive === false:
        console.log(`Ignoring message, bot is inactive to ${formattedNumber}`);
        break;

      case state && state.answeringQuestions && state.type === "RadioIndoor":
        const currentQuestionIndexRadio = state.currentQuestion;
        const currentQuestionObjRadio =
          generalFunctions.formQuestionsRadioIndoor[currentQuestionIndexRadio];

        if (currentQuestionObjRadio) {
          if (state.awaitingDetail) {
            currentQuestionObjRadio.validAnswers = state.responses.push({
              question: `${currentQuestionObjRadio.question} (Detail)`,
              answer: clientMessage,
            });

            state.awaitingDetail = false;
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          } else if (currentQuestionObjRadio.type === "multiple-choice") {
            if (
              isValidResponse(
                currentQuestionIndexRadio,
                clientMessage,
                formattedNumber,
                `${state.type}`
              )
            ) {
              if (clientMessage === currentQuestionObjRadio.requiresDetail) {
                state.awaitingDetail = true;
                await client.sendMessage(
                  `${msgFrom}`,
                  "Por favor, especifique:"
                );
              } else {
                state.responses.push({
                  question: currentQuestionObjRadio.question,
                  answer: clientMessage,
                });
                state.currentQuestion++;

                await sendNextFormQuestion(msgFrom, `${state.type}`);
              }
            } else {
              await client.sendMessage(
                `${msgFrom}`,
                `Resposta inválida, por favor responda conforme as alternativas acima.
    
*Caso prefira não receber nosso atendimento automático pelos próximos 30 minutos, digite W.`
              );
            }
          } else if (currentQuestionObjRadio.type === "open-ended") {
            state.responses.push({
              question: currentQuestionObjRadio.question,
              answer: clientMessage,
            });
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          }
        } else {
          console.error("Error getting Current question object");
        }
        break;

      case state && state.answeringQuestions && state.type === "Infyads":
        const currentQuestionIndexInfyads = state.currentQuestion;
        const currentQuestionObjInfyads =
          generalFunctions.formQuestionsInfyads[currentQuestionIndexInfyads];

        if (currentQuestionObjInfyads) {
          if (state.awaitingDetail) {
            currentQuestionObjInfyads.validAnswers = state.responses.push({
              question: `${currentQuestionObjInfyads.question} (Detail)`,
              answer: clientMessage,
            });

            state.awaitingDetail = false;
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          } else if (currentQuestionObjInfyads.type === "multiple-choice") {
            if (
              isValidResponse(
                currentQuestionIndexInfyads,
                clientMessage,
                formattedNumber,
                `${state.type}`
              )
            ) {
              if (clientMessage === currentQuestionObjInfyads.requiresDetail) {
                state.awaitingDetail = true;
                await client.sendMessage(
                  `${msgFrom}`,
                  "Por favor, especifique:"
                );
              } else {
                state.responses.push({
                  question: currentQuestionObjInfyads.question,
                  answer: clientMessage,
                });
                state.currentQuestion++;

                await sendNextFormQuestion(msgFrom, `${state.type}`);
              }
            } else {
              const messageW = checkExitMessageW(clientMessage);

              if (messageW) {
                const state = conversationState[formattedNumber];

                client.sendMessage(
                  `${msgFrom}`,
                  "Desligando o bot por 30 minutos..."
                );

                return generalFunctions.turnOffBot(state);
              } else {
                await client.sendMessage(
                  `${msgFrom}`,
                  `Resposta inválida, por favor responda conforme as alternativas acima.
    
*Caso prefira não receber nosso atendimento automático pelos próximos 30 minutos, digite W.`
                );
              }
            }
          } else if (currentQuestionObjInfyads.type === "open-ended") {
            state.responses.push({
              question: currentQuestionObjInfyads.question,
              answer: clientMessage,
            });
            state.currentQuestion++;

            await sendNextFormQuestion(msgFrom, `${state.type}`);
          }
        } else {
          console.error("Error getting Current question object");
        }
        break;

      case (state.answeringQuestions === false && clientMessage !== "w") ||
        (state.answeringQuestions === "" && clientMessage !== "w"):
        if (generalFunctions.companyNumbers.includes(msgFrom)) {
          console.log(
            "Message didn't answer because it's from a company number"
          );
          return;
        }

        if (!dateMsg >= timeStarted) {
          console.log("Message sent before bot start");
          return;
        }

        if (isGroupMessage) {
          console.log("Message from a group message");
          return;
        }

        const hasService = await generalFunctions.hasService(formattedNumber);
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
        break;
    }
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
      return registerTracks;
    case "7":
      return menuOptions;
  }
}

async function welcomeMessage(hasService) {
  let saudacao;
  let currentDayTimeGreeting = generalFunctions.getGreeting();

  if (!hasService) {
    saudacao = `${currentDayTimeGreeting} Seja bem vindo(a) ao suporte técnico InfyMedia.`;
  } else {
    saudacao = `${currentDayTimeGreeting} Vejo que hoje já nos falamos. Por favor, selecione o tópico:`;
  }

  return `${saudacao}
  
${technicalSupportMenu}`;
}

client.initialize();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_COMERCIAL,
    pass: process.env.EMAIL_COMERCIAL_PASS,
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
  const firstNameLead = leadName.split(" ")[0];
  const lastNameLead = leadName.split(" ")[1];

  const formattedLeadFirstName =
    generalFunctions.formatName1CapitalLetter(firstNameLead);
  const formattedLeadLastName =
    generalFunctions.formatName1CapitalLetter(lastNameLead);

  let mailOptions = {
    from: process.env.EMAIL_COMERCIAL,
    to: `${leadEmail}`,
    subject: "Formulário InfyMedia",
    html: `${dayTimeFreetings}, ${formattedLeadFirstName}! Tudo bem?<br><br>

Que prazer receber seu contato e interesse! 

Sou o Caires, responsável pelo setor Comercial da InfyMedia, e estou entrando em contato para confirmar se você recebeu as informações enviadas pelos nossos formulários.  

Aproveito para avisar que também enviamos uma mensagem para você no WhatsApp.

+55 11 94270 0889  

Nossa equipe está pronta e aguardando suas respostas para dar continuidade ao atendimento de forma ágil e eficiente.<br><br>
    
Atenciosamente, Caires -  <a href="${linkWhatsApp}">Meu WhatsApp</a>.<br><br>`,
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

  let state = {};

  if (!conversationState[numberArgument]) {
    state = generalFunctions.createConversationState(
      conversationState,
      numberArgument
    );
  }

  state["firstName"] = formattedLeadFirstName;
  state["lastName"] = formattedLeadLastName;
  state["company"] = leadCompany;
  state["email"] = leadEmail;
  state["answeringQuestions"] = true;

  const destinataryNumber = `${conversationState[numberArgument].number}@c.us`;
  const formGreeting = leadRadioIndoor
    ? `Olá, ${formattedLeadFirstName}!👋 Somos da InfyMedia! Vejo que fala da empresa ${leadCompany}

Recebemos sua solicitação de contato através do nosso site!

O objetivo aqui é entender um pouco mais sobre suas necessidades e detectar como podemos ajudar. Por isso, vamos fazer algumas perguntas, ok?`
    : `Olá, ${formattedLeadFirstName}!👋 Somos da InfyMedia! Vejo que fala da empresa ${leadCompany} e gostaria de anunciar a marca ${brandToBeAnnounced}.

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("error starting app:", error);
  }
});

async function sendCTA(state, client_, number) {
  const questionIndex = generalFunctions.formQuestionsRadioIndoor.findIndex(
    (q) =>
      q.question.includes(
        "Quantos locais ou filiais você pretende equipar com nosso serviço de rádio indoor?"
      )
  );

  if (questionIndex !== -1) {
    const filialQuestion = state.responses[questionIndex];

    if (filialQuestion.answer === "1" || filialQuestion.answer === "2") {
      await client_.sendMessage(
        `${number}`,
        `Obrigado por suas respostas. Por favor, acesse agora mesmo nosso link de contratação! 

*Rádio Indoor para sua Empresa*
https://infymedia.com.br/solucoes/radio-indoor/`
      );
    } else if (filialQuestion.answer === "3") {
      await client_.sendMessage(
        `${number}`,
        `Obrigado por suas respostas. Por favor, contate agora mesmo nosso setor comercial!

*InfyMedia - Setor Comercial*
https://wa.me/5511942700889`
      );
    }
  }
}

async function sendNextFormQuestion(number, type) {
  const client_ = client;
  const formattedNumber = number.split("@")[0];

  if (type === "RadioIndoor") {
    const state =
      conversationState[formattedNumber] ||
      generalFunctions.createConversationState(
        conversationState,
        formattedNumber
      );

    state.type = "RadioIndoor";

    const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;

    if (state.currentQuestion < formQuestionsRadioIndoor.length) {
      const questionObj = formQuestionsRadioIndoor[state.currentQuestion];

      try {
        await client_.sendMessage(`${number}`, `${questionObj.question}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      await saveQuestionsResponsesDB(formattedNumber, state);

      await sendCTA(state, client_, number);

      state.answeringQuestions = false;

      const instructions = {
        company: state.company,
        responses: state.responses.map((response) => ({
          question: response.question.split("?")[0],
          answer: response.answer,
        })),
      };

      await sendTeamRadioInstructions(
        `120363301499456595@g.us`,
        instructions,
        state
      );

      delete conversationState[number];
    }
  } else if (type === "Infyads") {
    const state = conversationState[formattedNumber];
    state.type = "Infyads";

    const formQuestionsInfyads = generalFunctions.formQuestionsInfyads;

    if (state.currentQuestion < formQuestionsInfyads.length) {
      const questionObj = formQuestionsInfyads[state.currentQuestion];

      try {
        await client_.sendMessage(`${number}`, `${questionObj.question}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      await saveQuestionsResponsesDB(formattedNumber, state);

      await client_.sendMessage(
        `${number}`,
        `Perfeito! Muito obrigado por suas respostas.

Com base nas informações fornecidas, vamos gerar um link de acesso e finalizar a configuração do seu serviço de anúncios na rede InfyAds.

Por favor, aguarde enquanto preparamos tudo para você!`
      );
      state.answeringQuestions = false;

      const instructions = {
        company: state.company,
        responses: state.responses.map((response) => ({
          question: response.question.split("?")[0],
          answer: response.answer,
        })),
      };

      await sendTeamRadioInstructions(
        `120363301499456595@g.us`,
        instructions,
        state
      );

      delete conversationState[number];
    }
  }
}

function checkExitMessageW(clientMessage) {
  if (clientMessage !== "w") {
    return false;
  } else {
    return true;
  }
}

async function isValidResponse(questionIndex, clientMessage, number, type) {
  const formQuestionsRadioIndoor = generalFunctions.formQuestionsRadioIndoor;
  const formQuestionsInfyads = generalFunctions.formQuestionsInfyads;

  let validAnswers;
  let questionObj;

  const messageW = checkExitMessageW(clientMessage);
  if (messageW) {
    const state = conversationState[number];

    return generalFunctions.turnOffBot(state);
  }

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
      return validAnswers.includes(clientMessage.toLowerCase());
    }
    return true;
  }
  return true;
}

async function sendTeamRadioInstructions(number, instructions, state) {
  const leadFirstName = state.firstName;
  const leadPhoneNumber = state.number;

  let message = `Empresa *${instructions.company}*:\n
*Lead: ${leadFirstName} - ${leadPhoneNumber}*\n\n`;

  state.responses.forEach((response, index) => {
    const question = response.question;
    const answer = response.answer;

    const formattedResponse = formatResponse(question, answer);

    message += `${index + 1} - ${question}\n*R: ${formattedResponse}*\n\n`;
  });

  try {
    await client.sendMessage(number, message);
    console.log("Instruções enviadas para o time.");
  } catch (error) {
    console.error("Erro ao enviar instruções para o time:", error);
  }
}
