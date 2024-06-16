const fs = require("fs");
const timeStarted = new Date().toLocaleString();
const serviceMapFilePath = "../../service-map.json";

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

module.exports = { loadServices, hasService, saveService };
