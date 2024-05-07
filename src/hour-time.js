const now = new Date();
const hour = now.getHours();
let daytime;

switch (hour) {
  case 5:
  case 6:
  case 7:
  case 8:
  case 9:
  case 10:
  case 11:
  case 12:
    daytime = "Bom dia!";
    console.log("Bom dia! ☀️");
    break;
  case 13:
  case 14:
  case 15:
  case 16:
  case 17:
    daytime = "Boa tarde!";
    console.log("Boa tarde! ️🔆");
    break;
  default:
    break;
  case 18:
  case 19:
  case 20:
  case 21:
  case 22:
  case 23:
    daytime = "Boa noite!";
    console.log("Boa noite! 🌑");
    break;
}

module.exports = daytime;
