const mongoose = require('mongoose');
const schema = mongoose.Schema;

const personSchema = mongoose.Schema({
    id : { type : schema.Types.ObjectId, ref: 'users' },
    phone : Number,
    _id : { id : false}
})

const groupconnectionSchema = new mongoose.Schema({
    chatid : { type : schema.Types.ObjectId, ref: 'chats' },
    groupname : String,
    createDate : {},
    creater : {},  // .id , .phone
    groupmembers : [],
})

const group = mongoose.model('groups', groupconnectionSchema);
module.exports = group;