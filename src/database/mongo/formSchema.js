const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  company: String,
  client_first_name: String,
  client_last_name: String,
  client_phone: Number,
  question: [String],
  answer: [String],
  date: Date,
});

const Form = mongoose.model("Form", formSchema);

module.exports = { Form };
