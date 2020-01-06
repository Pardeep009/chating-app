const express = require('express');
const router = express.Router();
const path = require('path');
const userController = require('../controller/user');
const chatController = require('../controller/chat');
const groupController = require('../controller/group');

const {ObjectId} = require('mongodb');

router.use(express.static(path.join(__dirname,'../public')));

router.get('/',(req,res,next) =>
{
    // console.log('1');
    res.render('login');
});

router.get('/home',checkLogin,(req,res,next) =>
{
    res.render('home',{ userid : req.session.userid , userphone : req.session.phone });
})

router.post('/login',(req,res) => {
    req.body.phone = Number(req.body.phone);
    userController.login(req.body,(err,data) => {
        if(err)
        throw err;
        else {
            if(data)        // user existsp
            {
                req.session.userid = data._id;
                req.session.phone = data.phone;
                req.session.isLogin = 1;
                res.send("1");
                // res.render('home');
            }
            else {             // user does not exists
                res.send("0");
            }
        }
    })
});

router.post('/addFriend',(req,res) => {
    req.body.phone = Number(req.body.phone);
    userController.findByPhone(req.body.phone, (err,result) => {
        if(err)
        throw err;
        else if(result)
        {
            let i;
            let obj = {};
            let friendid = result._id;
            let friendphone = result.phone;
            // console.log(result);
            for(i=0;i<result.personalconnections.length;i++)
            {
                if(result.personalconnections[i].friend.id == req.session.userid)
                {
                    // console.log('FOUND');
                    obj = {
                        _id : req.session.userid,
                        chatid : result.personalconnections[i].chatid,
                        name : req.body.name
                    }
                    break;
                }
            }
            if(i != result.personalconnections.length)
            {
                let query = {
                    "_id" : obj._id,
                    "personalconnections.chatid" : obj.chatid,
                    "personalconnections.name" : '',
                }
                // console.log(query);
                userController.updateNameofConnection(query,obj.name,(err,result) => {
                    if(err)
                    throw err;
                    else {
                        if(result.nModified == 0)
                        {
                            res.send("1")                // already added as your friend   
                        }
                        else {
                            res.send({                    // friend name updated,not added
                                friendid : friendid,
                                chatid : obj.chatid
                            })  
                        }
                    }
                })
            }
            else {
                obj = {
                    lastActivity : Date.now(),
                    chatType : "P"
                }
                chatController.createChat(obj,(err,result) => {
                    if(err)
                    throw err;
                    else {
                        obj = {
                            chatid : result._id,
                            name : req.body.name,
                            friend : {
                                id :  ObjectId(friendid),
                                phone : friendphone
                            },
                            createDate : req.body.time,
                        }
                        userController.addChatToUser(req.session.userid,obj,(error,rslt1) => {
                            if(error)
                            throw error;
                            else {
                                obj = {
                                    chatid : result._id,
                                    name : '',
                                    friend : {
                                        id :  ObjectId(req.session.userid),
                                        phone : req.session.phone
                                    },
                                    createDate : req.body.time,
                                }
                                userController.addChatToUser(friendid,obj,(error,rslt) => {
                                    if(error)
                                    throw error;
                                    else {
                                        if(error)
                                        throw error;
                                        else {
                                            res.send({
                                                friendid : friendid,
                                                chatid : result._id
                                            });       // friend added;
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
        else {
            res.send("0");  // friend does not exist
        }
    })
})

router.post('/createGroup',(req,res) => {
    let obj = {
        lastActivity : Date.now(),
        chatType : "G",
    }
    chatController.createChat(obj,(error,result) => {
        if(error)
        throw error;
        else {
            req.body.chatid = result._id;
            req.body.creater = {
                id : ObjectId(req.session.userid),
                phone : Number(req.session.phone),
            }
            groupController.createGroup(req.body,(error,result) => {
                if(error)
                throw error;
                else {
                    userController.addGroupToUser(req.session.userid,result._id,(error,rslt) => {
                        if(error)
                        throw error;
                        else {
                            res.send({
                                chatid : req.body.chatid,
                                groupid : result._id
                            });
                        }
                    })
                }
            })
        }
    })
})

router.get('/getConnections', (req,res) => {
    let query = [{ 
                    path : 'personalconnections.chatid',
                    select : { 'lastActivity' : 1 , 'chatType' : 1 ,'message.length' : 1  
                }},
                { 
                    path : 'groupconnections', 
                    select : { 'chatid' : 1 , 'groupname' : 1 , 'createDate' : 1 , 'creater' : 1  , 'groupmembers' : 1  }, 
                    populate : { path : 'chatid',
                    select : { 'lastActivity' : 1 ,'chatType' : 1, 'message.length' : 1  } }
                }];
    let conditions = {
        "_id" : req.session.userid,
    }
    userController.findConnections(conditions,query,(error,result) => {
        if(error)
        throw error;
        else {
            res.send(result);
        }
    })
})

router.post('/addFriendToGroup',(req,res) => {
    let obj = req.body;
    obj.groupid = ObjectId(obj.groupid);
    obj.member.id = ObjectId(obj.member.id);
    userController.addGroup(obj.member.id,obj.groupid, (error,result) => {
        if(error)
        throw error;
        else {
            groupController.addMember(obj.groupid,obj.member , (error,result) => {
                if(error)
                throw error;
                else {
                    res.send(result);
                }
            })
        }
    })
})

router.post('/getMembersOfGroup',(req,res) => {
    groupController.GetAllMembers(req.body.groupid, (error,result) => {
        if(error)
        throw error;
        else {
            res.send(result);
        }
    })
})

router.post('/getGroupDetail',(req,res) => {
    groupController.GetGroupDetail(req.body.groupid, (error,result) => {
        if(error)
        throw error;
        else {
            res.send(result);
        }
    })
})

router.post('/addUser',(req,res) => {
    req.body.phone = Number(req.body.phone);
    userController.findByEmailOrPhone(req.body,(err,data) =>
    {
        if(err)
        throw err;
        else {
            if(data)
            {
                res.send("0");   // user exists
            }
            else {
                // req.body.connections = {
                //     personalconnections : [],
                //     groupconnections : [],
                // }
                userController.addUser(req.body,(err,data) => {
                    if(err)
                    throw err;
                    else {
                        // res.render('home');
                        req.session.userid = data._id;
                        req.session.phone = data.phone;
                        req.session.isLogin = 1;
                        res.send("1");  // user created
                    }
                })
            }
        }
    });
})

router.post('/getPersonalConnections', (req,res) => {
    userController.getPersonalConnections(req.body.userid,(error,data) => {
        if(error)
        throw error;
        else {
            res.send(data);
        }
    })
})

router.post('/sendMessage/:chatid', (req,res) => {
    // req.body.sender.phone = Number(req.body.sender.phone);
    // req.body.sender.id = ObjectId(req.body.sender.id);
    req.body.senderphone = Number(req.body.senderphone);
    req.body.senderid = ObjectId(req.body.senderid);
    let obj = req.body;
    chatController.addMessage(req.params.chatid,obj,(error,result) => {
        if(error)
        throw error;
        else {
            res.send("message added");
        }
    })
})

router.get('/getMessages/:chatid/:skip', (req,res) => {
    chatController.getMessages(req.params.chatid,Number(req.params.skip),(error,result) => {
        if(error)
        throw error;
        else {
            res.send(result);
        }
    })
})

router.get('/logout', (req,res) => {
    req.session.isLogin = 0;
    req.session.destroy();
    res.redirect('/');
})

function checkLogin(req,res,next)
{
    if(req.session.isLogin)
    {
        next();
    }
    else {
        res.redirect('/');
    }
}

module.exports = router;