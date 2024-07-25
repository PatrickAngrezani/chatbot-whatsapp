const fs = require("fs");
const timeStarted = new Date().toLocaleString();
const serviceMapFilePath = "../../service-map.json";

const teammateNames = [
  "caires",
  "debora",
  "débora",
  "eduardo",
  "fernanda",
  "je",
  "katharine",
  "marcelo",
  "patrick",
  "raphael",
];

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
  "5518996074748@c.us",
  "555189932522@c.us",
  "5551989932522@c.us",
  "552792481106@c.us",
  "5527992481106@c.us",
];

const dddSouthEast = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "24",
  "27",
  "28",
  "31",
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
];

const greetings = require("./greetings");

const leadEmailMessage = `[testing email message]`;

const greetingsForm = `Olá! 👋 Somos da InfyMedia!

Recebemos sua solicitação de contato através do nosso site!

O objetivo aqui é entender um pouco mais sobre suas necessidades e detectar como podemos ajudar. Por isso, vamos fazer algumas perguntas, ok?`;

const formQuestionsRadioIndoor = [
    {
      question: `Sua empresa já possui equipamento e estrutura de som instalada?
1 - Sim
2 - Não`,
      validAnswers: ["1", "2"],
      type: "multiple-choice",
    },
    {
      question: `Já possui um fornecedor de rádio indoor?
1 - Sim
2 - Não`,
      validAnswers: ["1", "2"],
      type: "multiple-choice",
    },
    {
      question: `Sua empresa já paga taxa de ECAD?
1 - Sim
2 - Não`,
      validAnswers: ["1", "2"],
      type: "multiple-choice",
    },
    {
      question: `Gostaria de ter músicas conhecidas que são passíveis de cobrança de ECAD (nosso Plano Hits) ou prefere um acervo exclusivo que isente 100% a taxa de ECAD com garantia jurídica (nosso Plano Royalty Free)?
1 - Plano Hits
2 - Plano Royalty Free`,
      validAnswers: ["1", "2"],
      type: "multiple-choice",
    },
    {
      question: `Sua empresa já tem ou gostaria de ter vinhetas, anúncios e spots personalizados?
1 - Sim
2 - Não`,
      validAnswers: ["1", "2"],
      type: "multiple-choice",
    },
  {
    question: `Gostaria de fazer parte da nossa rede de cashback da InfyAds, que busca anunciantes para veicular anúncios e, dessa forma, receber cashback?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
  {
    question: `Qual é o principal objetivo ao implementar o rádio indoor na sua empresa?
1 - Entreter os clientes
2 - Informar sobre produtos e serviços
3 - Aumentar as vendas
4 - Outros: (Especifique)`,
    validAnswers: ["1", "2", "3", "4"],
    type: "multiple-choice",
    requiresDetail: "4",
  },
  {
    question: `Qual é o tamanho do seu estabelecimento?
1 - Pequeno (até 50m²)
2 - Médio (51m² a 200m²)
3 - Grande (acima de 200m²)`,
    validAnswers: ["1", "2", "3"],
    type: "multiple-choice",
  },
  {
    question: `Quantos locais ou filiais você pretende equipar com nosso serviço de rádio indoor?
1 - Um local
2 - Entre 2 a 5 locais
3 - Mais de 5 locais`,
    validAnswers: ["1", "2", "3"],
    type: "multiple-choice",
  },
  {
    question: `Qual é a faixa etária predominante do seu público?
1 - Menos de 18 anos
2 - 18 a 25 anos
3 - 26 a 35 anos
4 - 36 a 50 anos
5 - Acima de 50 anos`,
    validAnswers: ["1", "2", "3", "4", "5"],
    type: "multiple-choice",
  },
  {
    question: `Qual é a classe social predominante do seu público?
1 - Classe A
2 - Classe B
3 - Classe C
4 - Classe D`,
    validAnswers: ["1", "2", "3", "4"],
    type: "multiple-choice",
  },
  {
    question: `Qual é o tipo de negócio da sua empresa?
(Resposta aberta)`,
    type: "open-ended",
  },
  {
    question: `Você teria interesse em TV indoor também?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
];

async function loadServices() {
  try {
    const serviceMapJson = fs.readFileSync(serviceMapFilePath, "utf-8");
    return JSON.parse(serviceMapJson);
  } catch (error) {
    console.error("error trying to load services historic", error);
    return {};
  }
}

async function hasService(author) {
  try {
    servicesMap = await loadServices();
  } catch (error) {
    console.error("Error loading serviceMap:", error);
    servicesMap = {};
  }
  const serviceAuthor = servicesMap[author];

  if (serviceAuthor) {
    if (
      serviceAuthor[serviceAuthor.length - 1].date.split(" ")[0] ==
      timeStarted.split(" ")[0]
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function saveService(author, date, body) {
  try {
    let servicesMap;
    try {
      servicesMap = await loadServices();
    } catch (error) {
      console.error("Error loading serviceMap:", error);
      servicesMap = {};
    }

    servicesMap[author] = servicesMap[author] || [];
    servicesMap[author].push({ date, body });

    const serviceMapJson = JSON.stringify(servicesMap, null, 2);
    fs.writeFileSync(serviceMapFilePath, serviceMapJson);

    const servicesObject = servicesMap[author];

    return servicesObject;
  } catch (error) {
    console.error("Error saving service record:", error);
  }
}

async function checkGreetings(message) {
  let found = false;
  const words = message.split(" ");

  for (const salutation of greetings) {
    if (words.includes(salutation)) {
      found = true;
      break;
    }
  }

  return found;
}

async function checkDayShift() {
  let daytime;
  const date = new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    daytime = "Bom dia!";
  } else if (hour >= 12 && hour < 18) {
    daytime = "Boa tarde!";
  } else {
    daytime = "Boa noite!";
  }

  return daytime;
}

async function updateDayTime(currentDayTime) {
  const newDayTime = await checkDayShift();
  if (newDayTime != currentDayTime) {
    currentDayTime = newDayTime;
  }
  return currentDayTime;
}

module.exports = {
  loadServices,
  hasService,
  saveService,
  checkGreetings,
  teammateNames,
  companyNumbers,
  updateDayTime,
  dddSouthEast,
  formQuestionsRadioIndoor,
  leadEmailMessage,
  greetingsForm,
};
