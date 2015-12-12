'use strict';

// Net Socket to collect messages(buffer stream) from Paxos Driver
var net = require('net');
var server = net.createServer();
var controller = require('../messageServer/messageController'),
// each user has one messageController instance. It can be easily extended to support multi-user
    messageController = new controller();

server.on('connection', function(socket) {
    socket.on('data', function(data) {
        try {
            var message = JSON.parse(data.toString('ascii'));
            messageController.addMessage(message);
        } catch (error) {
            console.log(error);
        }
    });
    socket.on('error', function(data) {
        console.log(data);
    });
});

server.listen(6000, function() { //'listening' listener
    console.log('server bound');
});



//Http server communicates with front end
var express = require('express'),
    cors = require('cors'),
    app = express(),
    http = require('http').Server(app);

var corsOptions = function(req, callback) {
    var corsoptions = {
        origin: "http://localhost:9000"===req.headers.origin
    };
    callback(null, corsoptions);
};

app.use(cors(corsOptions)); // support cors domain request

app.get('/api/data', function(req, res) {
    if (messageController.messageLogReady()) {
        res.json(messageController.messageLog());
    } else {
        res.json(messageController.emptyMessageLog());
    }
});

app.get('/api/pre/data', function(req, res) {
    res.json(messageController.readMessageLog());
});

app.get('/api/start/:acceptor/:leader/:replica/:client', function(req, res) {
    try{
      var acceptor = parseInt(req.params.acceptor),
          leader = parseInt(req.params.leader),
          replica = parseInt(req.params.replica),
          client = parseInt(req.params.client);
    }catch(error){
          //default setting
          acceptor=3;
          leader=1;
          replica=3;
          client=1;
    }
    messageController.startPaxosDriver(acceptor, leader, replica, client);
    res.json({
        'ready': true
    });
});

http.listen(5000);
console.log('start server 5000')
