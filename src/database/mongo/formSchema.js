const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  client_phone: Number,
  question: [String],
  answer: [String],
  date: Date,
});

const Form = mongoose.model("Form", formSchema);

module.exports = { Form };
