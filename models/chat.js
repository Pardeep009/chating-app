const mongoose = require('mongoose');
const schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    text : String,
    senderid : { type: schema.Types.ObjectId, ref: 'users' },
    senderphone : Number,
    time : {},
    _id : { id : false},
})

const chatSchema = new mongoose.Schema({
    lastActivity : { type : Number , defalult : Date.now() },
    chatType : String,   // P -> Personal   ,  G -> Group
    message : [messageSchema]
})

const chat = mongoose.model('chats', chatSchema);
module.exports = chat;