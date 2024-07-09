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
  "555180326030@c.us",
  "555189932522@c.us",
  "5551989932522@c.us",
  "552792481106@c.us",
  "5527992481106@c.us",
];

const greetings = require("./greetings");

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

  for (const salutation of greetings) {
    if (message.includes(salutation)) {
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
};
