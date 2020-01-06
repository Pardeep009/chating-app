
    if(process.env.NODE_ENV !== 'production'){
        require('dotenv').config()
      }

    const express = require('express');
    const app = express();
    const http = require('http').createServer(app);
    const io = require('socket.io')(http);
    const path = require('path');
    const session = require('express-session');
    
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.static(path.join(__dirname,'public')));

    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

    app.use(session({
       saveUnintialized: true,
       secret: `${process.env.secret}`,
    }))

    const mongoose = require('mongoose');
    const messengerdb = `mongodb://localhost/${process.env.databasename}`;

    mongoose.connect(messengerdb);  

    mongoose.connection.on('error',(err) => {
      console.log('DB connection Error');
    })

    mongoose.connection.on('connected',(err) => {
      console.log('DB connected');
    })

    app.use('/',require('./routes/'));

    users = {};

    io.sockets.on('connection',(socket) => { 

      socket.on('new user' , (id,callback) => {
          if(users[id])
          {
            callback(true);
          }
          else {
            users[id] = socket.id;
          }
        })

        socket.on('send message',(obj,callback) => {
          if(users[obj.receiverid])
          {
            io.to(`${users[obj.receiverid]}`).emit('new message', obj);
            callback();
          }
          else {
            console.log('not online');
          }
        })

        socket.on('new group',(groupid,callback) => {
          // console.log(socket.rooms);      
          // if(socket.rooms[groupid.toString()])
          // console.log('joined');
          // else {
            socket.join(groupid.toString());
            // console.log(socket.rooms);
          // }
          // callback('hii');
        })

        socket.on('send message in group' , (obj,callback) => {
          console.log(obj);
          socket.broadcast.to(obj.groupid.toString()).emit('new message in group' , obj);
          callback();
        })

        socket.on('friend in new group' , (obj,callback) => {
          io.to(`${users[obj.friendid]}`).emit('added in new group', obj.groupid);
            callback();
        })
      
      socket.on('disconnect', () => {
        console.log('user disconnected');
        function getKeyByValue(object, value) { 
          return Object.keys(object).find(key =>
            object[key] === value); 
        }

        ans = getKeyByValue(users, socket.id);
        users[ans] = "";

      });

     })

    http.listen(`${process.env.PORT}`,function()
    {
        console.log(`Running on ${process.env.databasename}`);
    })

//     var express = require('express')
// var app = express()
// var server = require('http').createServer(app)
// var io = require('socket.io').listen(server)

// server.listen(3000);

// users = {}

// app.get('/',function(req,res){
//     res.sendFile(__dirname + '/index.html');
// })


// io.sockets.on('connection' ,function(socket){

//     socket.on('new user' , function(data,callback){
//         if(data in users){
//             callback(false)
//         }else{
//             callback(true)
//             socket.nickname = data;
//             users[socket.nickname] = socket
//             // io.sockets.emit('usernames',nicknames)
//             updateNicknames();
//         }
//     })

//     socket.on('send message' , function(data,callback){

//         var msg = data.trim()
//         if(msg.substr(0,3) === '/w ')
//         {
//             msg = msg.substr(3);
//             var ind = msg.indexOf(' ')
//             if(ind != -1)
//             {
//                 var name = msg.substr(0,ind)
//                 var msg = msg.substr(ind+1)
//                 if(name in users)
//                 {
//                     users[name].emit('wisper' ,{msg :msg,nick : socket.nickname})
//                     console.log('wisper')
//                 }
//                 else{
//                     console.log('enter a valid name ')
//                 }
               
//             }
//             else{
//                 callback('please enter the messsg fot wispwr')
//             }
//         }
//         else{
//             io.sockets.emit('new message',{msg: data ,nick : socket.nickname})//will send message includoing me 
//         // io.socket.broadcast.emit('new message' , data)//will send to everyone elese me
//         }
        
//     })

//     socket.on('disconnect',function(data){
//         if(!socket.nickname) return;
//         delete users[socket.nickname]
//         updateNicknames();
//     })
//     function updateNicknames()
//     {
//       io.sockets.emit('usernames',Object.keys(users))

//     }
// })

// var express = require('express')
// var app = express()
// var server = require('http').createServer(app)
// var io = require('socket.io').listen(server)

// server.listen(3000);

// nicknames = []

// app.get('/',function(req,res){
//     res.sendFile(__dirname + '/index.html');
// })


// io.sockets.on('connection' ,function(socket){

//     socket.on('new user' , function(data,callback){
//         if(nicknames.indexOf(data)!=-1){
//             callback(false)
//         }else{
//             callback(true)
//             socket.nickname = data;
//             nicknames.push(socket.nickname)
//             // io.sockets.emit('usernames',nicknames)
//             updateNicknames();
//         }
//     })

//     socket.on('send message' , function(data){
//         io.sockets.emit('new message',{msg: data ,nick : socket.nickname})//will send message includoing me 
//         // io.socket.broadcast.emit('new message' , data)//will send to everyone elese me
//     })

//     socket.on('disconnect',function(data){
//         if(!socket.nickname) return;
//         nicknames.splice(nicknames.indexOf(socket.nickname),1);
//         updateNicknames();
//     })
//     function updateNicknames()
//     {
//       io.sockets.emit('usernames',nicknames)

//     }
// })