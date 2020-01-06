const chat = require('../models/chat');

exports.createChat = (obj,cb) => {
    chat.create(
        obj,
    (error,result) => {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.addMessage = (chatid,obj,cb) => {
    // console.log(obj);
    chat.updateOne(
        {
            "_id" : chatid 
        },
        {
            $set : 
            {
                lastActivity : Date.now() 
            },
            $push :
            {
                message : obj
                // message : {
                //             $each :  [obj],
                //             $position: 0
                //           }
            }  
        }
        ,(error,result)=> {
        if(error)
        throw error;
        else {
            cb(null,result);
        }
    })
}

exports.getMessages = (chatid,skip_count,cb) => {
    chat.findOne(
        {
            "_id" : chatid
        },
        {
            "message" : 
            {
                $slice : [Number(skip_count),10]
            }
        },
        (error,result) => {
            if(error)
            throw error;
            else {
                cb(null,result);
            }
        }
    )
}