require("dotenv").config();
const fs = require("fs");
const timeStarted = new Date().toLocaleString();
const serviceMapFilePath = "../../service-map.json";
const XLSX = require("xlsx");
const { DateTime } = require("luxon");

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
  "lorena",
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
  "555197294553@c.us",
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
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
];

const greetings = require("./greetings");

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

const formQuestionsInfyads = [
  {
    question: `Qual é o tipo de negócio da sua empresa?
(Resposta aberta)`,
    type: "open-ended",
  },
  {
    question: `Sua empresa já possui alguma experiência com anúncios sonoros dentro de estabelecimentos?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
  {
    question: `Qual é o principal objetivo ao utilizar os serviços de anúncios da InfyAds?
1 - Lançar um novo produto
2 - Fortalecer a presença da marca
3 - Aumentar o reconhecimento da marca
4 - Influenciar decisões de compra em tempo real
5 - Outros (especifique)`,
    validAnswers: ["1", "2", "3", "4", "5"],
    type: "multiple-choice",
    requiresDetail: "5",
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
    question: `Em quais segmentos você gostaria de anunciar para atingir mais o seu público?
1 - Vestuário
2 - Academias
3 - Supermercados
4 - Ferramentas/Construção
5 - Farmácias
6 - Barbearias
7 - Outros (especifique)`,
    validAnswers: ["1", "2", "3", "4", "5", "6", "7"],
    type: "multiple-choice",
    requiresDetail: "7",
  },
  {
    question: `Quais são as principais métricas que você utiliza para medir o sucesso de suas campanhas publicitárias?
1 - Alcance e frequência
2 - Taxa de cliques (CTR)
3 - Retorno sobre investimento (ROI)
4 - Conversões
5 - Engajamento (curtidas, comentários, compartilhamentos)
6 - Custo por Mil Impressões (CPM)
7 - Outros (especifique)`,
    validAnswers: ["1", "2", "3", "4", "5", "6", "7"],
    type: "multiple-choice",
    requiresDetail: "7",
  },
  {
    question: `Qual é o orçamento disponível para sua campanha publicitária? (Resposta aberta)`,
    type: "open-ended",
  },
  {
    question: `Qual é a duração planejada para sua campanha?
1 - Menos de 1 mês
2 - 1 a 3 meses
3 - 3 a 6 meses
4 - Mais de 6 meses`,
    validAnswers: ["1", "2", "3", "4"],
    type: "multiple-choice",
  },
  {
    question: `Você está interessado em criar campanhas personalizadas falando diretamente com seu público-alvo baseado em localização específica e comportamento de compra?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
  {
    question: `Você gostaria de receber suporte na criação e implementação de sua campanha publicitária?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
  {
    question: `Nossos pacotes incluem 3 inserções diárias com spots de até 15 segundos. Esses formatos são adequados para sua campanha?
1 - Sim
2 - Não`,
    validAnswers: ["1", "2"],
    type: "multiple-choice",
  },
  {
    question: `Quais são os principais desafios que você enfrenta atualmente em suas campanhas publicitárias?
(Resposta aberta)`,
    type: "open-ended",
  },
  {
    question: `Qual é o melhor dia e turno para que nossa equipe entre em contato e finalize a configuração do seu acesso?
1 - Segunda a sexta - Manhã
2 - Segunda a sexta - Tarde
3 - Segunda a sexta - Noite
4 - Sábado - Manhã
5 - Sábado - Tarde`,
    validAnswers: ["1", "2", "3", "4", "5"],
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

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour <= 12) {
    return "Bom dia!";
  } else if (currentHour >= 12 && currentHour <= 18) {
    return "Boa tarde!";
  } else {
    return "Boa noite!";
  }
}

function formatName1CapitalLetter(name) {
  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  } else {
    console.error("missing lead name");
  }
}

function createConversationState(conversationState, numberArgument) {
  conversationState[numberArgument] = {
    currentQuestion: 0,
    responses: [],
    awaitingDetail: false,
    number: numberArgument,
    answeringQuestions: false,
    botActive: true,
    company: "",
    email: "",
    answeringQuestions: "",
  };

  return conversationState[numberArgument];
}

function turnOffBot(state) {
  state.botActive = false;

  setTimeout(() => {
    state.botActive = true;
  }, 1800000);
  return;
}

async function formatFormsNumbers() {
  let formattedNumbers = [];

  const workbook = XLSX.readFile(filePath5);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const dataJson = XLSX.utils.sheet_to_json(worksheet);

  const phoneNumbers = dataJson.map((row) => row.phone_number);

  for (const number of phoneNumbers) {
    const formattedNumber = number.split("+")[1] + "@c.us";
    formattedNumbers.push(formattedNumber);
  }

  return formattedNumbers;
}

function formatDateToBrazil(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth is zero-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function parseDate(date) {
  const [datePart, timePart] = date.split(" ");
  const [day, month, year] = datePart.split("/");

  return new Date(`${year}-${month}-${day}T${timePart}`);
}

module.exports = {
  loadServices,
  hasService,
  saveService,
  checkGreetings,
  teammateNames,
  companyNumbers,
  getGreeting,
  dddSouthEast,
  formQuestionsRadioIndoor,
  greetingsForm,
  formQuestionsInfyads,
  formatName1CapitalLetter,
  createConversationState,
  turnOffBot,
  formatFormsNumbers,
  formatDateToBrazil,
  parseDate,
};
