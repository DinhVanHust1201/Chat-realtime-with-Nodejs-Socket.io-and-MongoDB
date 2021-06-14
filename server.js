const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/chatMessage');
const mongoClient = require('mongodb').MongoClient;                                                                                             

const dbname = 'chatApp';
const chatCollection = 'chats'; //bộ sưu tập để lưu trữ tất cả các cuộc trò chuyện
const userCollection = 'onlineUsers'; //danh sách người dùng hiện đang trực tuyến

const port = 5000;
const database = 'mongodb://localhost:27017/';
const app = express();

const server=http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New User Logged In with ID '+socket.id);
    
    //Nhận và lưu tin nhắn vào database
    socket.on('chatMessage', (data) =>{ //nhận tin nhắn từ clients cùng thông tin của clients đó
        var dataElement = formatMessage(data);
        mongoClient.connect(database, (err,db) => {
            if (err)
                throw err;
            else {
                var onlineUsers = db.db(dbname).collection(userCollection);
                var chat = db.db(dbname).collection(chatCollection);
                chat.insertOne(dataElement, (err,res) => { //lưu tin nhắn vào database
                    if(err) throw err;
                    socket.emit('message',dataElement); //gửi thông báo tin nhắn cho người nhận
                });
                onlineUsers.findOne({"name":data.toUser}, (err,res) => { //kiểm tra người nhận tin nhắn có online không
                    if(err) throw err;
                    if(res!=null) //nếu người nhận online sẽ nhận được tin nhắn
                        socket.to(res.ID).emit('message',dataElement);
                });
            }
            db.close();
        });

    });

    socket.on('userDetails',(data) => { //kiểm tra xem người nhận đã đăng nhập và nhận được tin nhắn chưa
        mongoClient.connect(database, (err,db) => {
            if(err)
                throw err;
            else {
                var onlineUser = { //tạo đối tượng Json cho clients
                    "ID":socket.id,
                    "name":data.fromUser
                };
                var currentCollection = db.db(dbname).collection(chatCollection);
                var online = db.db(dbname).collection(userCollection);
                online.insertOne(onlineUser,(err,res) =>{ //thêm người đăng nhập vào danh sách clients online
                    if(err) throw err;
                    console.log(onlineUser.name + " is online...");
                });
                currentCollection.find({ //tìm lịch sử trò chuyện giữa 2 clients
                    "from" : { "$in": [data.fromUser, data.toUser] },
                    "to" : { "$in": [data.fromUser, data.toUser] }
                },{projection: {_id:0}}).toArray((err,res) => {
                    if(err)
                        throw err;
                    else {
                        //console.log(res);
                        socket.emit('output',res); //hiện lại lịch sử chat của 2 clients
                    }
                });
            }
            db.close();
        });   
    });  
    var userID = socket.id;
    socket.on('disconnect', () => {
        mongoClient.connect(database, function(err, db) {
            if (err) throw err;
            var onlineUsers = db.db(dbname).collection(userCollection);
            var myquery = {"ID":userID};
            onlineUsers.deleteOne(myquery, function(err, res) { //client ngắt kết nối sẽ xóa khỏi danh sách online 
              if (err) throw err;
              console.log("User " + userID + "went offline...");
              db.close();
            });
          });
    });
});

app.use(express.static(path.join(__dirname,'front')));

server.listen(port, () => {
    console.log(`Chat Server listening to port ${port}...`);
});