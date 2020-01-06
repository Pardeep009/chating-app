const group = require('../models/groupconnection');

exports.createGroup = (obj,cb) => {
    group.create(obj,(error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.GetAllMembers = (groupid,cb) => {
    group.findOne({
        "_id" : groupid,
    }).select('groupmembers').exec( (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.addMember = (groupid,member,cb) => {
    group.updateOne({
        "_id" : groupid
    },
    {
        $push : {
            groupmembers : member
        }
    },(error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.GetGroupDetail = (groupid,cb) => {
    group.findOne({
        "_id" : groupid,
    }).select('chatid groupname createDate creater groupmembers').exec( (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}