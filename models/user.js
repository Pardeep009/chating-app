const mongoose = require('mongoose');
const schema = mongoose.Schema;

const personalconnectionSchema = new mongoose.Schema({
    chatid : { type : schema.Types.ObjectId, ref: 'chats' },
    name : String,
    friend : {},    // .id , .phone
    createDate : {},
    _id : { id : false}
})

// const groupconnectionSchema = new mongoose.Schema({
//     chatid : { type : schema.Types.ObjectId, ref: 'chats' },
//     groupname : String,
//     createDate : {},
//     creater : {},  // .id , .phone
//     groupmembers : [personSchema],
// })

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    phone: Number,
    personalconnections : [personalconnectionSchema],
    groupconnections : [{type : schema.Types.ObjectId, ref: 'groups'}],
})

const user = mongoose.model('users', userSchema);
module.exports = user;