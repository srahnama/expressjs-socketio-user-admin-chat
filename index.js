var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var chats = {};
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/admin', function(req, res){
    res.sendFile(__dirname + '/admin/index.html');
  });
  
var admin = io.of('/admin'),
    client = io.of('');


admin.on('connection', function(socket){
    users.push(socket.id);
    chats
    console.log('a user connected', users);

    socket.on('disconnect', function(){
        let index = users.indexOf(socket.id);
        users.splice(index, 1);
        console.log('a user disconnected', socket.id);
    });
    socket.on('chat message', function(msg){
        admin.emit('chat message', {"message" : msg.message, 'from' : socket.id});
        client.to(msg.from).emit('chat message', {"message" : msg.message, 'from' : socket.id});
        console.log(socket.id + ' message: ' + msg.message);
    });
    AllChats()
});

client.on('connection', function(socket){
    users.push(socket.id);
    console.log('a user connected', users);

    socket.on('disconnect', function(){
        let index = users.indexOf(socket.id);
        users.splice(index, 1);
        console.log('a user disconnected', socket.id);
    });
    socket.on('chat message', function(msg){

        admin.emit('chat message', {"message" : msg, 'from' : socket.id});
        client.to(socket.id).emit('chat message', {"message" : msg, 'from' : socket.id});
        console.log(socket.id + ' message: ' + msg);
    });
    AllChats();
   
});
function AllChats(){
    IsAdmin()
    for( i = 1 ;i<users.length-1;i++){
        chats[users[0]] = users[i+1];
        chats[users[i+1]] = users[0];
    }
    console.log(chats);
}
function IsAdmin(){
    for( i = 0 ;i<users.length-1;i++){
        if(users[i].search("/admin#")){
            var tmp = users[0];
            users[0] = users[i];
            users[i] = tmp;
        }
    }
}
http.listen(3000, function(){
  console.log('listening on *:3000');
});