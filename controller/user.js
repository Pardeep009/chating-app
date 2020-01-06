const user = require('../models/user');

exports.login = (obj,cb) => {
    user.findOne({
       phone : obj.phone,
       password : obj.password
    }
    ,(error,data) => {
        if(error)
        {
            throw error;
        }
        else {
            cb(null,data);
        }
    })
}


exports.findByEmailOrPhone = (obj,cb) => {
    user.findOne({
        $or : [ { "phone" : obj.phone } , { "email" : obj.email } ]
    }
    ,(error,result) =>
    {
        if(error)
        {
            throw error;
        }
        else {
            cb(null,result);
        }
    })
}

exports.findByPhone = (num,cb) => {
    user.findOne({
        "phone" : num
    }
    ,(error,result) =>
    {
        if(error)
        {
            throw error;
        }
        else {
            cb(null,result);
        }
    })
}

exports.addUser = (obj,cb) => {
    console.log(obj);
    user.create(obj,(error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.updateNameofConnection = (query,name,cb) => {
    user.updateOne(
        query,
        { 
            $set : { "personalconnections.$.name" : name } 
        },(error,result) =>
        {
            if(error)
            throw error;
            else {
            cb(null,result);
        }
    })
}

exports.findConnections = (conditioins,query,cb) => {
    user.findOne(conditioins).populate(query).exec((error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.addChatToUser = (id,obj,cb) => {
    user.updateOne({
        "_id" : id
    },
    { 
        $push : { personalconnections : obj}
    },
    (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.addGroupToUser = (userid,groupid,cb) => {
    user.updateOne({
        "_id" : userid
    },
    {
        $push : { groupconnections : groupid }
    },
    (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.getPersonalConnections = (userid,cb) => {
    user.findOne({
        "_id" : userid
    }).select('personalconnections').exec((error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.addGroup = (userid,groupid,cb) => {
    user.updateOne({
        "_id" : userid
    },
    {
        $push : { groupconnections : groupid }
    },
    (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}