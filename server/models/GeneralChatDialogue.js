const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const GeneralChatDialogue = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  user: String,
  messages: { type: Array, default: [] },
})

module.exports = mongoose.model('general-chat-dialogues', GeneralChatDialogue)
